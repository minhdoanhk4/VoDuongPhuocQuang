import React from 'react';
import { useApp } from '../../context/AppContext';
import { getBeltBadgeStyle, getBeltConfig } from '../../utils/beltColors';
import { formatDateVN, formatStudentClubCode, getResultBadge, getStudentStatusBadge } from '../../utils/formatters';
import { X, Award, Calendar, Phone, MapPin, Building2, User, FileText, CheckCircle2, ChevronRight, Edit3, Trash2 } from 'lucide-react';

interface StudentDetailModalProps {
  studentId: string | null;
  onClose: () => void;
  onEdit: (studentId: string) => void;
  onViewCertificate: (certId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onEdit,
  onViewCertificate
}) => {
  const { students, clubs, exams, examSheets, certificates, deleteStudent } = useApp();

  if (!studentId) return null;

  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const club = clubs.find(c => c.id === student.clubId);
  const beltConfig = getBeltConfig(student.currentBelt);
  const beltStyle = getBeltBadgeStyle(student.currentBelt);
  const statusBadge = getStudentStatusBadge(student.status);

  // Lịch sử thi của võ sinh
  const studentExamSheets = examSheets.filter(s => s.studentId === student.id);
  // Danh sách văn bằng đã nhận
  const studentCerts = certificates.filter(c => c.studentId === student.id);

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ võ sinh: ${student.fullName}?`)) {
      deleteStudent(student.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Banner with belt color */}
        <div
          className="h-28 relative flex items-end px-4 sm:px-6 pb-4 border-b border-slate-200/60"
          style={{ backgroundColor: beltConfig.bgHex }}
        >
          <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-rose-500 text-slate-700 hover:text-white border border-slate-300 shadow-md hover:shadow-lg flex items-center justify-center transition-all cursor-pointer active:scale-90"
              title="Đóng cửa sổ"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <span
            className="px-3 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider bg-white/95"
            style={{ color: beltConfig.borderHex }}
          >
            {beltConfig.name} - Cấp {student.currentBeltLevel}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-slate-900">{student.fullName}</h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>
              {student.dharmaName && (
                <div className="text-sm font-semibold text-amber-700 mt-0.5">
                  Pháp danh: {student.dharmaName}
                </div>
              )}
              <div className="text-xs font-mono text-slate-400 mt-1">
                Mã: <span className="font-bold text-[#0072de]">{formatStudentClubCode(student, club)}</span> ({student.code}) &bull; {student.gender} &bull; Sinh ngày: {formatDateVN(student.dob)}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end text-xs text-slate-500">
              <span className="font-bold text-slate-800">{club?.name || 'Chưa gán CLB'}</span>
              <span>Nhập môn: {formatDateVN(student.joinDate)}</span>
              {student.lastPromotionDate && (
                <span className="text-amber-700 font-medium">Thăng đai: {formatDateVN(student.lastPromotionDate)}</span>
              )}
            </div>
          </div>

          {/* Contact & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <span>SĐT: <strong>{student.phone || 'Chưa cập nhật'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>CLB: <strong>{club?.name}</strong></span>
            </div>
            <div className="sm:col-span-2 flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Địa chỉ: {student.address || 'Chưa có thông tin'}</span>
            </div>
            {student.notes && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 text-slate-600 italic">
                &ldquo;{student.notes}&rdquo;
              </div>
            )}
          </div>

          {/* Lịch sử thi thăng đai */}
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Lịch Sử Tham Gia Kỳ Thi Thăng Đai ({studentExamSheets.length})</span>
            </h4>

            {studentExamSheets.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có dữ liệu dự thi.
              </div>
            ) : (
              <div className="space-y-2.5">
                {studentExamSheets.map(sheet => {
                  const exam = exams.find(e => e.id === sheet.examId);
                  const targetBeltCfg = getBeltConfig(sheet.targetBelt);
                  const resultBadge = getResultBadge(sheet.result);

                  return (
                    <div
                      key={sheet.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{exam?.name || 'Kỳ thi'}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${resultBadge.className}`}>
                          {resultBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>
                          Thi lên: <strong style={{ color: targetBeltCfg.borderHex }}>{targetBeltCfg.name} Cấp {sheet.targetBeltLevel}</strong>
                        </span>
                        <span>Điểm TB: <strong className="text-slate-900 text-xs">{sheet.averageScore}/10</strong></span>
                      </div>

                      {/* Breakdown scores */}
                      <div className="grid grid-cols-6 gap-1 pt-2 border-t border-slate-100 text-center text-[10px]">
                        <div className="bg-slate-50 p-1 rounded">Căn bản: <strong>{sheet.scoreCanBan}</strong></div>
                        <div className="bg-slate-50 p-1 rounded">Quyền: <strong>{sheet.scoreBaiQuyen}</strong></div>
                        <div className="bg-slate-50 p-1 rounded">Binh khí: <strong>{sheet.scoreBinhKhi}</strong></div>
                        <div className="bg-slate-50 p-1 rounded">Thể lực: <strong>{sheet.scoreTheLuc}</strong></div>
                        <div className="bg-slate-50 p-1 rounded">Đối kháng: <strong>{sheet.scoreDoiKhang}</strong></div>
                        <div className="bg-slate-50 p-1 rounded">Võ đạo: <strong>{sheet.scoreLyThuyet}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Danh sách Văn bằng được cấp */}
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Văn Bằng Đã Được Cấp ({studentCerts.length})</span>
            </h4>

            {studentCerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có văn bằng nào được cấp.
              </div>
            ) : (
              <div className="space-y-2">
                {studentCerts.map(cert => {
                  const cBelt = getBeltConfig(cert.beltConferred);
                  return (
                    <div
                      key={cert.id}
                      className="p-3 rounded-2xl border border-purple-200 bg-purple-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{cBelt.name} Cấp {cert.beltLevel}</span>
                          <span className="font-mono text-purple-700 text-[11px] font-semibold">
                            {cert.certNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Ngày cấp: {formatDateVN(cert.issueDate)} &bull; {cert.signerTitle}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onViewCertificate(cert.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <span>Xem Bằng</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions: icon Xóa và icon Sửa (Đã bỏ nút Đóng ở dưới vì đã có nút đóng X nổi bật ở trên) */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs sm:text-sm transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Xóa hồ sơ võ sinh"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Xóa võ sinh</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(student.id)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0072de] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Chỉnh sửa thông tin"
          >
            <Edit3 className="w-4 h-4" />
            <span>Sửa thông tin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
