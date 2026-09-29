import React, { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { HomeClubGridView } from './components/dashboard/HomeClubGridView';
import { ClubWorkspaceView, ClubWorkspaceTab } from './components/clubs/ClubWorkspaceView';
import { QuickExamSheetCreator } from './components/exams/QuickExamSheetCreator';
import { ExamVideosView } from './components/exams/ExamVideosView';
import { CertificatesView } from './components/certificates/CertificatesView';
import { ClubsView } from './components/clubs/ClubsView';
import { ClubFormModal } from './components/clubs/ClubFormModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { StudentFormModal } from './components/students/StudentFormModal';
import { StudentDetailModal } from './components/students/StudentDetailModal';
import { CertificatePreviewModal } from './components/certificates/CertificatePreviewModal';
import { UserMenuSidebar } from './components/layout/UserMenuSidebar';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastContainer } from './components/ui/Toast';
import { Student, BeltRank } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
  RefreshCw
} from 'lucide-react';

export type AppView = 'home' | 'club-workspace' | 'quick-exam-creator' | 'videos' | 'certificates' | 'clubs' | 'exams';

interface RouteState {
  view: AppView;
  clubId: string;
  clubTab: ClubWorkspaceTab;
  attendanceSubPage: 'taking' | 'history' | 'report';
}

function parseHashRoute(hash: string): RouteState {
  const cleanHash = hash.replace(/^#\/?/, '').trim();
  const parts = cleanHash.split('/').filter(Boolean);

  const fallback: RouteState = {
    view: 'home',
    clubId: 'clb-pq1',
    clubTab: 'overview',
    attendanceSubPage: 'taking'
  };

  if (parts.length === 0 || parts[0] === 'home') {
    return fallback;
  }

  if (parts[0] === 'club') {
    const clubId = parts[1] || 'clb-pq1';
    const rawTab = parts[2];
    const rawSubPage = parts[3];

    const validTabs: ClubWorkspaceTab[] = ['overview', 'students', 'attendance', 'exam-reg', 'video-submit', 'certificates'];
    const clubTab: ClubWorkspaceTab = validTabs.includes(rawTab as ClubWorkspaceTab) ? (rawTab as ClubWorkspaceTab) : 'overview';
    const attendanceSubPage = rawSubPage === 'history' ? 'history' : rawSubPage === 'report' ? 'report' : 'taking';

    return {
      view: 'club-workspace',
      clubId,
      clubTab,
      attendanceSubPage
    };
  }

  const validViews: AppView[] = ['quick-exam-creator', 'videos', 'certificates', 'clubs', 'exams'];
  if (validViews.includes(parts[0] as AppView)) {
    return {
      ...fallback,
      view: parts[0] as AppView
    };
  }

  return fallback;
}

function buildHashRoute(state: RouteState): string {
  if (state.view === 'home') {
    return '#/';
  }
  if (state.view === 'club-workspace') {
    if (state.clubTab === 'attendance' && state.attendanceSubPage === 'history') {
      return `#/club/${state.clubId}/attendance/history`;
    }
    if (state.clubTab === 'attendance' && state.attendanceSubPage === 'report') {
      return `#/club/${state.clubId}/attendance/report`;
    }
    if (state.clubTab === 'overview') {
      return `#/club/${state.clubId}`;
    }
    return `#/club/${state.clubId}/${state.clubTab}`;
  }
  return `#/${state.view}`;
}

const pageVariants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 36 : -36,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -36 : 36,
    opacity: 0,
  }),
};

