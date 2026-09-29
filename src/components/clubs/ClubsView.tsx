import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Club } from '../../types';
import { formatDateVN } from '../../utils/formatters';
import { ClubFormModal } from './ClubFormModal';
import { Building2, Plus, Phone, MapPin, Calendar, Users, Edit, Trash2, ChevronRight, Award } from 'lucide-react';
import { ActiveTab } from '../layout/NavigationTabs';

interface ClubsViewProps {
  onNavigateToHierarchy: () => void;
}

export const ClubsView: React.FC<ClubsViewProps> = ({ onNavigateToHierarchy }) => {
  const { clubs, students, deleteClub } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clubToEdit, setClubToEdit] = useState<Club | null>(null);

  const handleDelete = (c: Club) => {
    const count = students.filter(s => s.clubId === c.id).length;
    if (count > 0) {
      alert(`Không thể xóa câu lạc bộ này vì đang có ${count} võ sinh theo học!`);
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa CLB: ${c.name}?`)) {
      deleteClub(c.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Quản Lý Danh Sách Câu Lạc Bộ (CLB)
          </h2>
          <p className="text-xs text-slate-500">
            Các phân nhánh câu lạc bộ trực thuộc Môn phái Phật Quang Quyền trên toàn quốc.
          </p>
        </div>

        <button
          onClick={() => {
            setClubToEdit(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Câu Lạc Bộ Mới</span>
        </button>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {clubs.map(club => {
          const clubStudents = students.filter(s => s.clubId === club.id);
          return (
            <div
              key={club.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {club.code}
                      </span>
                      <h3 className="font-black text-lg text-slate-900 mt-1">
                        {club.name}
                      </h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800">
                    {clubStudents.length} võ sinh
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>HLV Phụ trách: <strong>{club.coach}</strong></span>
                  </div>
                  {club.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Điện thoại: <strong>{club.phone}</strong></span>
                    </div>
                  )}
                  {club.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Địa chỉ: {club.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Thành lập: {formatDateVN(club.establishedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setClubToEdit(club);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Chỉnh sửa CLB"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(club)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Xóa CLB"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={onNavigateToHierarchy}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors border border-emerald-200"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xem Phân Cấp Đai</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <ClubFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        clubToEdit={clubToEdit}
      />
    </div>
  );
};
