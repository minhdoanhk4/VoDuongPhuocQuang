// Định nghĩa kiểu dữ liệu cho Hệ thống Quản lý Võ sinh & Thăng đai Phật Quang Quyền (PQQ)

/**
 * 5 Bậc Cấp Đai Môn Phái Phật Quang Quyền
 * Thứ bậc: Lam Đai -> Lục Đai -> Hồng Đai -> Hoàng Đai -> Bạch Đai
 */
export type BeltRank = 'LAM_DAI' | 'LUC_DAI' | 'HONG_DAI' | 'HOANG_DAI' | 'BACH_DAI';

export interface BeltConfig {
  id: BeltRank;
  name: string; // Tên hiển thị: Lam Đai, Lục Đai, Hồng Đai, Hoàng Đai, Bạch Đai
  vietnameseName: string;
  order: number; // 1 to 5
  colorClass: string; // Tailwind background / text
  bgHex: string;
  textHex: string;
  borderHex: string;
  badgeBg: string;
  maxLevels: number; // Số cấp/gạch trong đai (ví dụ 1, 2, 3)
  description: string;
}

export const BELT_CONFIGS: Record<BeltRank, BeltConfig> = {
  LAM_DAI: {
    id: 'LAM_DAI',
    name: 'Lam Đai',
    vietnameseName: 'Đai Xanh Lam (Sơ Cấp)',
    order: 1,
    colorClass: 'bg-blue-600 text-white',
    bgHex: '#2563eb',
    textHex: '#ffffff',
    borderHex: '#1d4ed8',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    maxLevels: 3,
    description: 'Cấp đai khởi đầu nhập môn, rèn luyện căn bản tấn pháp, quyền pháp và đạo đức võ sinh.'
  },
  LUC_DAI: {
    id: 'LUC_DAI',
    name: 'Lục Đai',
    vietnameseName: 'Đai Xanh Lá (Trung Cấp)',
    order: 2,
    colorClass: 'bg-emerald-600 text-white',
    bgHex: '#059669',
    textHex: '#ffffff',
    borderHex: '#047857',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    maxLevels: 3,
    description: 'Cấp đai trung cấp, rèn luyện thể lực bền bỉ, đối luyện tay không và bài quyền trung cấp.'
  },
  HONG_DAI: {
    id: 'HONG_DAI',
    name: 'Hồng Đai',
    vietnameseName: 'Đai Hồng/Đỏ (Nâng Cao)',
    order: 3,
    colorClass: 'bg-rose-600 text-white',
    bgHex: '#e11d48',
    textHex: '#ffffff',
    borderHex: '#be123c',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    maxLevels: 3,
    description: 'Cấp đai nâng cao, rèn luyện binh khí, công phá, song đấu và chuẩn bị năng lực trợ giảng.'
  },
  HOANG_DAI: {
    id: 'HOANG_DAI',
    name: 'Hoàng Đai',
    vietnameseName: 'Đai Vàng (Huấn Luyện Viên)',
    order: 4,
    colorClass: 'bg-amber-500 text-slate-900',
    bgHex: '#f59e0b',
    textHex: '#0f172a',
    borderHex: '#d97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    maxLevels: 3,
    description: 'Cấp đai huấn luyện viên, đào tạo quyền thuật chuyên sâu, nội lực và tâm đạo phụng sự.'
  },
  BACH_DAI: {
    id: 'BACH_DAI',
    name: 'Bạch Đai',
    vietnameseName: 'Bạch Đai (Thượng Đẳng / Võ Sư)',
    order: 5,
    colorClass: 'bg-slate-100 text-slate-900 border border-slate-400',
    bgHex: '#ffffff',
    textHex: '#0f172a',
    borderHex: '#cbd5e1',
    badgeBg: 'bg-slate-100 text-slate-900 border-slate-400 shadow-sm font-semibold',
    maxLevels: 5,
    description: 'Bạch đai tinh khiết cao quý, hàng Trưởng tràng / Võ sư mẫu mực của Môn phái Phật Quang Quyền.'
  }
};

