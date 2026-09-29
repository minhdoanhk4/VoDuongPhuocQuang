import { AppSettings, AttendanceRecord, Certificate, Club, ExamSession, ExamSheet, Student, VideoSubmission } from '../types';

const STORAGE_KEYS = {
  CLUBS: 'pqq_clubs_v2',
  STUDENTS: 'pqq_students_v2',
  EXAMS: 'pqq_exams_v2',
  EXAM_SHEETS: 'pqq_exam_sheets_v2',
  CERTIFICATES: 'pqq_certificates_v2',
  ATTENDANCE: 'pqq_attendance_v2',
  VIDEOS: 'pqq_videos_v2',
  SETTINGS: 'pqq_settings_v2',
  PERMANENT_SHEET: 'pqq_permanent_sheet_config'
};

// 5 Câu Lạc Bộ Chuẩn của Môn Phái Phật Quang Quyền theo yêu cầu
export const INITIAL_CLUBS: Club[] = [
  {
    id: 'clb-pq1',
    code: 'CLB-PQ1',
    name: 'CLB Phước Quang 1',
    coach: 'Võ sư Thích Tâm Thiện',
    phone: '0903112233',
    email: 'phuocquang1.pqq@gmail.com',
    address: 'Tổ đình Thiền Tôn Phật Quang, Tân Hòa, Phú Mỹ, Bà Rịa - Vũng Tàu',
    establishedDate: '2012-03-15',
    trainingSchedule: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    trainingTime: '17:30 - 19:30',
    notes: 'Câu lạc bộ cội nguồn Phước Quang 1'
  },
  {
    id: 'clb-pq2',
    code: 'CLB-PQ2',
    name: 'CLB Phước Quang 2',
    coach: 'HLV Nguyễn Tuệ Minh',
    phone: '0912345678',
    email: 'phuocquang2.pqq@gmail.com',
    address: 'Cơ sở Phước Quang 2, Thị xã Phú Mỹ, Bà Rịa - Vũng Tàu',
    establishedDate: '2016-08-20',
    trainingSchedule: ['Thứ 3', 'Thứ 5', 'Thứ 7'],
    trainingTime: '18:00 - 20:00',
    notes: 'Phân nhánh Phước Quang 2'
  },
  {
    id: 'clb-lb',
    code: 'CLB-LB',
    name: 'CLB Linh Bửu',
    coach: 'HLV Trần Quang Dũng',
    phone: '0988776655',
    email: 'linhbuu.pqq@gmail.com',
    address: 'Chùa Linh Bửu, Xã Phước Thái, Huyện Long Thành, Đồng Nai',
    establishedDate: '2017-05-10',
    trainingSchedule: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    trainingTime: '17:30 - 19:30',
    notes: 'CLB Phật Quang Quyền Linh Bửu'
  },
  {
    id: 'clb-ld',
    code: 'CLB-LD',
    name: 'CLB Long Đức',
    coach: 'HLV Lê Đức Trí',
    phone: '0935112233',
    email: 'longduc.pqq@gmail.com',
    address: 'Khu dân cư Long Đức, Huyện Long Thành, Đồng Nai',
    establishedDate: '2019-10-12',
    trainingSchedule: ['Thứ 3', 'Thứ 5', 'Chủ Nhật'],
    trainingTime: '17:30 - 19:30',
    notes: 'CLB Phật Quang Quyền Long Đức'
  },
  {
    id: 'clb-xl',
    code: 'CLB-XL',
    name: 'CLB Xuân Lộc',
    coach: 'HLV Phạm Minh Hùng',
    phone: '0944556677',
    email: 'xuanloc.pqq@gmail.com',
    address: 'Thị trấn Gia Ray, Huyện Xuân Lộc, Tỉnh Đồng Nai',
    establishedDate: '2021-04-18',
    trainingSchedule: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    trainingTime: '18:00 - 20:00',
    notes: 'CLB Phật Quang Quyền Xuân Lộc'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // CLB Phước Quang 1
  {
    id: 'std-1',
    code: 'PQQ-PQ1-001',
    fullName: 'Lê Hoàng Long',
    dob: '1990-06-15',
    birthYear: 1990,
    gender: 'Nam',
    phone: '0909111222',
    email: 'hoanglong@pqq.vn',
    address: 'Tân Hòa, Phú Mỹ, BR-VT',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'BACH_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Bạch Đai (Đẳng 2)',
    diplomaIssueDate: '2024-12-15',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Đại học',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2012-05-01',
    lastPromotionDate: '2024-12-15',
    status: 'ACTIVE',
    notes: 'Trợ lý Trưởng ban Chuyên môn Môn phái'
  },
  {
    id: 'std-1a',
    code: 'PQQ-PQ1-002',
    fullName: 'Nguyễn Văn Duy',
    dob: '2004-03-12',
    birthYear: 2004,
    gender: 'Nam',
    phone: '0901234567',
    address: 'Khu phố Vạn Hạnh, Phú Mỹ, BR-VT',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Lam Đai Cấp 2',
    diplomaIssueDate: '2025-06-20',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Đại học Bách Khoa',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2023-08-10',
    lastPromotionDate: '2025-06-20',
    status: 'ACTIVE'
  },
  {
    id: 'std-2',
    code: 'PQQ-PQ1-003',
    fullName: 'Đặng Thanh Thảo',
    dob: '2005-02-28',
    birthYear: 2005,
    gender: 'Nữ',
    phone: '0933445566',
    address: 'Phú Mỹ, BR-VT',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LUC_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Lục Đai Cấp 2',
    diplomaIssueDate: '2025-06-20',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '12/12',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2022-01-15',
    lastPromotionDate: '2025-06-20',
    status: 'ACTIVE'
  },
  {
    id: 'std-3',
    code: 'PQQ-PQ1-004',
    fullName: 'Nguyễn Văn Khang',
    dob: '2008-05-19',
    birthYear: 2008,
    gender: 'Nam',
    phone: '0908889911',
    address: 'Bà Rịa, BR-VT',
    birthPlace: 'TP. Hồ Chí Minh',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 3,
    diplomaName: 'Lam Đai Cấp 3',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '10/12',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2023-03-01',
    lastPromotionDate: '2025-11-15',
    status: 'ACTIVE'
  },
  {
    id: 'std-1b',
    code: 'PQQ-PQ1-005',
    fullName: 'Trần Minh Tuấn',
    dob: '2006-08-20',
    birthYear: 2006,
    gender: 'Nam',
    phone: '0908765432',
    address: 'Long Thành, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LUC_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Lục Đai Cấp 1',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '12/12',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2023-04-15',
    status: 'ACTIVE'
  },
  {
    id: 'std-1c',
    code: 'PQQ-PQ1-006',
    fullName: 'Lê Thị Mai Anh',
    dob: '2007-11-15',
    birthYear: 2007,
    gender: 'Nữ',
    phone: '0912344321',
    address: 'Tân Thành, BR-VT',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Lam Đai Cấp 1',
    diplomaIssueDate: '2025-06-20',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '11/12',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2024-01-10',
    status: 'SUSPENDED'
  },
  {
    id: 'std-1d',
    code: 'PQQ-PQ1-007',
    fullName: 'Hoàng Quốc Bảo',
    dob: '2005-04-05',
    birthYear: 2005,
    gender: 'Nam',
    phone: '0933221144',
    address: 'Thủ Dầu Một, Bình Dương',
    birthPlace: 'Bình Dương',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'HONG_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Hồng Đai Cấp 1',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Đại học',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2020-07-20',
    lastPromotionDate: '2025-11-15',
    status: 'ACTIVE'
  },
  {
    id: 'std-1e',
    code: 'PQQ-PQ1-008',
    fullName: 'Phạm Ngọc Linh',
    dob: '2008-09-09',
    birthYear: 2008,
    gender: 'Nữ',
    phone: '0977665544',
    address: 'Thị xã Phú Mỹ, BR-VT',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 3,
    diplomaName: 'Lam Đai Cấp 3',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '10/12',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2023-05-12',
    status: 'ACTIVE'
  },
  {
    id: 'std-1f',
    code: 'PQQ-PQ1-009',
    fullName: 'Vũ Đình Trọng',
    dob: '2003-12-18',
    birthYear: 2003,
    gender: 'Nam',
    phone: '0988112233',
    address: 'Quận Cầu Giấy, Hà Nội',
    birthPlace: 'Hà Nội',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'HOANG_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Hoàng Đai Cấp 1',
    diplomaIssueDate: '2025-06-20',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Cử nhân Thể thao',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2019-03-10',
    lastPromotionDate: '2025-06-20',
    status: 'ACTIVE'
  },
  {
    id: 'std-1g',
    code: 'PQQ-PQ1-010',
    fullName: 'Đỗ Thành Nam',
    dob: '2006-02-14',
    birthYear: 2006,
    gender: 'Nam',
    phone: '0919283746',
    address: 'Biên Hòa, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LUC_DAI',
    currentBeltLevel: 3,
    diplomaName: 'Lục Đai Cấp 3',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '12/12',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2022-08-01',
    status: 'ACTIVE'
  },
  {
    id: 'std-1h',
    code: 'PQQ-PQ1-011',
    fullName: 'Nguyễn Thị Kim Yến',
    dob: '2009-05-23',
    birthYear: 2009,
    gender: 'Nữ',
    phone: '0909554433',
    address: 'Tân Hòa, Phú Mỹ, BR-VT',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Lam Đai Cấp 1',
    diplomaIssueDate: '2025-01-10',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '9/12',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2024-02-15',
    status: 'INACTIVE'
  },
  {
    id: 'std-1i',
    code: 'PQQ-PQ1-012',
    fullName: 'Bùi Hữu Phước',
    dob: '2005-07-07',
    birthYear: 2005,
    gender: 'Nam',
    phone: '0944332211',
    address: 'Quận 1, TP. Hồ Chí Minh',
    birthPlace: 'TP. Hồ Chí Minh',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LUC_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Lục Đai Cấp 2',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Đại học',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2022-10-10',
    status: 'ACTIVE'
  },
  {
    id: 'std-1k',
    code: 'PQQ-PQ1-013',
    fullName: 'Ngô Đình Khôi',
    dob: '2007-01-30',
    birthYear: 2007,
    gender: 'Nam',
    phone: '0933557799',
    address: 'Thị xã Phú Mỹ, BR-VT',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq1',
    unitName: 'Võ Đường Trí Vũ',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Lam Đai Cấp 2',
    diplomaIssueDate: '2025-06-20',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '11/12',
    coachName: 'Võ sư Thích Tâm Thiện',
    joinDate: '2023-09-01',
    status: 'ACTIVE'
  },

  // CLB Phước Quang 2
  {
    id: 'std-4',
    code: 'PQQ-PQ2-004',
    fullName: 'Nguyễn Tuệ Minh',
    dob: '1992-03-24',
    birthYear: 1992,
    gender: 'Nam',
    phone: '0912345678',
    address: 'Phú Mỹ, Bà Rịa - Vũng Tàu',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq2',
    unitName: 'CLB Phước Quang 2',
    currentBelt: 'HOANG_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Hoàng Đai Cấp 2',
    diplomaIssueDate: '2025-06-20',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Đại học Sư phạm TDTT',
    coachName: 'HLV Nguyễn Tuệ Minh',
    joinDate: '2016-04-10',
    lastPromotionDate: '2025-06-20',
    status: 'ACTIVE',
    notes: 'Trưởng CLB Phước Quang 2'
  },
  {
    id: 'std-5',
    code: 'PQQ-PQ2-005',
    fullName: 'Phan Thảo Vy',
    dob: '2009-10-10',
    birthYear: 2009,
    gender: 'Nữ',
    phone: '0922334455',
    address: 'Tân Thành, BR-VT',
    birthPlace: 'Bà Rịa - Vũng Tàu',
    clubId: 'clb-pq2',
    unitName: 'CLB Phước Quang 2',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Lam Đai Cấp 2',
    diplomaIssueDate: '2026-01-10',
    diplomaIssuePlace: 'Bà Rịa - Vũng Tàu',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '9/12',
    coachName: 'HLV Nguyễn Tuệ Minh',
    joinDate: '2023-09-15',
    lastPromotionDate: '2026-01-10',
    status: 'ACTIVE'
  },

  // CLB Linh Bửu
  {
    id: 'std-6',
    code: 'PQQ-LB-006',
    fullName: 'Trần Quang Dũng',
    dob: '1993-09-18',
    birthYear: 1993,
    gender: 'Nam',
    phone: '0988776655',
    address: 'Phước Thái, Long Thành, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-lb',
    unitName: 'CLB Linh Bửu',
    currentBelt: 'HOANG_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Hoàng Đai Cấp 1',
    diplomaIssueDate: '2025-06-20',
    diplomaIssuePlace: 'Đồng Nai',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Cử nhân Võ học',
    coachName: 'HLV Trần Quang Dũng',
    joinDate: '2017-06-15',
    lastPromotionDate: '2025-06-20',
    status: 'ACTIVE',
    notes: 'Trưởng CLB Linh Bửu'
  },
  {
    id: 'std-7',
    code: 'PQQ-LB-007',
    fullName: 'Vũ Thị Ngọc Ánh',
    dob: '2001-01-22',
    birthYear: 2001,
    gender: 'Nữ',
    phone: '0977889900',
    address: 'Long Thành, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-lb',
    unitName: 'CLB Linh Bửu',
    currentBelt: 'HONG_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Hồng Đai Cấp 1',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Đồng Nai',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Cao đẳng Y Dược',
    coachName: 'HLV Trần Quang Dũng',
    joinDate: '2019-10-12',
    lastPromotionDate: '2025-11-15',
    status: 'ACTIVE'
  },
  {
    id: 'std-8',
    code: 'PQQ-LB-008',
    fullName: 'Trương Gia Bảo',
    dob: '2010-07-25',
    birthYear: 2010,
    gender: 'Nam',
    phone: '0943221100',
    address: 'Phước Thái, Long Thành, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-lb',
    unitName: 'CLB Linh Bửu',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Lam Đai Cấp 1',
    diplomaIssueDate: '2024-02-18',
    diplomaIssuePlace: 'Đồng Nai',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '8/12',
    coachName: 'HLV Trần Quang Dũng',
    joinDate: '2024-02-18',
    status: 'ACTIVE'
  },

  // CLB Long Đức
  {
    id: 'std-9',
    code: 'PQQ-LD-009',
    fullName: 'Lê Đức Trí',
    dob: '1996-04-12',
    birthYear: 1996,
    gender: 'Nam',
    phone: '0935112233',
    address: 'Xã Long Đức, Huyện Long Thành, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-ld',
    unitName: 'CLB Long Đức',
    currentBelt: 'HONG_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Hồng Đai Cấp 2',
    diplomaIssueDate: '2025-06-20',
    diplomaIssuePlace: 'Đồng Nai',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Đại học Bách Khoa',
    coachName: 'HLV Lê Đức Trí',
    joinDate: '2019-08-20',
    lastPromotionDate: '2025-06-20',
    status: 'ACTIVE',
    notes: 'Trưởng CLB Long Đức'
  },
  {
    id: 'std-10',
    code: 'PQQ-LD-010',
    fullName: 'Bùi Gia Huy',
    dob: '2006-12-03',
    birthYear: 2006,
    gender: 'Nam',
    phone: '0918776655',
    address: 'KDC Long Đức, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-ld',
    unitName: 'CLB Long Đức',
    currentBelt: 'LUC_DAI',
    currentBeltLevel: 1,
    diplomaName: 'Lục Đai Cấp 1',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Đồng Nai',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '11/12',
    coachName: 'HLV Lê Đức Trí',
    joinDate: '2022-09-05',
    lastPromotionDate: '2025-11-15',
    status: 'ACTIVE'
  },

  // CLB Xuân Lộc
  {
    id: 'std-11',
    code: 'PQQ-XL-011',
    fullName: 'Phạm Minh Hùng',
    dob: '1998-11-05',
    birthYear: 1998,
    gender: 'Nam',
    phone: '0944556677',
    address: 'TT Gia Ray, Xuân Lộc, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-xl',
    unitName: 'CLB Xuân Lộc',
    currentBelt: 'HONG_DAI',
    currentBeltLevel: 3,
    diplomaName: 'Hồng Đai Cấp 3',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Đồng Nai',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: 'Cử nhân Kinh tế',
    coachName: 'HLV Phạm Minh Hùng',
    joinDate: '2021-05-01',
    lastPromotionDate: '2025-11-15',
    status: 'ACTIVE',
    notes: 'Trưởng CLB Xuân Lộc'
  },
  {
    id: 'std-12',
    code: 'PQQ-XL-012',
    fullName: 'Hoàng Anh Tuấn',
    dob: '2004-08-14',
    birthYear: 2004,
    gender: 'Nam',
    phone: '0966112244',
    address: 'Xuân Lộc, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-xl',
    unitName: 'CLB Xuân Lộc',
    currentBelt: 'LUC_DAI',
    currentBeltLevel: 3,
    diplomaName: 'Lục Đai Cấp 3',
    diplomaIssueDate: '2025-11-15',
    diplomaIssuePlace: 'Đồng Nai',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '12/12',
    coachName: 'HLV Phạm Minh Hùng',
    joinDate: '2021-06-10',
    lastPromotionDate: '2025-11-15',
    status: 'ACTIVE'
  },
  {
    id: 'std-13',
    code: 'PQQ-XL-013',
    fullName: 'Ngô Quốc Đạt',
    dob: '2007-03-30',
    birthYear: 2007,
    gender: 'Nam',
    phone: '0934556677',
    address: 'Xuân Lộc, Đồng Nai',
    birthPlace: 'Đồng Nai',
    clubId: 'clb-xl',
    unitName: 'CLB Xuân Lộc',
    currentBelt: 'LAM_DAI',
    currentBeltLevel: 2,
    diplomaName: 'Lam Đai Cấp 2',
    diplomaIssueDate: '2026-01-10',
    diplomaIssuePlace: 'Đồng Nai',
    diplomaIssuingAuthority: 'Môn Phái Phật Quang Quyền',
    educationLevel: '10/12',
    coachName: 'HLV Phạm Minh Hùng',
    joinDate: '2023-11-01',
    lastPromotionDate: '2026-01-10',
    status: 'ACTIVE'
  }
];

export const INITIAL_EXAMS: ExamSession[] = [
  {
    id: 'exam-1',
    sessionCode: 'KT-2026-01',
    name: 'Kỳ thi Thăng đai Phật Quang Quyền Toàn quốc - Khóa Xuân 2026',
    examDate: '2026-01-10',
    location: 'Tổ đình Thiền Tôn Phật Quang, Núi Dinh, Bà Rịa - Vũng Tàu',
    examinerCouncil: 'Hội đồng Ban Chuyên môn Môn phái Phật Quang Quyền',
    status: 'COMPLETED',
    notes: 'Kỳ thi quy tụ thí sinh 5 CLB: Phước Quang 1, Phước Quang 2, Linh Bửu, Long Đức, Xuân Lộc',
    totalCandidates: 3,
    passedCandidates: 3
  },
  {
    id: 'exam-2',
    sessionCode: 'KT-2026-02',
    name: 'Kỳ thi Thăng đai Môn phái Phật Quang Quyền - Khóa Thu Đông 2026',
    examDate: '2026-11-20',
    location: 'Nhà thi đấu Thể thao CLB Linh Bửu, Long Thành, Đồng Nai',
    examinerCouncil: 'Võ sư Tâm Thiện, HLV Tuệ Minh, HLV Quang Dũng, HLV Đức Trí',
    status: 'UPCOMING',
    notes: 'Đang mở đăng ký cho các CLB Phước Quang 1, 2, Linh Bửu, Long Đức, Xuân Lộc',
    totalCandidates: 2,
    passedCandidates: 0
  }
];

export const INITIAL_EXAM_SHEETS: ExamSheet[] = [
  {
    id: 'sheet-1',
    examId: 'exam-1',
    studentId: 'std-5',
    targetBelt: 'LAM_DAI',
    targetBeltLevel: 2,
    scoreCanBan: 8.5,
    scoreBaiQuyen: 8.0,
    scoreBinhKhi: 7.5,
    scoreTheLuc: 8.5,
    scoreDoiKhang: 8.0,
    scoreLyThuyet: 9.0,
    totalScore: 49.5,
    averageScore: 8.3,
    result: 'PASS',
    examiners: 'Võ sư Tâm Thiện, HLV Tuệ Minh',
    notes: 'Bài quyền dứt khoát, lý thuyết tốt'
  },
  {
    id: 'sheet-2',
    examId: 'exam-1',
    studentId: 'std-13',
    targetBelt: 'LAM_DAI',
    targetBeltLevel: 2,
    scoreCanBan: 8.0,
    scoreBaiQuyen: 8.5,
    scoreBinhKhi: 8.0,
    scoreTheLuc: 9.0,
    scoreDoiKhang: 8.5,
    scoreLyThuyet: 9.5,
    totalScore: 51.5,
    averageScore: 8.6,
    result: 'DISTINCTION',
    examiners: 'Võ sư Tâm Thiện, HLV Minh Hùng',
    notes: 'Thủ khoa đợt thi Lam đai cấp 2'
  },
  {
    id: 'sheet-3',
    examId: 'exam-2',
    studentId: 'std-3',
    targetBelt: 'LUC_DAI',
    targetBeltLevel: 1,
    scoreCanBan: 0,
    scoreBaiQuyen: 0,
    scoreBinhKhi: 0,
    scoreTheLuc: 0,
    scoreDoiKhang: 0,
    scoreLyThuyet: 0,
    totalScore: 0,
    averageScore: 0,
    result: 'FAIL',
    examiners: 'Hội đồng Ban Chuyên môn',
    notes: 'Đăng ký dự thi lên Lục Đai'
  },
  {
    id: 'sheet-4',
    examId: 'exam-2',
    studentId: 'std-12',
    targetBelt: 'HONG_DAI',
    targetBeltLevel: 1,
    scoreCanBan: 0,
    scoreBaiQuyen: 0,
    scoreBinhKhi: 0,
    scoreTheLuc: 0,
    scoreDoiKhang: 0,
    scoreLyThuyet: 0,
    totalScore: 0,
    averageScore: 0,
    result: 'FAIL',
    examiners: 'Hội đồng Ban Chuyên môn',
    notes: 'Đăng ký thi lên Hồng Đai'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    certNumber: 'VB-PQQ-2026-001',
    studentId: 'std-5',
    examId: 'exam-1',
    beltConferred: 'LAM_DAI',
    beltLevel: 2,
    issueDate: '2026-01-15',
    signerTitle: 'Trưởng Ban Chuyên Môn Môn Phái',
    signerName: 'Võ sư Thích Tâm Thiện',
    decisionNumber: '08/QĐ-PQQ/2026',
    qrCode: 'PQQ-CERT-2026-001-LAM2',
    status: 'ACTIVE',
    notes: 'Cấp chứng nhận thăng đai Khóa Xuân 2026'
  },
  {
    id: 'cert-2',
    certNumber: 'VB-PQQ-2026-002',
    studentId: 'std-13',
    examId: 'exam-1',
    beltConferred: 'LAM_DAI',
    beltLevel: 2,
    issueDate: '2026-01-15',
    signerTitle: 'Trưởng Ban Chuyên Môn Môn Phái',
    signerName: 'Võ sư Thích Tâm Thiện',
    decisionNumber: '08/QĐ-PQQ/2026',
    qrCode: 'PQQ-CERT-2026-002-LAM2',
    status: 'ACTIVE',
    notes: 'Thủ khoa thăng đai Lam Đai cấp 2'
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  googleSheetScriptUrl: 'https://script.google.com/macros/s/AKfycbw2CzxiCdDqsLKlaXIEcFHbN7sWvjc2VS5Oi0Ia6CsbHdTLdnro_HgkMuFAEFFNKBZ-Ng/exec',
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1GzC6WywESgThVzUQCfAcsbDsvYoeHjvIPpM6QUlO42s/edit?gid=1552337193#gid=1552337193',
  googleSheetId: '1GzC6WywESgThVzUQCfAcsbDsvYoeHjvIPpM6QUlO42s',
  secretToken: 'PQQ_SECRET_2026',
  lastSyncedAt: undefined,
  isAutoSync: false,
  internalPin: '123456',
  masterTitle: 'MÔN PHÁI PHẬT QUANG QUYỀN',
  masterSignerName: 'Võ sư Thích Tâm Thiện',
  masterSignerTitle: 'Trưởng Ban Chuyên Môn'
};

export const storageService = {
  loadClubs(): Club[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLUBS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(INITIAL_CLUBS));
      return INITIAL_CLUBS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLUBS;
    }
  },

  saveClubs(clubs: Club[]) {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
  },

  loadStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  loadExams(): ExamSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      return INITIAL_EXAMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXAMS;
    }
  },

  saveExams(exams: ExamSession[]) {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },

  loadExamSheets(): ExamSheet[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_SHEETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAM_SHEETS, JSON.stringify(INITIAL_EXAM_SHEETS));
      return INITIAL_EXAM_SHEETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXAM_SHEETS;
    }
  },

  saveExamSheets(sheets: ExamSheet[]) {
    localStorage.setItem(STORAGE_KEYS.EXAM_SHEETS, JSON.stringify(sheets));
  },

  loadCertificates(): Certificate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CERTIFICATES;
    }
  },

  saveCertificates(certs: Certificate[]) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  },

  loadAttendance(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
      return INITIAL_ATTENDANCE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ATTENDANCE;
    }
  },

  saveAttendance(records: AttendanceRecord[]) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  },

  loadVideoSubmissions(): VideoSubmission[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VIDEOS;
    }
  },

  saveVideoSubmissions(videos: VideoSubmission[]) {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  },

  loadSettings(): AppSettings {
    let permanentConfig: Partial<AppSettings> = {};
    try {
      const perm = localStorage.getItem(STORAGE_KEYS.PERMANENT_SHEET);
      if (perm) permanentConfig = JSON.parse(perm);
    } catch {
      // ignore
    }

    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      const merged = { ...DEFAULT_SETTINGS, ...permanentConfig };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      return merged;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        googleSheetScriptUrl: parsed.googleSheetScriptUrl || DEFAULT_SETTINGS.googleSheetScriptUrl,
        googleSheetUrl: parsed.googleSheetUrl || DEFAULT_SETTINGS.googleSheetUrl,
        googleSheetId: parsed.googleSheetId || DEFAULT_SETTINGS.googleSheetId,
        secretToken: parsed.secretToken || DEFAULT_SETTINGS.secretToken,
        ...permanentConfig
      };
    } catch {
      return { ...DEFAULT_SETTINGS, ...permanentConfig };
    }
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    // Tự động sao lưu vĩnh viễn cấu hình liên kết Sheet
    if (settings.googleSheetScriptUrl || settings.googleSheetUrl) {
      try {
        localStorage.setItem(STORAGE_KEYS.PERMANENT_SHEET, JSON.stringify({
          googleSheetScriptUrl: settings.googleSheetScriptUrl,
          googleSheetUrl: settings.googleSheetUrl,
          googleSheetId: settings.googleSheetId,
          secretToken: settings.secretToken
        }));
      } catch {
        // ignore
      }
    }
  },

  exportAllData(): string {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      clubs: this.loadClubs(),
      students: this.loadStudents(),
      exams: this.loadExams(),
      examSheets: this.loadExamSheets(),
      certificates: this.loadCertificates(),
      attendance: this.loadAttendance(),
      videos: this.loadVideoSubmissions(),
      settings: this.loadSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.clubs) this.saveClubs(data.clubs);
      if (data.students) this.saveStudents(data.students);
      if (data.exams) this.saveExams(data.exams);
      if (data.examSheets) this.saveExamSheets(data.examSheets);
      if (data.certificates) this.saveCertificates(data.certificates);
      if (data.attendance) this.saveAttendance(data.attendance);
      if (data.videos) this.saveVideoSubmissions(data.videos);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  resetToSampleData() {
    this.saveClubs(INITIAL_CLUBS);
    this.saveStudents(INITIAL_STUDENTS);
    this.saveExams(INITIAL_EXAMS);
    this.saveExamSheets(INITIAL_EXAM_SHEETS);
    this.saveCertificates(INITIAL_CERTIFICATES);
    this.saveAttendance(INITIAL_ATTENDANCE);
    this.saveVideoSubmissions(INITIAL_VIDEOS);
    
    // Bảo vệ liên kết Google Sheet khi đặt lại dữ liệu mẫu, không làm mất link người dùng đã cấu hình
    const current = this.loadSettings();
    this.saveSettings({
      ...DEFAULT_SETTINGS,
      googleSheetScriptUrl: current.googleSheetScriptUrl || DEFAULT_SETTINGS.googleSheetScriptUrl,
      googleSheetUrl: current.googleSheetUrl || DEFAULT_SETTINGS.googleSheetUrl,
      googleSheetId: current.googleSheetId || DEFAULT_SETTINGS.googleSheetId,
      secretToken: current.secretToken || DEFAULT_SETTINGS.secretToken
    });
  }
};