const AppContent: React.FC = () => {
  const { clubs, students, certificates, settings, syncStatus, syncToGoogleSheet, addToast } = useApp();
  const { isUnlocked, userRole, userName, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Khôi phục URL route: nếu chưa đăng nhập hoặc vừa login, luôn luôn bắt đầu từ 'home'
  const initialRoute = React.useMemo(() => {
    try {
      const savedAuth = localStorage.getItem('pqq_auth_session_v2');
      if (!savedAuth) {
        return {
          view: 'home' as AppView,
          clubId: 'clb-pq1',
          clubTab: 'overview' as ClubWorkspaceTab,
          attendanceSubPage: 'taking' as 'taking' | 'history' | 'report'
        };
      }
    } catch {
      // ignore
    }
    const hash = window.location.hash;
    if (hash && hash !== '#' && hash !== '#/') {
      return parseHashRoute(hash);
    }
    const savedRoute = localStorage.getItem('pqq_last_route');
    if (savedRoute && savedRoute !== '#' && savedRoute !== '#/') {
      return parseHashRoute(savedRoute);
    }
    return {
      view: 'home' as AppView,
      clubId: 'clb-pq1',
      clubTab: 'overview' as ClubWorkspaceTab,
      attendanceSubPage: 'taking' as 'taking' | 'history' | 'report'
    };
  }, []);

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const [selectedClubId, setSelectedClubId] = useState<string>(initialRoute.clubId);
  const [currentClubTab, setCurrentClubTab] = useState<ClubWorkspaceTab>(initialRoute.clubTab);
  const [currentAttendanceSubPage, setCurrentAttendanceSubPage] = useState<'taking' | 'history' | 'report'>(initialRoute.attendanceSubPage);
  const [selectedBeltFilter, setSelectedBeltFilter] = useState<string>('ALL');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isClubFormOpen, setIsClubFormOpen] = useState(false);
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');

  // Theo dõi trạng thái đăng nhập: Khi người dùng bấm Login (từ false -> true)
  // Lộ trình PHẢI LUÔN LUÔN là: Login => Home => CLB... (không bao giờ nhảy thẳng vào CLB)
  const prevUnlockedRef = useRef(isUnlocked);
  useEffect(() => {
    if (!prevUnlockedRef.current && isUnlocked) {
      setCurrentView('home');
      setSelectedClubId('clb-pq1');
      setCurrentClubTab('overview');
      setCurrentAttendanceSubPage('taking');
      window.location.hash = '#/';
      try {
        localStorage.setItem('pqq_last_route', '#/');
      } catch {
        // ignore
      }
    }
    prevUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  // Đồng bộ URL hash và localStorage mỗi khi chuyển trang / tab
  useEffect(() => {
    const routeState: RouteState = {
      view: currentView,
      clubId: selectedClubId,
      clubTab: currentClubTab,
      attendanceSubPage: currentAttendanceSubPage
    };
    const targetHash = buildHashRoute(routeState);
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
    localStorage.setItem('pqq_last_route', targetHash);
  }, [currentView, selectedClubId, currentClubTab, currentAttendanceSubPage]);

  // Hỗ trợ nút Back / Forward của trình duyệt
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHashRoute(window.location.hash);
      setCurrentView(parsed.view);
      setSelectedClubId(parsed.clubId);
      setCurrentClubTab(parsed.clubTab);
      setCurrentAttendanceSubPage(parsed.attendanceSubPage);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Profile Dropdown trên Web Laptop: Nhấn icon user để mở/đóng menu sổ xuống
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileOpen]);

  const navigateToView = (view: AppView, direction: 'forward' | 'backward' = 'forward') => {
    setSlideDirection(direction);
    setCurrentView(view);
    if (view === 'home') {
      setIsSearchOpen(false);
      setWorkspaceSearchQuery('');
    }
  };

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentDefaultClubId, setStudentDefaultClubId] = useState<string | undefined>(undefined);
  const [studentDefaultBelt, setStudentDefaultBelt] = useState<BeltRank | undefined>(undefined);
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  // Certificate Preview Modal
  const [previewCertId, setPreviewCertId] = useState<string | null>(null);
  const [isCertPreviewOpen, setIsCertPreviewOpen] = useState(false);

  const selectedCert = previewCertId ? certificates.find(c => c.id === previewCertId) || null : null;
  const currentClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  const handleOpenAddStudent = (clubId?: string, belt?: BeltRank) => {
    setStudentToEdit(null);
    setStudentDefaultClubId(clubId || (selectedClubId !== 'ALL' ? selectedClubId : undefined));
    setStudentDefaultBelt(belt);
    setIsStudentFormOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentFormOpen(true);
  };

  const handleViewStudentDetail = (studentId: string) => {
    setDetailStudentId(studentId);
  };

  const handleViewCertificate = (certId: string) => {
    setPreviewCertId(certId);
    setIsCertPreviewOpen(true);
  };

  const handleSelectClubFromHome = (clubId: string) => {
    setSelectedClubId(clubId);
    setCurrentClubTab('overview');
    setCurrentAttendanceSubPage('taking');
    navigateToView('club-workspace', 'forward');
  };

  const handleQuickSync = async () => {
    await syncToGoogleSheet();
  };

  // Nếu chưa đăng nhập, hiển thị màn hình Login
  if (!isUnlocked) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const isHomeView = currentView === 'home';

  return (
    <div
      className={`font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col relative text-slate-900 bg-[#f2f4f8] ${
        isHomeView || currentView === 'club-workspace'
          ? 'h-[100dvh] max-h-[100dvh] overflow-hidden'
          : 'min-h-[100dvh] bg-[#f2f4f8]'
      }`}
    >
      {/* Top Navbar - Samsung One UI Solid Minimalist Style (Zero Liquid Glass) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        {/* Left: Brand Logo & Title with responsive mobile native app bar layout */}
        {/* 1. Màn hình Mobile (md:hidden) */}
        <div className="md:hidden flex items-center min-w-0 flex-1 mr-2">
          {currentView === 'club-workspace' ? (
            <div
              onClick={() => navigateToView('home', 'backward')}
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform min-w-0"
              title="Về Trang Chủ"
            >
              <img
                src="/pqq-logo.png"
                alt="Phật Quang Quyền"
                className="w-7 h-7 object-contain drop-shadow-xs shrink-0"
              />
              <div className="flex flex-col text-left min-w-0">
                <span className="font-black text-slate-900 text-sm leading-tight truncate">
                  {currentClub?.name || 'Phước Quang Quyền'}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 leading-none mt-0.5 truncate">
                  Võ Đường Trí Vũ &bull; 2026
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => navigateToView('home', 'backward')}
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform min-w-0"
              title="Về Trang Chủ"
            >
              <img
                src="/pqq-logo.png"
                alt="Phật Quang Quyền"
                className="w-8 h-8 object-contain drop-shadow-xs shrink-0"
              />
              <div className="flex flex-col text-left min-w-0">
                <span className="font-extrabold text-[#0072de] text-sm leading-tight truncate">
                  Võ Đường Trí Vũ
                </span>
                <span className="text-[10px] font-semibold text-slate-500 leading-none mt-0.5 truncate">
                  Môn Phái Phật Quang Quyền
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Màn hình Desktop (hidden md:flex) - GIỮ NGUYÊN 100% BỐ CỤC WEB */}
        <div
          onClick={() => navigateToView('home', 'backward')}
          className="hidden md:flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity shrink-0 min-w-0"
          title="Về Trang Chủ"
        >
          <img
            src="/pqq-logo.png"
            alt="Phật Quang Quyền"
            className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
          />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-extrabold text-[#0072de] text-base md:text-lg tracking-tight leading-tight truncate">
              Phước Quang System
            </span>
            <span className="text-xs font-semibold text-slate-500 leading-none mt-0.5 truncate">
              {currentView === 'club-workspace' ? currentClub?.name : 'Hệ Thống Quản Lý 5 CLB Môn Phái'}
            </span>
          </div>
        </div>

        {/* Right Navigation: ONLY ICONS (Home, Animated Search with External Button, User Avatar) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1. Icon Trang Chủ (Home) - Chỉ hiển thị trên Desktop khi KHÔNG ở trang chủ (chọn CLB) */}
          {currentView !== 'home' && (
            <button
              onClick={() => navigateToView('home', 'backward')}
              className="hidden md:flex p-2 sm:p-2.5 rounded-full text-slate-600 hover:text-[#0072de] hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-95 animate-in fade-in duration-200"
              title="Về Trang Chủ (Chọn CLB)"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          {/* 2. Nút Hoán Đổi Ngôn Ngữ trên Web Laptop (Chỉ hiện icon lá cờ Anh - Việt, thay thế hoàn toàn nút Setting) */}
          <button
            type="button"
            onClick={() => {
              const nextLang = language === 'vi' ? 'en' : 'vi';
              setLanguage(nextLang);
              addToast(
                nextLang === 'en' ? 'Switched to English' : 'Đã chuyển sang Tiếng Việt',
                'info',
                nextLang === 'en' ? 'Language' : 'Ngôn ngữ'
              );
            }}
            className="hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 active:scale-90 items-center justify-center transition-all duration-200 cursor-pointer border border-slate-200 bg-white shadow-2xs shrink-0 select-none"
            title={language === 'vi' ? 'Chuyển sang Tiếng Anh (English)' : 'Chuyển sang Tiếng Việt'}
            aria-label="Hoán đổi ngôn ngữ"
          >
            {language === 'vi' ? (
              /* Lá cờ Việt Nam */
              <svg viewBox="0 0 512 512" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-2xs shrink-0 pointer-events-none">
                <circle cx="256" cy="256" r="256" fill="#da251d" />
                <polygon
                  fill="#ffff00"
                  points="256,92 296,215 425,215 321,291 361,414 256,338 151,414 191,291 87,215 216,215"
                />
              </svg>
            ) : (
              /* Lá cờ Anh (UK) */
              <svg viewBox="0 0 512 512" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-2xs shrink-0 pointer-events-none">
                <clipPath id="uk-flag-header-circle">
                  <circle cx="256" cy="256" r="256" />
                </clipPath>
                <g clipPath="url(#uk-flag-header-circle)">
                  <path fill="#012169" d="M0 0h512v512H0z"/>
                  <path fill="#FFF" d="M0 0l512 512m0-512L0 512" stroke="#FFF" strokeWidth="60"/>
                  <path fill="#C8102E" d="M0 0l512 512m0-512L0 512" stroke="#C8102E" strokeWidth="40"/>
                  <path fill="#FFF" d="M256 0v512M0 256h512" stroke="#FFF" strokeWidth="100"/>
                  <path fill="#C8102E" d="M256 0v512M0 256h512" stroke="#C8102E" strokeWidth="60"/>
                </g>
              </svg>
            )}
          </button>

          {/* 3. Icon Tìm Kiếm (Search) - CHỈ hiển thị trong trang CLB */}
          {currentView === 'club-workspace' && (
            <div
              className={`flex items-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                isSearchOpen
                  ? 'bg-slate-100 border border-slate-300/80 p-1 pl-3.5 shadow-2xs w-48 sm:w-64 md:w-72'
                  : 'w-9 h-9 sm:w-10 sm:h-10 bg-transparent border-transparent justify-center'
              }`}
            >
              {!isSearchOpen ? (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full h-full flex items-center justify-center rounded-full text-slate-600 hover:text-[#0072de] hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-95"
                  title="Tìm kiếm"
                >
                  <Search className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center w-full gap-1.5 animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Tìm kiếm võ sinh, hồ sơ..."
                    value={workspaceSearchQuery}
                    onChange={e => setWorkspaceSearchQuery(e.target.value)}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        setIsSearchOpen(false);
                      }
                    }}
                    className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currentView !== 'club-workspace') {
                        setCurrentView('club-workspace');
                      }
                    }}
                    className="p-1.5 rounded-full bg-[#0072de] hover:bg-[#0060bd] active:scale-90 text-white transition-all duration-200 cursor-pointer shrink-0 shadow-2xs"
                    title="Nhấn để tìm kiếm"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setWorkspaceSearchQuery('');
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-200 active:scale-90 text-slate-400 hover:text-slate-600 transition-all duration-200 cursor-pointer shrink-0"
                    title="Đóng tìm kiếm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Nút Menu 3 gạch ngang (Mobile) / User Avatar (Desktop) */}
          {/* Mobile: 3 gạch ngang menu bấm mở sidebar trượt từ phải sang (áp dụng cho mọi trang từ home trở đi) */}
          <button
            type="button"
            onClick={() => setIsRightSidebarOpen(true)}
            className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition-all duration-200 cursor-pointer shrink-0 shadow-2xs"
            title="Menu hệ thống"
            aria-label="Menu hệ thống"
          >
            <Menu className="w-5 h-5 text-slate-700 stroke-[2.2]" />
          </button>

          {/* Desktop: User Avatar (nhấn icon user sổ menu có thông tin Admin và nút đăng xuất, KHÔNG mở sidebar) */}
          <div
            ref={profileDropdownRef}
            className="hidden md:block relative"
          >
            <button
              type="button"
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0072de] hover:bg-[#0060bd] active:scale-95 flex items-center justify-center text-white shadow-xs transition-all duration-200 cursor-pointer shrink-0"
              title="Tài khoản người dùng"
              aria-expanded={isProfileOpen}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Profile Dropdown Popup Card with smooth Framer Motion Animation */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 pt-2 z-50 select-none"
                >
                  <div className="w-64 bg-white rounded-3xl shadow-xl border border-slate-200/90 p-4 space-y-3">
                    {/* Thông tin Admin */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100/80 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0072de] to-[#005bb5] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <User className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-extrabold text-slate-900 text-sm truncate leading-tight">
                          {userName || 'Quản trị viên'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="text-[11px] font-bold text-[#0072de] truncate">
                            {userRole === 'ADMIN' ? (language === 'vi' ? 'Quản trị viên' : 'Administrator') : userRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nút Đồng bộ Google Sheets */}
                    <button
                      type="button"
                      disabled={syncStatus === 'syncing'}
                      onClick={async () => {
                        await syncToGoogleSheet();
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${syncStatus === 'syncing' ? 'bg-blue-100 text-[#0072de]' : 'bg-emerald-50 text-emerald-600'}`}>
                          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                        </div>
                        <span>{syncStatus === 'syncing' ? (language === 'vi' ? 'Đang đồng bộ...' : 'Syncing...') : (language === 'vi' ? 'Đồng bộ Google Sheets' : 'Sync Google Sheets')}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#0072de] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        Sync
                      </span>
                    </button>

                    {/* Nút Đăng xuất */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setCurrentView('home');
                        setSelectedClubId('clb-pq1');
                        setCurrentClubTab('overview');
                        setCurrentAttendanceSubPage('taking');
                        window.location.hash = '#/';
                        try {
                          localStorage.setItem('pqq_last_route', '#/');
                        } catch {
                          // ignore
                        }
                        logout();
                      }}
                      className="w-full py-2.5 px-4 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      <LogOut className="w-4 h-4 stroke-[2.2]" />
                      <span>{language === 'vi' ? 'Đăng xuất' : 'Sign out'}</span>
                    </button>

                    <div className="text-center pt-1 border-t border-slate-100 text-[10px] font-semibold text-slate-400">
                      Version 1.0.1 &bull; Võ Đường Trí Vũ
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Area with Smooth Slide Page Transition */}
      <main
        className={`flex-1 w-full mx-auto min-h-0 relative ${
          isHomeView
            ? 'flex flex-col justify-center items-center px-4 sm:px-6 py-2 overflow-hidden'
            : currentView === 'club-workspace'
              ? 'w-full flex-1 flex flex-col p-0 overflow-hidden'
              : 'max-w-7xl p-4 sm:p-6 lg:p-8'
        }`}
      >
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={currentView === 'club-workspace' ? `${currentView}-${selectedClubId}` : currentView}
            custom={slideDirection}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full ${
              isHomeView || currentView === 'club-workspace'
                ? 'h-full flex-1 flex flex-col min-h-0'
                : 'space-y-6'
            }`}
          >
            {/* 1. TRANG CHỦ: CÁC KHỐI Ô VUÔNG TÊN CLB VÀ TỔNG SỐ LƯỢNG VÕ SINH */}
            {currentView === 'home' && (
              <HomeClubGridView
                onSelectClub={handleSelectClubFromHome}
                onNavigateToExams={() => navigateToView('videos', 'forward')}
                onNavigateToCertificates={() => navigateToView('certificates', 'forward')}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenAddClub={() => setIsClubFormOpen(true)}
              />
            )}

            {/* 2. TRANG TIẾP THEO: CLUB WORKSPACE */}
            {currentView === 'club-workspace' && (
              <ClubWorkspaceView
                clubId={selectedClubId}
                searchQuery={workspaceSearchQuery}
                initialTab={currentClubTab}
                onTabChange={tab => setCurrentClubTab(tab)}
                initialAttendanceSubPage={currentAttendanceSubPage}
                onAttendanceSubPageChange={subPage => setCurrentAttendanceSubPage(subPage)}
                onBackToHome={() => navigateToView('home', 'backward')}
                onOpenAddStudent={handleOpenAddStudent}
                onOpenEditStudent={handleOpenEditStudent}
                onViewStudentDetail={handleViewStudentDetail}
                onSelectAnotherClub={handleSelectClubFromHome}
              />
            )}

            {/* 3. TRANG VIDEO BÀI THI & CHẤM ĐIỂM */}
            {(currentView === 'videos' || currentView === 'exams') && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                  <button
                    onClick={() => navigateToView('home', 'backward')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                    <span>&larr; Quay lại Trang Chủ</span>
                  </button>
                  <span className="text-xs font-bold text-slate-500">
                    Hội Đồng Ban Giám Khảo &bull; Quản Lý Video Nộp Bài Thi &amp; Chấm Điểm
                  </span>
                </div>
                <ExamVideosView
                  initialClubId={selectedClubId}
                  onNavigateToCertificates={() => navigateToView('certificates', 'forward')}
                />
              </div>
            )}

            {/* 4. TRANG SỔ VĂN BẰNG TOÀN HỆ THỐNG */}
            {currentView === 'certificates' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                  <button
                    onClick={() => navigateToView('home', 'backward')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                    <span>&larr; Quay lại Trang Chủ</span>
                  </button>
                  <span className="text-xs font-bold text-slate-500">
                    Sổ Văn Bằng &bull; Môn Phái Phật Quang Quyền
                  </span>
                </div>
                <CertificatesView initialSelectedCertId={previewCertId} />
              </div>
            )}

            {/* 5. TRANG ĐĂNG KÝ THI THĂNG ĐAI */}
            {currentView === 'quick-exam-creator' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                  <button
                    onClick={() => navigateToView('home', 'backward')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                    <span>&larr; Quay lại Trang Chủ</span>
                  </button>
                  <span className="text-xs font-bold text-slate-500">
                    Quản Lý Đăng Ký Thi Thăng Đai
                  </span>
                </div>
                <QuickExamSheetCreator
                  initialClubId={selectedClubId}
                  initialBelt={selectedBeltFilter}
                />
              </div>
            )}

            {/* 6. TRANG DANH SÁCH CLB */}
            {currentView === 'clubs' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                  <button
                    onClick={() => navigateToView('home', 'backward')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                    <span>&larr; Quay lại Trang Chủ</span>
                  </button>
                  <span className="text-xs font-bold text-slate-500">
                    Danh Sách 5 Câu Lạc Bộ
                  </span>
                </div>
                <ClubsView
                  onNavigateToHierarchy={() => {
                    navigateToView('quick-exam-creator', 'forward');
                  }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Modals */}
      <StudentFormModal
        isOpen={isStudentFormOpen}
        onClose={() => setIsStudentFormOpen(false)}
        studentToEdit={studentToEdit}
        defaultClubId={studentDefaultClubId}
        defaultBelt={studentDefaultBelt}
      />

      <StudentDetailModal
        studentId={detailStudentId}
        onClose={() => setDetailStudentId(null)}
        onEdit={(id) => {
          setDetailStudentId(null);
          const student = students.find(s => s.id === id);
          if (student) handleOpenEditStudent(student);
        }}
        onViewCertificate={handleViewCertificate}
      />

      <CertificatePreviewModal
        isOpen={isCertPreviewOpen}
        onClose={() => setIsCertPreviewOpen(false)}
        certificate={selectedCert}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ClubFormModal
        isOpen={isClubFormOpen}
        onClose={() => setIsClubFormOpen(false)}
      />

      {/* Right Slide-in Menu Sidebar (Mobile & Desktop) */}
      <UserMenuSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        onNavigateHome={() => {
          setCurrentView('home');
          setSelectedClubId('clb-pq1');
          setCurrentClubTab('overview');
          setCurrentAttendanceSubPage('taking');
          window.location.hash = '#/';
          try {
            localStorage.setItem('pqq_last_route', '#/');
          } catch {
            // ignore
          }
        }}
      />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
