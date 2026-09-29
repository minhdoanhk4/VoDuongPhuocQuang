import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Globe,
  LogOut,
  Check,
  ShieldCheck,
  RefreshCw,
  Cloud
} from 'lucide-react';

interface UserMenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome?: () => void;
}

export const UserMenuSidebar: React.FC<UserMenuSidebarProps> = ({
  isOpen,
  onClose,
  onNavigateHome
}) => {
  const { userName, userRole, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { syncStatus, syncToGoogleSheet, lastSyncMessage, addToast } = useApp();

  // Đóng sidebar khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang nền khi mở sidebar trên thiết bị di động
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelectLanguage = (lang: 'vi' | 'en') => {
    if (lang === language) return;
    setLanguage(lang);
    if (lang === 'en') {
      addToast('Language switched to English', 'info', 'Language');
    } else {
      addToast('Đã chuyển sang Tiếng Việt', 'info', 'Ngôn ngữ');
    }
  };

  const handleLogout = () => {
    onClose();
    if (onNavigateHome) {
      onNavigateHome();
    }
    logout();
  };

  const roleLabel =
    userRole === 'ADMIN'
      ? t('admin_role_badge')
      : userRole === 'COACH'
        ? language === 'vi'
          ? 'Huấn Luyện Viên'
          : 'Club Coach'
        : language === 'vi'
          ? 'Ban Giám Khảo'
          : 'Examiner';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Lớp nền mờ backdrop - bấm vào để đóng */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          {/* Khung Sidebar trượt từ phải sang (Slide-in drawer from right) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-[84vw] max-w-xs sm:w-88 h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto select-none"
            aria-label={t('menu_title')}
          >
            {/* PHẦN TRÊN: HEADER & CÁC MỤC NỘI DUNG */}
            <div className="p-4 sm:p-5 space-y-5">
              {/* Header của Sidebar: Tiêu đề & Nút đóng (X) */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base tracking-tight">
                    {t('menu_title')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
                  title={t('close')}
                  aria-label={t('close')}
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* MỤC 1: Ô ADMIN CÓ ICON USER */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  {t('admin_card_title')}
                </span>
                <div className="bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border border-blue-100/90 rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    {/* Icon User nổi bật */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0072de] to-[#005bb5] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                      <User className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base leading-snug truncate">
                        {userName || 'Quản trị viên'}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100/80 text-[#0072de]">
                          <ShieldCheck className="w-3 h-3 text-[#0072de]" />
                          <span>{roleLabel}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="truncate">{t('admin_status_active')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-blue-100/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span className="truncate">Võ Đường Trí Vũ &bull; 2026</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shrink-0">
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* MỤC 2: MỤC CHUYỂN ĐỔI NGÔN NGỮ VIỆT - ANH */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  {t('language_section')}
                </span>

                <div className="space-y-2">
                  {/* Nút chọn Tiếng Việt */}
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage('vi')}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      language === 'vi'
                        ? 'bg-blue-50/80 border-[#0072de] shadow-2xs'
                        : 'bg-white border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">🇻🇳</span>
                      <div className="text-left">
                        <div
                          className={`text-xs font-bold ${
                            language === 'vi' ? 'text-[#0072de]' : 'text-slate-800'
                          }`}
                        >
                          {t('lang_vietnamese')}
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">
                          Ngôn ngữ mặc định
                        </span>
                      </div>
                    </div>
                    {language === 'vi' && (
                      <div className="w-6 h-6 rounded-full bg-[#0072de] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  {/* Nút chọn Tiếng Anh */}
                  <button
                    type="button"
                    onClick={() => handleSelectLanguage('en')}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-blue-50/80 border-[#0072de] shadow-2xs'
                        : 'bg-white border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">🇬🇧</span>
                      <div className="text-left">
                        <div
                          className={`text-xs font-bold ${
                            language === 'en' ? 'text-[#0072de]' : 'text-slate-800'
                          }`}
                        >
                          {t('lang_english')}
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">
                          English Interface
                        </span>
                      </div>
                    </div>
                    {language === 'en' && (
                      <div className="w-6 h-6 rounded-full bg-[#0072de] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* MỤC 3: ĐỒNG BỘ DỮ LIỆU GOOGLE SHEETS */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  Đồng bộ Google Sheets
                </span>
                <button
                  type="button"
                  disabled={syncStatus === 'syncing'}
                  onClick={async () => {
                    await syncToGoogleSheet();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${syncStatus === 'syncing' ? 'bg-blue-100 text-[#0072de]' : 'bg-emerald-50 text-emerald-600'}`}>
                      <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {syncStatus === 'syncing' ? 'Đang đồng bộ...' : 'Đồng bộ Google Sheets'}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 block truncate">
                        {lastSyncMessage || 'Tự động đồng bộ 2 chiều'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-[#0072de] bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 shrink-0">
                    Sync
                  </div>
                </button>
              </div>
            </div>

            {/* PHẦN DƯỚI: MỤC 3: ĐĂNG XUẤT & PHIÊN BẢN HỆ THỐNG */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 space-y-3">
              {/* MỤC 3: MỤC ĐĂNG XUẤT */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-[0.98] border border-rose-200/80 text-rose-600 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4 stroke-[2.2]" />
                <span>{t('logout_button')}</span>
              </button>

              <div className="text-center">
                <span className="text-[11px] font-medium text-slate-400">
                  {t('version')} &bull; Võ Đường Trí Vũ
                </span>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserMenuSidebar;