export const INITIAL_VIDEOS: VideoSubmission[] = [
  {
    id: 'vid-1',
    examId: 'exam-2026-01',
    studentId: 'std-2',
    studentName: 'Đặng Thanh Thảo',
    clubId: 'clb-pq1',
    targetBelt: 'HONG_DAI',
    targetBeltLevel: 1,
    content: 'Bài Quyền Thập Nhị Phân Thế',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    submittedAt: '2026-09-20',
    status: 'PASS',
    judgeNote: 'Đòn thế dứt khoát, tấn pháp vững chãi, thần thái võ đạo trang nghiêm. Đạt chuẩn thăng đai.',
    reviewerName: 'Võ sư Thích Tâm Thiện',
    reviewedAt: '2026-09-22'
  },
  {
    id: 'vid-2',
    examId: 'exam-2026-01',
    studentId: 'std-3',
    studentName: 'Phạm Gia Huy',
    clubId: 'clb-pq1',
    targetBelt: 'LUC_DAI',
    targetBeltLevel: 2,
    content: 'Bài Căn Bản Quyền Pháp & Tấn',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    submittedAt: '2026-09-24',
    status: 'PENDING',
    judgeNote: 'Đã tiếp nhận video, chờ Hội đồng Ban Giám khảo chấm duyệt.',
    reviewerName: 'HLV Nguyễn Tuệ Minh'
  },
  {
    id: 'vid-3',
    examId: 'exam-2026-01',
    studentId: 'std-4',
    studentName: 'Vũ Minh Khang',
    clubId: 'clb-pq1',
    targetBelt: 'LUC_DAI',
    targetBeltLevel: 1,
    content: 'Kỹ Thuật Song Luyện Côn',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    submittedAt: '2026-09-25',
    status: 'FAIL',
    judgeNote: 'Đường côn chưa dứt khoát, trọng tâm Đinh tấn còn cao, cần luyện thêm lực cổ tay và nộp lại video.',
    reviewerName: 'Võ sư Thích Tâm Thiện',
    reviewedAt: '2026-09-26'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    clubId: 'clb-pq1',
    studentId: 'std-1',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT',
    notes: 'Tập luyện tích cực'
  },
  {
    id: 'att-1a',
    clubId: 'clb-pq1',
    studentId: 'std-1a',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT',
    notes: 'Đi học đều đặn'
  },
  {
    id: 'att-2',
    clubId: 'clb-pq1',
    studentId: 'std-2',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT'
  },
  {
    id: 'att-3',
    clubId: 'clb-pq1',
    studentId: 'std-3',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT',
    notes: 'Đúng giờ'
  },
  {
    id: 'att-1b',
    clubId: 'clb-pq1',
    studentId: 'std-1b',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT'
  },
  {
    id: 'att-1c',
    clubId: 'clb-pq1',
    studentId: 'std-1c',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'ABSENT',
    notes: 'Tạm nghỉ dưỡng thương'
  },
  {
    id: 'att-1d',
    clubId: 'clb-pq1',
    studentId: 'std-1d',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT'
  },
  {
    id: 'att-1e',
    clubId: 'clb-pq1',
    studentId: 'std-1e',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT'
  },
  {
    id: 'att-1f',
    clubId: 'clb-pq1',
    studentId: 'std-1f',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT'
  },
  {
    id: 'att-1g',
    clubId: 'clb-pq1',
    studentId: 'std-1g',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT'
  },
  {
    id: 'att-1h',
    clubId: 'clb-pq1',
    studentId: 'std-1h',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'ABSENT',
    notes: 'Đã nghỉ'
  },
  {
    id: 'att-1i',
    clubId: 'clb-pq1',
    studentId: 'std-1i',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT'
  },
  {
    id: 'att-1k',
    clubId: 'clb-pq1',
    studentId: 'std-1k',
    date: new Date().toISOString().split('T')[0],
    session: 'Chiều (17:30 - 19:30)',
    status: 'PRESENT'
  }
];

