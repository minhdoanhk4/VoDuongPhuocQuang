import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BeltRank, BELT_CONFIGS } from '../../types';
import { BELT_ORDER, formatBeltWithLevel, getBeltBadgeStyle, getBeltConfig } from '../../utils/beltColors';
import { formatDateVN, getStudentStatusBadge } from '../../utils/formatters';
import { pdfService } from '../../services/pdfService';
import { Building2, ChevronDown, ChevronRight, Download, Filter, Phone, MapPin, Calendar, Award, UserCheck, Eye, UserPlus } from 'lucide-react';

interface ClubHierarchyViewProps {
  onViewStudentDetail: (studentId: string) => void;
  onOpenAddStudentToClub: (clubId: string, belt?: BeltRank) => void;
}

export const ClubHierarchyView: React.FC<ClubHierarchyViewProps> = ({
  onViewStudentDetail,
  onOpenAddStudentToClub
}) => {
  const { clubs, students } = useApp();
  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '');
  const [expandedBelts, setExpandedBelts] = useState<Record<BeltRank, boolean>>({
    NAU_DAI: true,
    LAM_DAI: true,
    LUC_DAI: true,
    HONG_DAI: true,
    HOANG_DAI: true,
    BACH_DAI: true
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const currentClub = clubs.find(c => c.id === selectedClubId) || clubs[0];
  const clubStudents = students.filter(s => s.clubId === selectedClubId);

  const toggleBelt = (belt: BeltRank) => {
    setExpandedBelts(prev => ({ ...prev, [belt]: !prev[belt] }));
  };

  const handleExportClubPdf = async () => {
    if (!currentClub) return;
    setIsExporting(true);
    const filename = `Danh_Sach_Phan_Cap_${currentClub.code}.pdf`;
    await pdfService.exportElementToPdf('club-hierarchy-print-area', filename, 'portrait');
    setIsExporting(false);
  };

  if (!currentClub) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Chưa có Câu Lạc Bộ nào</h3>
        <p className="text-xs text-slate-500 mt-1">Vui lòng tạo ít nhất một Câu lạc bộ trong hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Club Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-600" />
            Chọn CLB:
          </span>
          {clubs.map(club => {
            const count = students.filter(s => s.clubId === club.id).length;
            const isSelected = club.id === selectedClubId;
            return (
              <button
                key={club.id}
                onClick={() => setSelectedClubId(club.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{club.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-amber-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Printable Area Wrapper */}
      <div id="club-hierarchy-print-area" className="space-y-6 bg-transparent">
        {/* Selected Club Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 tracking-wider">
                  {currentClub.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">Môn Phái Phật Quang Quyền</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentClub.name}
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>HLV Phụ trách: <strong>{currentClub.coach}</strong></span>
                </div>
                {currentClub.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>{currentClub.phone}</span>
                  </div>
                )}
                {currentClub.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{currentClub.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions for this club */}
            <div className="flex items-center gap-2 shrink-0 no-print">
              <button
                onClick={() => onOpenAddStudentToClub(currentClub.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Võ Sinh Vào CLB</span>
              </button>
              <button
                onClick={handleExportClubPdf}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>{isExporting ? 'Đang xuất PDF...' : 'Xuất Báo Cáo PDF'}</span>
              </button>
            </div>
          </div>

          {/* Quick Belt distribution mini pill counter */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Quy mô cấp đai:
            </span>
            {BELT_ORDER.map(belt => {
              const cfg = getBeltConfig(belt);
              const count = clubStudents.filter(s => s.currentBelt === belt).length;
              return (
                <div
                  key={belt}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cfg.bgHex }}
                  />
                  <span className="text-slate-700">{cfg.name}:</span>
                  <span className="font-black text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Belt Tiers Hierarchy (Lam -> Lục -> Hồng -> Hoàng -> Bạch) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>Cây Phân Cấp 5 Bậc Đai Tại CLB</span>
              <span className="text-xs font-normal text-slate-500 lowercase">
                (từ nhập môn sơ cấp đến thượng đẳng)
              </span>
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Tổng số: <strong>{clubStudents.length}</strong> võ sinh
            </span>
          </div>

          {BELT_ORDER.map((beltRank, index) => {
            const config = getBeltConfig(beltRank);
            const style = getBeltBadgeStyle(beltRank);
            const studentsInBelt = clubStudents.filter(s => s.currentBelt === beltRank);
            const isExpanded = expandedBelts[beltRank];

            return (
              <div
                key={beltRank}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Accordion Tier Header */}
                <div
                  onClick={() => toggleBelt(beltRank)}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <button
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 no-print"
                      onClick={(e) => { e.stopPropagation(); toggleBelt(beltRank); }}
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>

                    {/* Belt color indicator */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs text-white"
                      style={{ backgroundColor: config.bgHex, color: config.textHex }}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm sm:text-base">
                          {config.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                          &bull; {config.vietnameseName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 hidden sm:block">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black shadow-2xs"
                      style={{ backgroundColor: config.bgHex, color: config.textHex }}
                    >
                      {studentsInBelt.length} võ sinh
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddStudentToClub(currentClub.id, beltRank);
                      }}
                      className="no-print p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 text-xs font-medium flex items-center gap-1"
                      title={`Thêm võ sinh vào ${config.name}`}
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Belt Content (List of students in this belt) */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                    {studentsInBelt.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                        Chưa có võ sinh nào thuộc cấp {config.name} trong câu lạc bộ này.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {studentsInBelt.map(student => {
                          const statusBadge = getStudentStatusBadge(student.status);
                          return (
                            <div
                              key={student.id}
                              className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-amber-300 hover:shadow-md transition-all group relative"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm text-slate-900 group-hover:text-amber-900 transition-colors truncate">
                                      {student.fullName}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {student.code}
                                  </div>
                                </div>

                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 shadow-2xs"
                                  style={{ backgroundColor: config.bgHex, color: config.textHex }}
                                >
                                  Cấp {student.currentBeltLevel}
                                </span>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                                {student.phone && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400">SĐT:</span>
                                    <span className="font-medium text-slate-700">{student.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">Nhập môn:</span>
                                  <span>{formatDateVN(student.joinDate)}</span>
                                </div>
                                {student.lastPromotionDate && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Thăng đai gần nhất:</span>
                                    <span className="font-medium text-amber-800">{formatDateVN(student.lastPromotionDate)}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between no-print">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusBadge.className}`}>
                                  {statusBadge.label}
                                </span>
                                <button
                                  onClick={() => onViewStudentDetail(student.id)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Chi tiết</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
