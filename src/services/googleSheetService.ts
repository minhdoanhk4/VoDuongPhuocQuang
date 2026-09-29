import { Certificate, Club, ExamSession, ExamSheet, Student } from '../types';
import { apiQueueManager } from './apiQueueManager';

export interface SyncPayload {
  clubs?: Club[];
  students?: Student[];
  exams?: ExamSession[];
  examSheets?: ExamSheet[];
  certificates?: Certificate[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  fromCache?: boolean;
}

export const googleSheetService = {
  /**
   * Kiểm tra kết nối tới Google Apps Script Web App (chạy qua hàng đợi chống quá tải)
   */
  async testConnection(scriptUrl: string, token: string): Promise<ApiResponse> {
    if (!scriptUrl) {
      return { success: false, error: 'Chưa cấu hình URL Google Apps Script!' };
    }

    return apiQueueManager.enqueue(async () => {
      try {
        const url = new URL(scriptUrl);
        url.searchParams.append('action', 'ping');
        if (token) url.searchParams.append('token', token);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          return {
            success: false,
            error: `Máy chủ Google phản hồi mã lỗi HTTP: ${response.status} (${response.statusText})`
          };
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        return {
          success: false,
          error: `Không thể kết nối đến Google Sheets: ${err.message || 'Lỗi mạng hoặc CORS'}. Hãy đảm bảo bạn đã cấp quyền truy cập "Anyone" khi Triển khai Web App.`
        };
      }
    }, 'test-connection');
  },

  /**
   * Yêu cầu Google Apps Script tự tạo cấu trúc các Sheet
   */
  async initSheets(scriptUrl: string, token: string): Promise<ApiResponse> {
    return apiQueueManager.enqueue(async () => {
      try {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'initSheets',
            token
          })
        });
        return await response.json();
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }, 'init-sheets');
  },

  /**
   * Tải toàn bộ dữ liệu từ Google Sheets về Web App
   * Có tích hợp bộ nhớ đệm (Cache 30s) chống spam tải quá mức
   */
  async fetchAllData(
    scriptUrl: string,
    token: string,
    forceRefresh = false
  ): Promise<ApiResponse<{
    students: Student[];
    exams: ExamSession[];
    examSheets: ExamSheet[];
    certificates: Certificate[];
    clubs: Club[];
  }>> {
    if (!scriptUrl) {
      return { success: false, error: 'Chưa cấu hình URL Google Apps Script!' };
    }

    const cacheKey = `fetchAllData_${scriptUrl.trim()}`;

    // Kiểm tra cache nếu không yêu cầu làm mới bắt buộc
    if (!forceRefresh) {
      const cached = apiQueueManager.getFromCache<any>(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }

    return apiQueueManager.enqueue(async () => {
      try {
        const url = new URL(scriptUrl);
        url.searchParams.append('action', 'getAllData');
        if (token) url.searchParams.append('token', token);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} (${response.statusText})`);
        }

        const res = await response.json();
        if (res && res.success) {
          // Lưu cache trong 30 giây để ngăn chặn các request liên tiếp làm nghẽn server
          apiQueueManager.setCache(cacheKey, res, 30 * 1000);
        }
        return res;
      } catch (err: any) {
        return { success: false, error: `Tải dữ liệu thất bại: ${err.message}` };
      }
    }, 'fetch-all-data');
  },

  /**
   * Đẩy toàn bộ dữ liệu từ Web App lên lưu trữ trên Google Sheets
   * Tự động xóa cache và thực thi qua hàng đợi tuần tự chống xung đột
   */
  async syncAllData(scriptUrl: string, token: string, payload: SyncPayload): Promise<ApiResponse> {
    if (!scriptUrl) {
      return { success: false, error: 'Chưa cấu hình URL Google Apps Script!' };
    }

    return apiQueueManager.enqueue(async () => {
      try {
        // Dùng Content-Type text/plain để tránh preflight OPTIONS CORS phức tạp trên Google Apps Script
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            action: 'syncAll',
            token,
            data: payload
          })
        });

        if (!response.ok) {
          throw new Error(`Lỗi HTTP ${response.status}`);
        }

        const result = await response.json();
        // Xóa cache đọc sau khi ghi thành công để đảm bảo dữ liệu luôn mới nhất
        apiQueueManager.clearCache();
        return result;
      } catch (err: any) {
        return { success: false, error: `Lỗi đồng bộ dữ liệu: ${err.message}` };
      }
    }, 'sync-all-data');
  },

  /**
   * Lưu hoặc sửa đổi một bản ghi đơn lẻ
   */
  async saveSingleRecord(scriptUrl: string, token: string, action: string, data: any): Promise<ApiResponse> {
    if (!scriptUrl) return { success: false, error: 'Chưa có URL' };

    return apiQueueManager.enqueue(async () => {
      try {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, token, data })
        });
        const res = await response.json();
        apiQueueManager.clearCache();
        return res;
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }, `save-${action}`);
  },

  /**
   * Xóa một bản ghi đơn lẻ
   */
  async deleteSingleRecord(scriptUrl: string, token: string, action: string, id: string): Promise<ApiResponse> {
    if (!scriptUrl) return { success: false, error: 'Chưa có URL' };

    return apiQueueManager.enqueue(async () => {
      try {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, token, id })
        });
        const res = await response.json();
        apiQueueManager.clearCache();
        return res;
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }, `delete-${action}`);
  }
};
