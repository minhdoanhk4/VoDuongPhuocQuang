import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Users,
  FileCheck2,
  FilePlus2,
  Building2,
  Settings,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Layers
} from 'lucide-react';

export type MainNavView = 'home' | 'quick-exam-creator' | 'exams' | 'certificates' | 'clubs' | 'settings';

interface AppSidebarProps {
  currentView: MainNavView;
  onNavigate: (view: MainNavView) => void;
  selectedClubId: string;
  onSelectClub: (clubId: string) => void;
  selectedBeltFilter: string;
  onSelectBeltFilter: (belt: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  selectedClubId,
  onSelectClub,
  selectedBeltFilter,
  onSelectBeltFilter,
  isOpen,
  onCloseMobile
}) => {
  const { clubs, students } = useApp();

  const handleNav = (view: MainNavView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const handleSelectClub = (id: string) => {
    onSelectClub(id);
    onNavigate('home');
    onCloseMobile();
  };

  const handleSelectBelt = (belt: string) => {
    onSelectBeltFilter(belt);
    onNavigate('quick-exam-creator');
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0072de] flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">PHẬT QUANG QUYỀN</span>
              </div>
              <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">
                Thư Ký & Quản Lý 5 CLB
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Chức năng Thư Ký
            </span>

            <nav className="space-y-1">
              <button
                onClick={() => handleNav('home')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-[#0072de] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="flex-1 text-left">Quản Lý Võ Sinh &amp; CLB</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-blue-400">
                  {students.length}
                </span>
              </button>

              <button
                onClick={() => handleNav('quick-exam-creator')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'quick-exam-creator'
                    ? 'bg-[#0072de] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <FilePlus2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="flex-1 text-left">Đăng Ký Thi Thăng Đai</span>
              </button>

              <button
                onClick={() => handleNav('exams')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'exams'
                    ? 'bg-[#0072de] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="flex-1 text-left">Video Bài Thi &amp; Chấm Điểm</span>
              </button>

              <button
                onClick={() => handleNav('certificates')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'certificates'
                    ? 'bg-[#0072de] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Award className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="flex-1 text-left">Quản Lý Văn Bằng (PDF)</span>
              </button>

              <button
                onClick={() => handleNav('clubs')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'clubs'
                    ? 'bg-[#0072de] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="flex-1 text-left">Danh Sách 5 CLB</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
                  {clubs.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Quick Filter Section: 5 CLB */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                5 Câu Lạc Bộ
              </span>
              <button
                onClick={() => handleSelectClub('ALL')}
                className="text-[10px] text-blue-400 hover:underline font-bold"
              >
                Tất cả
              </button>
            </div>

            <div className="space-y-1">
              {clubs.map(club => {
                const count = students.filter(s => s.clubId === club.id).length;
                const isSelected = selectedClubId === club.id && currentView === 'home';
                return (
                  <button
                    key={club.id}
                    onClick={() => handleSelectClub(club.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate">{club.name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filter Section: Cấp đai */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Tạo Phiếu Theo Cấp Đai
            </span>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => handleSelectBelt('LAM_DAI')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Lam Đai (Sơ cấp)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelectBelt('LUC_DAI')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Lục Đai (Trung cấp)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelectBelt('HONG_DAI')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Hồng Đai (Nâng cao)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelectBelt('HOANG_DAI')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Hoàng Đai (HLV)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelectBelt('BACH_DAI')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                  <span>Bạch Đai (Thượng đẳng)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => handleNav('settings')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Cài Đặt & Google Sheet</span>
          </button>
        </div>
      </aside>
    </>
  );
};
