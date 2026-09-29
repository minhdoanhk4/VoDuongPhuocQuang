import { ExamResult, StudentStatus, Student, Club, AttendanceRecord } from '../types';

/**
 * Định dạng ngày YYYY-MM-DD sang DD/MM/YYYY
 */
export function formatDateVN(dateStr?: string): string {
  if (!dateStr) return '---';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('vi-VN');
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Tính điểm trung bình và kết quả thi
 */
export function calculateExamResult(scores: {
  scoreCanBan: number;
  scoreBaiQuyen: number;
  scoreBinhKhi: number;
  scoreTheLuc: number;
  scoreDoiKhang: number;
  scoreLyThuyet: number;
}): { totalScore: number; averageScore: number; result: ExamResult } {
  const list = [
    scores.scoreCanBan || 0,
    scores.scoreBaiQuyen || 0,
    scores.scoreBinhKhi || 0,
    scores.scoreTheLuc || 0,
    scores.scoreDoiKhang || 0,
    scores.scoreLyThuyet || 0
  ];

  const totalScore = parseFloat(list.reduce((a, b) => a + b, 0).toFixed(1));
  const averageScore = parseFloat((totalScore / list.length).toFixed(1));

  const hasCriticallyLowScore = list.some(score => score < 3.0);

  let result: ExamResult = 'FAIL';
  if (averageScore >= 8.5 && !hasCriticallyLowScore) {
    result = 'DISTINCTION';
  } else if (averageScore >= 5.0 && !hasCriticallyLowScore) {
    result = 'PASS';
  }

  return { totalScore, averageScore, result };
}

/**
 * Nhãn hiển thị kết quả thi
 */
export function getResultBadge(result: ExamResult): { label: string; className: string } {
  switch (result) {
    case 'DISTINCTION':
      return {
        label: 'Thủ Khoa / Xuất Sắc',
        className: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
      };
    case 'PASS':
      return {
        label: 'Đạt Chuẩn Thăng Đai',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium'
      };
    case 'FAIL':
      return {
        label: 'Chưa Đạt',
        className: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    default:
      return {
        label: 'Chờ Chấm Điểm',
        className: 'bg-slate-100 text-slate-700 border-slate-300'
      };
  }
}

/**
 * Nhãn trạng thái võ sinh
 */
export function getStudentStatusBadge(status: StudentStatus): { label: string; className: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Đang Tập Luyện', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'LEAVE':
      return { label: 'Nghỉ Tạm Thời', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'TRANSFERRED':
      return { label: 'Chuyển CLB', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'SUSPENDED':
      return { label: 'Đình Chỉ', className: 'bg-rose-100 text-rose-800 border-rose-200' };
    default:
      return { label: 'Khác', className: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}

/**
 * Nhãn trạng thái hiển thị chuẩn cho Danh sách Võ sinh CLB:
 * Còn học (ACTIVE) | Tạm nghỉ (LEAVE / SUSPENDED) | Nghỉ (INACTIVE / TRANSFERRED)
 */
export function getStudentRosterStatusBadge(status: StudentStatus): { label: string; className: string } {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Còn học',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    case 'LEAVE':
    case 'SUSPENDED':
      return {
        label: 'Tạm nghỉ',
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    case 'INACTIVE':
    case 'TRANSFERRED':
    default:
      return {
        label: 'Nghỉ',
        className: 'bg-slate-100 text-slate-600 border-slate-200'
      };
  }
}

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu (chuẩn ASCII)
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Format mã hiển thị võ sinh theo cú pháp: [TênVõSinh + MãCLB] (Ví dụ: [DuyPQ1])
 * Đảm bảo KHÔNG CÓ DẤU (không dấu tiếng Việt) theo yêu cầu người dùng
 */
export function formatStudentClubCode(student: Student, club?: Club): string {
  // Lấy tên chính của võ sinh (từ cuối cùng trong họ tên)
  const nameParts = (student.fullName || '').trim().split(/\s+/);
  const rawGivenName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : 'VS';

  // Chuyển đổi tên võ sinh thành KHÔNG CÓ DẤU, chỉ giữ chữ cái và số
  const cleanName = removeVietnameseTones(rawGivenName).replace(/[^a-zA-Z0-9]/g, '');
  const givenName = cleanName
    ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase()
    : 'VS';

  // Lấy mã CLB ngắn gọn (VD: CLB-PQ1 -> PQ1, CLB-PQ2 -> PQ2, CLB-LB -> LB, CLB-LD -> LD, CLB-XL -> XL)
  let clubCode = 'PQ1';
  if (club?.code) {
    clubCode = club.code.replace(/^CLB-?/i, '').toUpperCase();
  } else if (student.clubId) {
    clubCode = student.clubId.replace(/^clb-?/i, '').toUpperCase();
  }
  clubCode = removeVietnameseTones(clubCode).replace(/[^a-zA-Z0-9]/g, '');

  return `[${givenName}${clubCode}]`;
}

/**
 * Format tên hiển thị CLB: (PQ1/PQ2... - Võ Đường Trí Vũ)
 */
export function formatStudentClubAffiliation(student: Student, club?: Club): string {
  let clubCode = 'PQ1';
  if (club?.code) {
    clubCode = club.code.replace(/^CLB-?/i, '').toUpperCase();
  } else if (student.clubId) {
    clubCode = student.clubId.replace(/^clb-?/i, '').toUpperCase();
  }

  const branchName = student.unitName || club?.name || 'Võ Đường Trí Vũ';
  return `${clubCode} - ${branchName}`;
}

/**
 * Tính tỷ lệ chuyên cần theo tháng (%)
 */
export function calculateStudentAttendanceRate(
  studentId: string,
  attendanceRecords: AttendanceRecord[],
  targetMonth?: string
): number {
  const currentMonth = targetMonth || new Date().toISOString().slice(0, 7);
  const monthly = attendanceRecords.filter(
    a => a.studentId === studentId && a.date.startsWith(currentMonth)
  );

  if (monthly.length > 0) {
    const presentCount = monthly.filter(a => a.status === 'PRESENT').length;
    return Math.round((presentCount / monthly.length) * 100);
  }

  // Nếu tháng chưa có dữ liệu, tính dựa trên toàn bộ lịch sử nếu có
  const allRecords = attendanceRecords.filter(a => a.studentId === studentId);
  if (allRecords.length > 0) {
    const presentCount = allRecords.filter(a => a.status === 'PRESENT').length;
    return Math.round((presentCount / allRecords.length) * 100);
  }

  // Tỷ lệ chuyên cần mặc định khi vừa khởi tạo
  return 100;
}

/**
 * Sinh mã ngẫu nhiên có tiền tố
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

