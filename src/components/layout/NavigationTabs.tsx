import React from 'react';
import { LayoutDashboard, GitFork, Users, FileCheck2, Award, Building2 } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'hierarchy' | 'students' | 'exams' | 'certificates' | 'clubs';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  counts: {
    students: number;
    exams: number;
    certificates: number;
    clubs: number;
  };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tổng Quan',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'hierarchy' as ActiveTab,
      label: 'Phân Cấp CLB & Đai',
      icon: GitFork,
      badge: '5 Cấp Đai'
    },
    {
      id: 'students' as ActiveTab,
      label: 'Quản Lý Võ Sinh',
      icon: Users,
      badge: counts.students
    },
    {
      id: 'exams' as ActiveTab,
      label: 'Kỳ Thi & Phiếu Thi',
      icon: FileCheck2,
      badge: counts.exams
    },
    {
      id: 'certificates' as ActiveTab,
      label: 'Văn Bằng Thăng Đai',
      icon: Award,
      badge: counts.certificates
    },
    {
      id: 'clubs' as ActiveTab,
      label: 'Câu Lạc Bộ',
      icon: Building2,
      badge: counts.clubs
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 border border-amber-300/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