/**
 * Câu lạc bộ (CLB) trực thuộc Môn phái
 */
export interface Club {
  id: string;
  code: string; // VD: CLB-TTPQ, CLB-HN, CLB-HCM
  name: string; // CLB Thiền Tôn Phật Quang, CLB Hà Nội...
  coach?: string; // Trưởng CLB / HLV phụ trách
  phone?: string;
  email?: string;
  address: string; // Nơi thành lập / Địa chỉ
  establishedDate: string; // Tháng, Năm thành lập (YYYY-MM hoặc YYYY-MM-DD)
  trainingSchedule?: string[]; // Thời gian tập võ (Thứ 2 - Chủ Nhật)
  trainingTime?: string; // Khung giờ tập (VD: 17:30 - 19:30)
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Trạng thái võ sinh
 */
export type StudentStatus = 'ACTIVE' | 'LEAVE' | 'TRANSFERRED' | 'SUSPENDED' | 'INACTIVE';

/**
 * Hồ sơ Võ sinh
 */
export interface Student {
  id: string;
  code: string; // Mã võ sinh: PQQ-CLB-2026-001
  fullName: string;
  dharmaName?: string; // Pháp danh (nếu có)
  dob: string; // YYYY-MM-DD
  birthYear?: number | string; // Năm sinh (VD: 2005)
  gender: 'Nam' | 'Nữ' | 'Khác';
  phone: string;
  email?: string;
  address: string; // Địa chỉ
  birthPlace?: string; // Nơi sinh (VD: Bà Rịa - Vũng Tàu, Đồng Nai, TP. Hồ Chí Minh...)
  clubId: string; // Liên kết tới Club.id
  unitName?: string; // Đơn vị (VD: CLB Phước Quang 1,...)
  currentBelt: BeltRank; // Cấp đai hiện tại
  currentBeltLevel: number; // Cấp/Gạch (1, 2, 3...)
  diplomaName?: string; // Văn bằng (VD: Lam Đai Cấp 3 / Số hiệu VB)
  diplomaIssueDate?: string; // Ngày cấp văn bằng
  diplomaIssuePlace?: string; // Nơi cấp (VD: Bà Rịa - Vũng Tàu)
  diplomaIssuingAuthority?: string; // Cơ quan cấp (VD: Môn Phái Phật Quang Quyền)
  educationLevel?: string; // Trình độ văn hóa (VD: 12/12, Đại học, THPT, THCS...)
  coachName?: string; // Huấn luyện viên trực tiếp (VD: HLV Tuệ Minh)
  joinDate: string; // Ngày nhập môn
  lastPromotionDate?: string; // Ngày thăng đai gần nhất
  avatar?: string;
  avatarUrl?: string; // Ảnh thẻ
  status: StudentStatus;
  attendanceRate?: number; // Tỷ lệ chuyên cần (ví dụ: 95 = 95%)
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Trạng thái Kỳ thi / Đợt thi
 */
export type ExamStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

/**
 * Kỳ thi Thăng đai theo đợt
 */
export interface ExamSession {
  id: string;
  sessionCode: string; // VD: KT-2026-01
  name: string; // Tên đợt thi: "Khóa Thi Thăng Đai Thu Đông 2026"
  examDate: string; // Ngày thi
  location: string; // Địa điểm thi
  examinerCouncil: string; // Hội đồng giám khảo
  status: ExamStatus;
  notes?: string;
  totalCandidates?: number;
  passedCandidates?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Kết quả thi thăng đai & Video bài thi
 */
export type ExamResult = 'PASS' | 'FAIL' | 'PENDING' | 'DISTINCTION';
export type VideoExamResult = 'PENDING' | 'PASS' | 'FAIL';

/**
 * Quản lý Video nộp bài thi và chấm điểm đạt/không đạt
 */
export interface VideoSubmission {
  id: string;
  examId?: string; // Khóa thi đăng ký
  studentId: string; // Khóa ngoại Student.id
  studentName: string;
  clubId: string; // Khóa ngoại Club.id
  targetBelt: BeltRank; // Cấp đai thi lên
  targetBeltLevel: number;
  content: string; // Tên bài thi (VD: Thập Nhị Phân Thế, Bát Đoạn Quyền, Song Luyện Côn...)
  videoUrl: string; // Link YouTube / Google Drive / MP4
  submittedAt: string; // Ngày nộp
  status: VideoExamResult; // PENDING: Chờ chấm | PASS: Đạt | FAIL: Không đạt
  judgeNote?: string; // Nhận xét của Giám khảo
  reviewerName?: string; // Giám khảo chấm
  reviewedAt?: string; // Ngày chấm
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Phiếu đăng ký dự thi Thăng đai (Exam Sheet / Registration)
 */
export interface ExamSheet {
  id: string;
  examId: string; // Khóa ngoại ExamSession.id
  studentId: string; // Khóa ngoại Student.id
  targetBelt: BeltRank; // Cấp đai đăng ký thi lên
  targetBeltLevel: number; // Cấp/gạch thi lên
  result: ExamResult; // Kết quả: PASS (Đạt) / FAIL (Không đạt) / PENDING (Chờ duyệt)
  videoSubmissionId?: string; // Mã video nộp bài thi
  videoUrl?: string; // Link video bài thi
  examiners?: string; // Tên giám khảo chấm
  notes?: string; // Nhận xét của giám khảo
  createdAt?: string;
  updatedAt?: string;

