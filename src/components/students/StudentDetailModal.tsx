import React from 'react';
import { useApp } from '../../context/AppContext';
import { getBeltConfig } from '../../utils/beltColors';
import { formatStudentClubCode, getStudentStatusBadge } from '../../utils/formatters';
import { X, User, Award, Edit3, Trash2 } from 'lucide-react';

interface StudentDetailModalProps {
  studentId: string | null;
  onClose: () => void;
  onEdit: (studentId: string) => void;
  onViewCertificate?: (certId: string) => void;
}

const toRoman = (num: number) => {
  const romanMap = ['', 'I', 'II', 'III', 'IV', 'V'];
  return romanMap[num] || String(num);
};

/** Lọc và chuẩn hóa địa chỉ chỉ lấy theo Tỉnh/Thành phố */
const formatCityProvince = (addr?: string) => {
  if (!addr || !addr.trim()) return 'Chưa cập nhật';
  const trimmed = addr.trim();
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
    return parts[parts.length - 1]; // Chỉ hiển thị Tỉnh/TP
  }
  return trimmed;
};

/** Chuẩn hóa trình độ văn hóa theo định dạng .../12 */
const formatEducationLevel = (val?: string) => {
  if (!val || !val.trim()) return '.../12';
  const clean = val.trim();
  if (clean.includes('/')) return clean;
  if (/^\d+$/.test(clean)) return `${clean}/12`;
  return `${clean}/12`;
};

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onEdit,
  onViewCertificate
}) => {
  const { students, clubs, certificates, deleteStudent } = useApp();

  if (!studentId) return null;

  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const club = clubs.find(c => c.id === student.clubId);
  const beltConfig = getBeltConfig(student.currentBelt);
  const statusBadge = getStudentStatusBadge(student.status);

  // Danh sách văn bằng đã nhận
  const studentCerts = certificates.filter(c => c.studentId === student.id);
  const birthYear = student.birthYear || (student.dob ? student.dob.split('-')[0] : '---');

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ võ sinh: ${student.fullName}?`)) {
      deleteStudent(student.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative bg-white rounded-3xl max-w-lg sm:max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar màu xanh dương */}
        <div className="bg-[#0072de] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between rounded-t-3xl relative select-none shrink-0">
          {/* Bên trái: Mã Võ sinh */}
          <div className="text-xs sm:text-sm font-medium flex items-center gap-1.5 truncate max-w-[45%]">
            <span className="opacity-80 shrink-0">Mã:</span>
            <span className="font-mono font-bold underline decoration-blue-300 truncate">
              {formatStudentClubCode(student, club)}
            </span>
          </div>

          {/* Ở giữa: Tiêu đề Thông tin */}
          <h3 className="text-base sm:text-lg font-bold tracking-wide text-center">
            Thông tin
          </h3>

          {/* Bên phải: Nút đóng X nổi bật */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-rose-600 shadow-md border border-white/60 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
            title="Đóng cửa sổ"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Nội dung chính của pop-up */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Khối Trên: Hình Môn Phái | Họ Tên, Năm sinh, Giới tính | Hình Liên Đoàn */}
          <div className="flex items-center justify-between gap-2 sm:gap-5">
            {/* 1. Hình Môn Phái */}
            <div className="flex flex-col items-center shrink-0">
              <div 
                className="w-16 h-22 sm:w-22 sm:h-30 rounded-xl border-2 bg-slate-50 overflow-hidden flex items-center justify-center shadow-2xs relative"
                style={{ borderColor: beltConfig.borderHex }}
              >
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 sm:w-9 sm:h-9 text-slate-300" />
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-1">
                Hình Môn Phái
              </span>
            </div>

            {/* 2. Thông tin ở giữa: Họ Tên, Năm sinh, Giới tính (Không có Pháp danh) */}
            <div className="flex-1 text-center min-w-0 px-1">
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug student-name" data-student-name="true">
                {student.fullName}
              </h2>
              <div className="flex items-center justify-center gap-2 sm:gap-4 mt-1.5 text-xs sm:text-sm font-semibold text-slate-700 flex-wrap">
                <span>Năm sinh: <strong className="font-mono text-slate-900">{birthYear}</strong></span>
                <span className="text-slate-300 hidden sm:inline">&bull;</span>
                <span>Giới tính: <strong className="text-slate-900">{student.gender}</strong></span>
              </div>
              {student.status && (
                <div className="flex justify-center mt-1.5">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>
              )}
            </div>

            {/* 3. Hình Liên Đoàn */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-16 h-22 sm:w-22 sm:h-30 rounded-xl border-2 border-slate-300/90 bg-slate-50 overflow-hidden flex items-center justify-center shadow-2xs">
                {student.federationAvatarUrl ? (
                  <img src={student.federationAvatarUrl} alt="Hình Liên Đoàn" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 sm:w-9 sm:h-9 text-slate-300" />
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-1">
                Hình Liên Đoàn
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* KHỐI 1: GIAO DIỆN WEB (DESKTOP) - 2 CỘT CHIA VẠCH XANH DỌC     */}
          {/* ============================================================== */}
          <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6 pt-1">
            {/* Cột Trái */}
            <div className="space-y-2.5 text-sm text-slate-700 min-w-0">
              <div className="flex items-start gap-1">
                <span className="text-slate-400 shrink-0 font-bold">-</span>
                <div className="min-w-0">
                  <span className="font-medium text-slate-600">Địa chỉ: </span>
                  <strong className="text-slate-900 font-semibold break-words">
                    {formatCityProvince(student.address)}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-400 shrink-0 font-bold">-</span>
                <div>
                  <span className="font-medium text-slate-600">SĐT: </span>
                  <strong className="text-slate-900 font-mono font-semibold">
                    {student.phone || 'Chưa cập nhật'}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-slate-400 shrink-0 font-bold">-</span>
                <div>
                  <span className="font-medium text-slate-600">Cao: </span>
                  <strong className="font-mono text-slate-800">
                    {student.height ? `${student.height} cm` : '....... cm'}
                  </strong>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="font-medium text-slate-600">Nặng: </span>
                  <strong className="font-mono text-slate-800">
                    {student.weight ? `${student.weight} Kg` : '....... Kg'}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-1">
                <span className="text-slate-400 shrink-0 font-bold">-</span>
                <div>
                  <span className="font-medium text-slate-600">Trình độ văn hóa: </span>
                  <strong className="text-slate-900 font-semibold">
                    {formatEducationLevel(student.educationLevel)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Cột Phải (Có vạch kẻ dọc màu xanh #0072de) */}
            <div className="border-l-2 border-[#0072de] pl-6 space-y-2.5 text-sm text-slate-700 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 shrink-0 font-bold">-</span>
                <div>
                  <span className="font-medium text-slate-600">Cấp: </span>
                  <strong className="text-[#0072de] font-mono font-bold">
                    {String(student.currentBeltLevel).padStart(2, '0')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-400 shrink-0 font-bold">-</span>
                <div>
                  <span className="font-medium text-slate-600">Đai đẳng: </span>
                  <strong className="font-bold" style={{ color: beltConfig.borderHex }}>
                    {student.currentBelt === 'NAU_DAI' ? 'Nâu Đai (Cấp 0)' : `${beltConfig.name} ${toRoman(student.currentBeltLevel)}`}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-1">
                <span className="text-slate-400 shrink-0 font-bold">-</span>
                <div className="min-w-0">
                  <span className="font-medium text-slate-600">CLB: </span>
                  <strong className="text-slate-900 font-semibold break-words">
                    {club?.name || student.unitName || 'CLB Phước Quang 1'}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-1">
                <span className="text-slate-400 shrink-0 font-bold">-</span>
                <div className="min-w-0">
                  <span className="font-medium text-slate-600">HLV: </span>
                  <strong className="text-slate-900 font-semibold break-words">
                    {student.coachName || club?.coach || 'Chưa cập nhật'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* KHỐI 2: GIAO DIỆN MOBILE - TÁI CẤU TRÚC DẠNG DỌC DỄ THEO DÕI   */}
          {/* (KHÔNG SCALE LẠI DẠNG 2 CỘT CỦA WEB ĐỂ TRÁNH BỊ CHÈN ÉP)        */}
          {/* ============================================================== */}
          <div className="sm:hidden space-y-2 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium shrink-0">- Cấp:</span>
              <strong className="text-[#0072de] font-mono font-bold">
                {String(student.currentBeltLevel).padStart(2, '0')}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium shrink-0">- Đai đẳng:</span>
              <strong className="font-bold text-right" style={{ color: beltConfig.borderHex }}>
                {student.currentBelt === 'NAU_DAI' ? 'Nâu Đai (Cấp 0)' : `${beltConfig.name} ${toRoman(student.currentBeltLevel)}`}
              </strong>
            </div>

            <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium shrink-0">- Đơn vị (CLB):</span>
              <strong className="text-slate-900 font-semibold text-right">
                {club?.name || student.unitName || 'CLB Phước Quang 1'}
              </strong>
            </div>

            <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium shrink-0">- HLV phụ trách:</span>
              <strong className="text-slate-900 font-semibold text-right">
                {student.coachName || club?.coach || 'Chưa cập nhật'}
              </strong>
            </div>

            <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium shrink-0">- Địa chỉ (Tỉnh/TP):</span>
              <strong className="text-slate-900 font-semibold text-right">
                {formatCityProvince(student.address)}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium shrink-0">- Số điện thoại:</span>
              <strong className="text-slate-900 font-mono font-semibold text-right">
                {student.phone || 'Chưa cập nhật'}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium shrink-0">- Chiều cao | Cân nặng:</span>
              <span className="font-mono text-slate-800 font-semibold text-right">
                {student.height ? `${student.height} cm` : '....... cm'} | {student.weight ? `${student.weight} Kg` : '....... Kg'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-slate-500 font-medium shrink-0">- Trình độ văn hóa:</span>
              <strong className="text-slate-900 font-semibold text-right">
                {formatEducationLevel(student.educationLevel)}
              </strong>
            </div>
          </div>

          {/* Dòng xem văn bằng nếu có */}
          {studentCerts.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700">
              <span className="font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>Văn bằng đã cấp: {studentCerts.length}</span>
              </span>
              {onViewCertificate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewCertificate(studentCerts[0].id);
                  }}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
                >
                  Xem bằng &rarr;
                </button>
              )}
            </div>
          )}
        </div>

        {/* Khối Dưới (Footer): Nút Xóa (Đỏ) và Sửa (Xanh) ở góc phải */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Xóa hồ sơ võ sinh"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Xóa</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(student.id)}
            className="flex items-center justify-center gap-1.5 px-6 py-2 rounded-xl bg-[#0072de] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Chỉnh sửa thông tin"
          >
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Sửa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
