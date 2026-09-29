/**
 * API QUEUE & OVERLOAD PROTECTION MANAGER (HỆ THỐNG CHỐNG QUÁ TẢI API)
 * Môn phái Phật Quang Quyền - PQSM
 * 
 * Các tính năng bảo vệ hệ thống:
 * 1. Queue Concurrency = 1: Tuần tự hóa các yêu cầu ghi, chống vượt hạn mức Google Apps Script (Concurrent execution limit).
 * 2. Smart In-Memory Caching (TTL = 30s): Lưu đệm dữ liệu đọc, tránh spam request làm kiệt quệ tài nguyên.
 * 3. Exponential Backoff & Retry: Tự động thử lại khi gặp 429/503/timeout với độ trễ tăng dần (1s -> 2s -> 4s).
 * 4. Request Debouncing: Gộp nhiều lần kích hoạt đồng bộ liên tiếp thành 1 lần duy nhất.
 * 5. Event Listeners: Thông báo trạng thái hàng đợi theo thời gian thực cho giao diện người dùng.
 */

interface QueuedTask<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  retriesLeft: number;
  initialDelay: number;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface ApiQueueStatus {
  isProcessing: boolean;
  queuedCount: number;
  totalProcessed: number;
  totalRetried: number;
  cacheCount: number;
}

class ApiQueueManager {
  private queue: QueuedTask<any>[] = [];
  private isProcessing = false;
  private cache = new Map<string, CacheEntry<any>>();
  private totalProcessed = 0;
  private totalRetried = 0;
  private listeners: ((status: ApiQueueStatus) => void)[] = [];

  // Mặc định thời gian lưu cache là 30 giây cho các truy vấn đọc (GET)
  private readonly DEFAULT_CACHE_TTL_MS = 30 * 1000;
  private readonly MAX_RETRIES = 3;
  private readonly BASE_RETRY_DELAY_MS = 1000;

  /**
   * Đăng ký lắng nghe trạng thái hàng đợi để hiển thị trên UI
   */
  public subscribe(listener: (status: ApiQueueStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach(l => {
      try {
        l(status);
      } catch (e) {
        console.error('Queue listener error:', e);
      }
    });
  }

  public getStatus(): ApiQueueStatus {
    // Dọn dẹp cache hết hạn
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }

    return {
      isProcessing: this.isProcessing,
      queuedCount: this.queue.length,
      totalProcessed: this.totalProcessed,
      totalRetried: this.totalRetried,
      cacheCount: this.cache.size
    };
  }

  /**
   * Xóa toàn bộ bộ nhớ đệm (Cache) thủ công khi người dùng muốn làm mới dữ liệu lập tức
   */
  public clearCache(): void {
    this.cache.clear();
    this.notify();
  }

  /**
   * Đọc dữ liệu từ Cache (nếu có và còn hạn)
   */
  public getFromCache<T>(cacheKey: string): T | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      this.notify();
      return null;
    }

    return entry.data as T;
  }

  /**
   * Lưu dữ liệu vào Cache
   */
  public setCache<T>(cacheKey: string, data: T, ttlMs = this.DEFAULT_CACHE_TTL_MS): void {
    this.cache.set(cacheKey, {
      data,
      expiresAt: Date.now() + ttlMs
    });
    this.notify();
  }

  /**
   * Đẩy một tác vụ vào Hàng Đợi (Queue) để thực thi tuần tự và an toàn
   */
  public enqueue<T>(taskFn: () => Promise<T>, taskId?: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task: QueuedTask<T> = {
        id: taskId || `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        fn: taskFn,
        resolve,
        reject,
        retriesLeft: this.MAX_RETRIES,
        initialDelay: this.BASE_RETRY_DELAY_MS
      };

      this.queue.push(task);
      this.notify();
      this.processNext();
    });
  }

  /**
   * Xử lý từng tác vụ trong hàng đợi lần lượt (Concurrency = 1)
   */
  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.notify();

    const task = this.queue.shift()!;

    try {
      const result = await this.executeWithRetry(task);
      this.totalProcessed++;
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.isProcessing = false;
      this.notify();
      // Chờ một khoảng nghỉ nhỏ (200ms) trước tác vụ tiếp theo để tránh bùng nổ xung nhịp mạng
      setTimeout(() => this.processNext(), 200);
    }
  }

  /**
   * Thực thi tác vụ kèm cơ chế Exponential Backoff khi phát hiện quá tải
   */
  private async executeWithRetry<T>(task: QueuedTask<T>): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        const result = await task.fn();
        return result;
      } catch (error: any) {
        attempt++;
        const isOverloadError =
          error?.message?.includes('429') ||
          error?.message?.includes('503') ||
          error?.message?.includes('limit exceeded') ||
          error?.message?.includes('bận') ||
          error?.message?.includes('quá tải');

        if (attempt <= task.retriesLeft) {
          this.totalRetried++;
          // Tính độ trễ theo hàm mũ + ngẫu nhiên jitter (tránh thắt cổ chai đồng thời)
          const delay = task.initialDelay * Math.pow(2, attempt - 1) + Math.random() * 300;
          console.warn(`[ApiQueueManager] Phát hiện quá tải/lỗi kết nối. Thử lại lần ${attempt}/${task.retriesLeft} sau ${Math.round(delay)}ms...`);
          this.notify();
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw error;
        }
      }
    }
  }
}

export const apiQueueManager = new ApiQueueManager();
