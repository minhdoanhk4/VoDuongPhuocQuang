import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { getBeltBadgeStyle, getBeltConfig } from '../../utils/beltColors';
import { formatDateVN } from '../../utils/formatters';
import { pdfService } from '../../services/pdfService';
import {
  Building2,
  Users,
  Search,
  UserPlus,
  Download,
  Eye,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Award,
  CheckCircle2,
  Sparkles,
  FileText,
  User
} from 'lucide-react';

interface SecretaryHomeViewProps {
  selectedClubId: string;
  onSelectClub: (clubId: string) => void;
  onOpenAddStudent: (clubId?: string) => void;
  onOpenEditStudent: (student: Student) => void;
  onViewStudentDetail: (studentId: string) => void;
  onCreateExamForStudent?: (student: Student) => void;
}

export const SecretaryHomeView: React.FC<SecretaryHomeViewProps> = ({
  selectedClubId,
  onSelectClub,
  onOpenAddStudent,
  onOpenEditStudent,
  onViewStudentDetail,
  onCreateExamForStudent
}) => {
  const { clubs, students, deleteStudent } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [photoModalUrl, setPhotoModalUrl] = useState<{ name: string; url?: string } | null>(null);

  // Thống kê tổng số và chi tiết 5 CLB
  const totalStudents = students.length;

  const currentClub = selectedClubId === 'ALL'
    ? null
    : clubs.find(c => c.id === selectedClubId) || clubs[0];

  // Lọc danh sách theo CLB được chọn và từ khóa tìm kiếm
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedClubId !== 'ALL' && s.clubId !== selectedClubId) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(term);
        const matchDharma = s.dharmaName ? s.dharmaName.toLowerCase().includes(term) : false;
        const matchPhone = s.phone.includes(term);
        const matchAddress = s.address ? s.address.toLowerCase().includes(term) : false;
        const matchCoach = s.coachName ? s.coachName.toLowerCase().includes(term) : false;
        const matchDiploma = s.diplomaName ? s.diplomaName.toLowerCase().includes(term) : false;
        return matchName || matchDharma || matchPhone || matchAddress || matchCoach || matchDiploma;
      }
      return true;
    });
  }, [students, selectedClubId, searchTerm]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    const filename = `Danh_Sach_Vo_Sinh_${currentClub ? currentClub.code : '5_CLB'}.pdf`;
    await pdfService.exportElementToPdf('secretary-student-roster-table', filename, 'landscape');
    setIsExporting(false);
  };

  const handleDelete = (s: Student) => {
    if (window.confirm(`Xóa võ sinh: ${s.fullName} (${s.code}) khỏi hệ thống?`)) {
      deleteStudent(s.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Tổng Quan Chỉ Số 5 CLB */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0072de]">
                Cổng Thư Ký Môn Phái
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                &bull; Quản trị danh sách võ sinh 5 Câu Lạc Bộ
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Chỉ Số Võ Sinh 5 Câu Lạc Bộ Phật Quang Quyền
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-right">
              <span className="text-[10px] font-bold text-[#0072de] uppercase tracking-wider block">
                Tổng 5 CLB
              </span>
              <span className="text-2xl font-black text-slate-900">{totalStudents}</span>
              <span className="text-xs text-[#0072de] ml-1">võ sinh</span>
            </div>
          </div>
        </div>

        {/* 5 Ô Tên Câu Lạc Bộ để bấm chọn */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chọn Câu Lạc Bộ để xem danh sách chi tiết:
            </span>
            <button
              onClick={() => onSelectClub('ALL')}
              className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                selectedClubId === 'ALL'
                  ? 'bg-[#0072de] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              Xem Toàn Bộ 5 CLB ({totalStudents})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {clubs.map(club => {
              const count = students.filter(s => s.clubId === club.id).length;
              const isSelected = selectedClubId === club.id;

              return (
                <div
                  key={club.id}
                  onClick={() => onSelectClub(club.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/90 border-[#0072de] ring-2 ring-[#0072de]/20 shadow-md'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-[#0072de]/50 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span
                      className={`font-mono text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-[#0072de] text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {club.code}
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {count} <span className="text-[11px] font-normal text-slate-500">VS</span>
                    </span>
                  </div>

                  <div>
                    <h3 className={`font-black text-sm ${isSelected ? 'text-[#0072de] font-black' : 'text-slate-800'}`}>
                      {club.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      HLV: <strong>{club.coach}</strong>
                    </p>
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-blue-200/80 flex items-center justify-between text-[10px] font-bold text-[#0072de]">
                      <span>Đang chọn</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0072de]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roster Controls: Search, Add Student, Export */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                Danh Sách Võ Sinh: {currentClub ? currentClub.name : 'Toàn Bộ 5 Câu Lạc Bộ'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-[#0072de]">
                {filteredStudents.length} hồ sơ
              </span>
            </div>
            {currentClub && (
              <p className="text-xs text-slate-500 mt-0.5">
                HLV Trực tiếp: <strong>{currentClub.coach}</strong> &bull; SĐT: <strong>{currentClub.phone}</strong> &bull; {currentClub.address}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{isExporting ? 'Đang tạo PDF...' : 'Xuất Báo Cáo PDF'}</span>
            </button>
            <button
              onClick={() => onOpenAddStudent(currentClub?.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Võ Sinh Mới</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên, năm sinh, địa chỉ, HLV, văn bằng, SĐT..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/60"
          />
        </div>
      </div>

      {/* Roster Table with EXACT Columns requested by User */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div id="secretary-student-roster-table" className="overflow-x-auto">
          {/* Header visible on PDF print */}
          <div className="p-4 bg-blue-50 border-b border-blue-200 print-only hidden">
            <h1 className="text-xl font-black text-slate-900">MÔN PHÁI PHẬT QUANG QUYỀN</h1>
            <p className="text-xs text-slate-700 font-bold uppercase mt-1">
              DANH SÁCH VÕ SINH - {currentClub ? currentClub.name : 'TOÀN BỘ 5 CLB'}
            </p>
            <p className="text-[11px] text-slate-500">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>

          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-black uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-3 text-center">Năm sinh</th>
                <th className="py-3 px-3 text-center">Giới tính</th>
                <th className="py-3 px-4">Địa chỉ</th>
                <th className="py-3 px-4">Đơn vị</th>
                <th className="py-3 px-3">Văn bằng</th>
                <th className="py-3 px-3 text-center">Ngày cấp</th>
                <th className="py-3 px-3">Nơi cấp</th>
                <th className="py-3 px-3">Cơ quan cấp</th>
                <th className="py-3 px-3 text-center">Trình độ văn hóa</th>
                <th className="py-3 px-3">Số điện thoại</th>
                <th className="py-3 px-3">HLV</th>
                <th className="py-3 px-3 text-center">Ảnh thẻ</th>
                <th className="py-3 px-3 text-right no-print">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    Chưa có võ sinh nào thuộc câu lạc bộ này hoặc không có kết quả tìm kiếm phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const club = clubs.find(c => c.id === student.clubId);
                  const beltCfg = getBeltConfig(student.currentBelt);
                  const birthYear = student.birthYear || (student.dob ? student.dob.split('-')[0] : '---');
                  const unitName = student.unitName || club?.name || '---';
                  const diploma = student.diplomaName || `${beltCfg.name} Cấp ${student.currentBeltLevel}`;
                  const issueDate = student.diplomaIssueDate || student.lastPromotionDate || '---';
                  const issuePlace = student.diplomaIssuePlace || 'BR - Vũng Tàu';
                  const issuingAuthority = student.diplomaIssuingAuthority || 'Môn Phái Phật Quang Quyền';
                  const edu = student.educationLevel || '12/12';
                  const coach = student.coachName || club?.coach || '---';

                  return (
                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* STT */}
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {index + 1}
                      </td>

                      {/* Họ và Tên */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <button
                          onClick={() => onViewStudentDetail(student.id)}
                          className="hover:text-[#0072de] hover:underline text-left block cursor-pointer"
                        >
                          {student.fullName}
                        </button>
                        {student.dharmaName && (
                          <span className="text-[10px] text-[#0072de] font-semibold block">
                            PD: {student.dharmaName}
                          </span>
                        )}
                      </td>

                      {/* Năm sinh */}
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                        {birthYear}
                      </td>

                      {/* Giới tính */}
                      <td className="py-3 px-3 text-center text-slate-700">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.gender === 'Nữ'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>

                      {/* Địa chỉ */}
                      <td className="py-3 px-4 text-slate-700 truncate max-w-[180px]" title={student.address}>
                        {student.address || '---'}
                      </td>

                      {/* Đơn vị */}
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {unitName}
                      </td>

                      {/* Văn bằng */}
                      <td className="py-3 px-3">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-2xs whitespace-nowrap"
                          style={{ backgroundColor: beltCfg.bgHex, color: beltCfg.textHex }}
                        >
                          {diploma}
                        </span>
                      </td>

                      {/* Ngày cấp */}
                      <td className="py-3 px-3 text-center text-slate-600 font-mono">
                        {formatDateVN(issueDate)}
                      </td>

                      {/* Nơi cấp */}
                      <td className="py-3 px-3 text-slate-600">
                        {issuePlace}
                      </td>

                      {/* Cơ quan cấp */}
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {issuingAuthority}
                      </td>

                      {/* Trình độ văn hóa */}
                      <td className="py-3 px-3 text-center text-slate-700">
                        {edu}
                      </td>

                      {/* Số điện thoại */}
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {student.phone || '---'}
                      </td>

                      {/* HLV */}
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {coach}
                      </td>

                      {/* Ảnh thẻ */}
                      <td className="py-3 px-3 text-center">
                        <div
                          onClick={() => setPhotoModalUrl({ name: student.fullName, url: student.avatarUrl })}
                          className="w-8 h-10 mx-auto rounded-md bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#0072de] shadow-2xs group"
                          title="Bấm để xem ảnh thẻ phóng to"
                        >
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-slate-400 group-hover:text-[#0072de]" />
                          )}
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3 text-right no-print">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewStudentDetail(student.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0072de] hover:bg-blue-50 cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            title="Sửa hồ sơ"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Phóng To Ảnh Thẻ */}
      {photoModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
          onClick={() => setPhotoModalUrl(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <h4 className="font-bold text-sm text-slate-900">
              Ảnh Thẻ Võ Sinh: {photoModalUrl.name}
            </h4>
            <div className="w-48 h-64 mx-auto rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
              {photoModalUrl.url ? (
                <img src={photoModalUrl.url} alt={photoModalUrl.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-400 text-xs p-4">
                  <User className="w-16 h-16 mx-auto mb-2 text-slate-300" />
                  <span>Chưa có ảnh thẻ (Ảnh 3x4 tiêu chuẩn võ sinh)</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setPhotoModalUrl(null)}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
