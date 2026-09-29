import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Building2 } from 'lucide-react';

interface HomeClubGridViewProps {
  onSelectClub: (clubId: string) => void;
  onNavigateToExams: () => void;
  onNavigateToCertificates: () => void;
  onOpenSettings: () => void;
  onOpenAddClub?: () => void;
}

export const HomeClubGridView: React.FC<HomeClubGridViewProps> = ({
  onSelectClub,
  onOpenAddClub
}) => {
  const { clubs, students } = useApp();
  const { t, language } = useLanguage();
  const [isPlusHovered, setIsPlusHovered] = useState(false);

  // Thứ tự hiển thị chuẩn theo yêu cầu:
  // Hàng 1: CLB Phước Quang 1, CLB Phước Quang 2
  // Hàng 2: CLB Long Đức, CLB Linh Bửu
  // Hàng 3: CLB Xuân Lộc (+ CLB thứ 6 nếu có)
  const sortedClubs = useMemo(() => {
    const preferredOrder = ['clb-pq1', 'clb-pq2', 'clb-ld', 'clb-lb', 'clb-xl'];
    const sorted = [...clubs].sort((a, b) => {
      const indexA = preferredOrder.indexOf(a.id);
      const indexB = preferredOrder.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [clubs]);

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto flex-1 flex flex-col justify-center py-4 px-2">
      {/* 2-column Grid: Samsung One UI Clean Solid Cards (Zero Liquid Glass, No Eye Strain) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 w-full">
        {sortedClubs.map((club, index) => {
          const studentCount = students.filter((s) => s.clubId === club.id).length;
          const displayCount = studentCount > 0 ? studentCount : 180;
          const isFifthCentered = index === 4 && sortedClubs.length === 5;

          return (
            <div
              key={club.id}
              onClick={() => onSelectClub(club.id)}
              className={`bg-white rounded-3xl py-5 px-6 text-center border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_-5px_rgba(0,114,222,0.16)] hover:border-[#0072de]/50 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none flex flex-col items-center justify-center min-h-[96px] sm:min-h-[105px] group ${
                isFifthCentered ? 'md:col-span-2 md:max-w-lg md:mx-auto w-full' : ''
              }`}
            >
              <h3 className="font-bold text-slate-900 text-lg sm:text-[21px] tracking-tight leading-snug mb-2 group-hover:text-[#0072de] transition-colors duration-200">
                {club.name}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs sm:text-sm font-semibold text-[#0072de] transition-colors duration-200">
                <span className="text-slate-600">{t('total')}</span>
                <span className="font-bold text-[#0072de]">{displayCount} {t('students')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button (FAB) (+) - Samsung One UI Blue Pill Button */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex items-center pointer-events-none">
        {/* Bong bóng nổi One UI: Đơn giản, trực quan, không liquid glass */}
        <div
          className={`pointer-events-none absolute right-full mr-3 px-3.5 py-1.5 rounded-full bg-slate-900 text-white shadow-lg text-xs font-semibold flex items-center gap-1.5 select-none transition-all duration-200 ${
            isPlusHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="whitespace-nowrap">{language === 'vi' ? 'Tạo CLB mới' : 'Create new club'}</span>
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </div>

        {/* Nút cộng (+) Samsung Blue */}
        <button
          onClick={onOpenAddClub}
          onMouseEnter={() => setIsPlusHovered(true)}
          onMouseLeave={() => setIsPlusHovered(false)}
          className="pointer-events-auto w-14 h-14 rounded-full bg-[#0072de] hover:bg-[#0060bd] active:scale-90 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center cursor-pointer transition-all duration-200"
          title={language === 'vi' ? 'Tạo CLB mới' : 'Create new club'}
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

export default HomeClubGridView;
