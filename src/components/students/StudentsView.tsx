import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BeltRank, Student, StudentStatus } from '../../types';
import { BELT_ORDER, getBeltBadgeStyle, getBeltConfig } from '../../utils/beltColors';
import { formatDateVN, getStudentStatusBadge } from '../../utils/formatters';
import { pdfService } from '../../services/pdfService';
import { Search, UserPlus, Filter, Download, LayoutGrid, Table as TableIcon, Edit, Eye, Trash2, Building2, Award } from 'lucide-react';

interface StudentsViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (student: Student) => void;
  onViewDetail: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onViewDetail
}) => {
  const { students, clubs, selectedClubFilter, setSelectedClubFilter, deleteStudent } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBelt, setSelectedBelt] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isExporting, setIsExporting] = useState(false);

  // Lọc danh sách võ sinh
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Lọc theo CLB toàn cục hoặc cục bộ
      if (selectedClubFilter !== 'ALL' && student.clubId !== selectedClubFilter) {
        return false;
      }
      // Lọc theo cấp đai
      if (selectedBelt !== 'ALL' && student.currentBelt !== selectedBelt) {
        return false;
      }
      // Lọc theo trạng thái
      if (selectedStatus !== 'ALL' && student.status !== selectedStatus) {
        return false;
      }
      // Tìm kiếm từ khóa
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = student.fullName.toLowerCase().includes(term);
        const matchDharma = student.dharmaName ? student.dharmaName.toLowerCase().includes(term) : false;
        const matchCode = student.code.toLowerCase().includes(term);
        const matchPhone = student.phone.includes(term);
        return matchName || matchDharma || matchCode || matchPhone;
      }
      return true;
    });
  }, [students, selectedClubFilter, selectedBelt, selectedStatus, searchTerm]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    await pdfService.exportElementToPdf('students-printable-table', 'Danh_Sach_Vo_Sinh_PQQ.pdf', 'landscape');
    setIsExporting(false);
  };

  const handleDelete = (s: Student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa võ sinh: ${s.fullName} (${s.code})?`)) {
      deleteStudent(s.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header controls & filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Lý Võ Sinh Phật Quang Quyền
            </h2>
            <p className="text-xs text-slate-500">
              Tổng số hiển thị: <strong className="text-slate-800">{filteredStudents.length}</strong> / {students.length} võ sinh
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{isExporting ? 'Đang xuất PDF...' : 'Tải Báo Cáo PDF'}</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Võ Sinh Mới</span>
            </button>
          </div>
        </div>

        {/* Filter bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, pháp danh, mã, SĐT..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
            />
          </div>

          {/* Filter CLB */}
          <div>
            <select
              value={selectedClubFilter}
              onChange={e => setSelectedClubFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Tất cả CLB ({clubs.length})</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Cấp Đai */}
          <div>
            <select
              value={selectedBelt}
              onChange={e => setSelectedBelt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Tất cả 5 Cấp Đai</option>
              {BELT_ORDER.map(belt => {
                const cfg = getBeltConfig(belt);
                return (
                  <option key={belt} value={belt}>
                    {cfg.name} ({cfg.vietnameseName})
                  </option>
                );
              })}
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-slate-400 text-[11px] mr-1">Hiển thị:</span>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl border transition-all ${
                viewMode === 'table'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Dạng bảng"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Dạng lưới thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy võ sinh nào phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">
            Hãy thử điều chỉnh lại bộ lọc hoặc thêm võ sinh mới vào hệ thống.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div id="students-printable-table" className="overflow-x-auto">
            {/* Header info visible on PDF print */}
            <div className="p-4 bg-amber-50 border-b border-amber-200 print-only hidden">
              <h1 className="text-xl font-bold text-slate-900">MÔN PHÁI PHẬT QUANG QUYỀN</h1>
              <p className="text-sm text-slate-700">DANH SÁCH VÕ SINH - Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã VS</th>
                  <th className="py-3 px-4">Họ và Tên</th>
                  <th className="py-3 px-4">Pháp Danh</th>
                  <th className="py-3 px-4">CLB Trực Thuộc</th>
                  <th className="py-3 px-4">Cấp Đai</th>
                  <th className="py-3 px-4">Ngày Nhập Môn</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right no-print">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const club = clubs.find(c => c.id === student.clubId);
                  const beltCfg = getBeltConfig(student.currentBelt);
                  const statusBadge = getStudentStatusBadge(student.status);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {student.code}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <button
                          onClick={() => onViewDetail(student.id)}
                          className="hover:text-amber-700 hover:underline text-left"
                        >
                          {student.fullName}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-semibold text-amber-800">
                        {student.dharmaName || '---'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {club?.name || '---'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-2xs whitespace-nowrap"
                          style={{ backgroundColor: beltCfg.bgHex, color: beltCfg.textHex }}
                        >
                          {beltCfg.name} - Cấp {student.currentBeltLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDateVN(student.joinDate)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {student.phone || '---'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewDetail(student.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map(student => {
            const club = clubs.find(c => c.id === student.clubId);
            const beltCfg = getBeltConfig(student.currentBelt);
            const statusBadge = getStudentStatusBadge(student.status);

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Belt color top strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: beltCfg.bgHex }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-2xs"
                      style={{ backgroundColor: beltCfg.bgHex, color: beltCfg.textHex }}
                    >
                      {beltCfg.name} Cấp {student.currentBeltLevel}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      {student.code}
                    </span>
                  </div>

                  <h3
                    onClick={() => onViewDetail(student.id)}
                    className="font-bold text-sm text-slate-900 group-hover:text-amber-800 transition-colors cursor-pointer truncate"
                  >
                    {student.fullName}
                  </h3>

                  {student.dharmaName && (
                    <p className="text-xs font-semibold text-amber-700 mt-0.5">
                      Pháp danh: {student.dharmaName}
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{club?.name || '---'}</span>
                    </div>
                    {student.phone && (
                      <div className="text-[11px] text-slate-500">
                        SĐT: {student.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewDetail(student.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenEditModal(student)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(student)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