  // Điểm thành phần (không bắt buộc, để tương thích dữ liệu cũ)
  scoreCanBan?: number;
  scoreBaiQuyen?: number;
  scoreBinhKhi?: number;
  scoreTheLuc?: number;
  scoreDoiKhang?: number;
  scoreLyThuyet?: number;
  totalScore?: number;
  averageScore?: number;
}

/**
 * Văn bằng Thăng đai (Certificate)
 */
export interface Certificate {
  id: string;
  certNumber: string; // Số hiệu bằng: VB-PQQ-2026-001
  studentId: string; // Khóa ngoại Student.id
  examId: string; // Khóa ngoại ExamSession.id
  beltConferred: BeltRank; // Cấp đai được cấp
  beltLevel: number; // Cấp/Gạch được cấp
  issueDate: string; // Ngày ký cấp
  signerTitle: string; // Chức danh người ký (Võ sư Chưởng môn / Trưởng ban Chuyên môn)
  signerName: string; // Họ tên người ký
  decisionNumber: string; // Quyết định công nhận số
  qrCode?: string; // Chuỗi định danh tra cứu văn bằng
  status: 'ACTIVE' | 'REVOKED';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Cấu hình Hệ thống & Google Sheet
 */
export interface AppSettings {
  googleSheetScriptUrl: string;
  googleSheetUrl?: string;
  googleSheetId?: string;
  secretToken: string;
  lastSyncedAt?: string;
  isAutoSync: boolean;
  internalPin: string; // Mã PIN mở khóa nội bộ
  masterTitle: string; // Môn phái Phật Quang Quyền
  masterSignerName: string; // Tên võ sư chưởng quản
  masterSignerTitle: string; // Chức danh
}

/**
 * Quyền hạn người dùng nội bộ
 */
export type UserRole = 'ADMIN' | 'COACH' | 'EXAMINER';

export interface InternalUser {
  role: UserRole;
  name: string;
  clubId?: string; // Nếu là HLV thì gắn với 1 CLB
  isUnlocked: boolean;
}

/**
 * Trạng thái điểm danh
 */
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';

/**
 * Bản ghi điểm danh võ sinh
 */
export interface AttendanceRecord {
  id: string;
  clubId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  session: string; // Buổi tập (Sáng, Chiều, Tối...)
  status: AttendanceStatus; // PRESENT, ABSENT, EXCUSED, LATE
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
