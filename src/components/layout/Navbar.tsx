import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, CloudOff, RefreshCw, Settings, Building2 } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const { clubs, selectedClubFilter, setSelectedClubFilter, syncStatus, syncToGoogleSheet, settings } = useApp();

  const handleQuickSync = async () => {
    await syncToGoogleSheet();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0072de] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 tracking-tight text-lg">PHẬT QUANG QUYỀN</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0072de] tracking-wider">
                PQQ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Hệ thống Quản lý Võ sinh & Thăng đai (Nội Bộ)
            </p>
          </div>
        </div>

        {/* Global Club Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span className="font-medium mr-2">CLB:</span>
            <select
              value={selectedClubFilter}
              onChange={e => setSelectedClubFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Toàn Bộ Môn Phái ({clubs.length} CLB)</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Controls: Sync status, Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Google Sheet Sync Indicator */}
          {settings.googleSheetScriptUrl ? (
            <button
              onClick={handleQuickSync}
              disabled={syncStatus === 'syncing'}
              title="Nhấn để đồng bộ dữ liệu ngay lên Google Sheets"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                syncStatus === 'syncing'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : syncStatus === 'synced'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-blue-600' : 'text-emerald-600'}`} />
              <span className="hidden sm:inline">
                {syncStatus === 'syncing' ? 'Đang đồng bộ...' : 'Google Sheet'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-50 text-[#0072de] border border-blue-200 hover:bg-blue-100"
              title="Chưa kết nối Google Sheet, bấm để thiết lập"
            >
              <CloudOff className="w-3.5 h-3.5 text-[#0072de]" />
              <span className="hidden sm:inline">Nối Google Sheet</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Cài đặt hệ thống & Google Sheet"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
