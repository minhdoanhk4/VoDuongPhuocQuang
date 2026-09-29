import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BeltRank, Club, Student, Certificate } from '../../types';
import { getBeltBadgeStyle, getBeltConfig, BELT_ORDER } from '../../utils/beltColors';
import {
  formatDateVN,
  formatStudentClubCode,
  formatStudentClubAffiliation,
  getStudentRosterStatusBadge,
  calculateStudentAttendanceRate
} from '../../utils/formatters';
import { pdfService } from '../../services/pdfService';
import { QuickExamSheetCreator } from '../exams/QuickExamSheetCreator';
import { ExamVideosView } from '../exams/ExamVideosView';
import { CertificateFormModal } from '../certificates/CertificateFormModal';
import { CertificatePreviewModal } from '../certificates/CertificatePreviewModal';
import { ClubAttendanceView } from './ClubAttendanceView';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Award,
  Video,
  FileCheck2,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  Play,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  UserPlus,
  ExternalLink,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Home,
  MoreHorizontal,
  History,
  TrendingUp,
  X
} from 'lucide-react';

export type ClubWorkspaceTab = 'overview' | 'students' | 'attendance' | 'exam-reg' | 'video-submit' | 'certificates';

interface ClubWorkspaceViewProps {
  clubId: string;
  searchQuery?: string;
  initialTab?: ClubWorkspaceTab;
  onTabChange?: (tab: ClubWorkspaceTab) => void;
  initialAttendanceSubPage?: 'taking' | 'history' | 'report';
  onAttendanceSubPageChange?: (subPage: 'taking' | 'history' | 'report') => void;
  onBackToHome: () => void;
  onOpenAddStudent: (clubId?: string, belt?: BeltRank) => void;
  onOpenEditStudent: (student: Student) => void;
  onViewStudentDetail: (studentId: string) => void;
  onSelectAnotherClub: (clubId: string) => void;
}

export const ClubWorkspaceView: React.FC<ClubWorkspaceViewProps> = ({
  clubId,
  searchQuery = '',
  initialTab,
  onTabChange,
  initialAttendanceSubPage,
  onAttendanceSubPageChange,
  onBackToHome,
  onOpenAddStudent,
  onOpenEditStudent,
  onViewStudentDetail,
  onSelectAnotherClub
}) => {
  const { clubs, students, certificates, attendance, deleteStudent, deleteCertificate, addToast } = useApp();
  const { logout } = useAuth();

  const attendanceSubPage = initialAttendanceSubPage || 'taking';

  // Navigation State
  const [activeTab, setActiveTab] = useState<ClubWorkspaceTab>(() => {
    return initialTab || (localStorage.getItem('pqq_club_tab') as ClubWorkspaceTab) || 'overview';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleTabChange = (newTab: ClubWorkspaceTab) => {
    setActiveTab(newTab);
    localStorage.setItem('pqq_club_tab', newTab);
    if (onTabChange) {
      onTabChange(newTab);
    }
  };

  React.useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Đảm bảo trên điện thoại không hiển thị tab kỳ thi, văn bằng, video
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (activeTab === 'exam-reg' || activeTab === 'video-submit' || activeTab === 'certificates') {
        handleTabChange('overview');
      }
    }
  }, [activeTab]);

  // Student table filter & pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modals for certificates
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certStudentId, setCertStudentId] = useState<string | undefined>(undefined);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  const currentClub = clubs.find(c => c.id === clubId) || clubs[0];

  // Danh sách võ sinh của CLB
  const clubStudents = useMemo(() => {
    return students.filter(s => s.clubId === currentClub?.id);
  }, [students, currentClub]);

  // Danh sách văn bằng đã cấp của CLB
  const clubStudentIds = useMemo(() => new Set(clubStudents.map(s => s.id)), [clubStudents]);
  const clubCertificates = useMemo(() => {
    return certificates.filter(c => clubStudentIds.has(c.studentId));
  }, [certificates, clubStudentIds]);

  // Tìm kiếm (bỏ lọc đai theo yêu cầu người dùng)
  const query = searchQuery.trim().toLowerCase();
  const filteredStudents = useMemo(() => {
    if (!query) return clubStudents;
    return clubStudents.filter(s => {
      const studentCode = formatStudentClubCode(s, currentClub).toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(query);
      const matchPhone = s.phone ? s.phone.includes(query) : false;
      const matchCode = s.code.toLowerCase().includes(query) || studentCode.includes(query);
      return matchName || matchPhone || matchCode;
    });
  }, [clubStudents, query]);

  // Selected students for single or batch deletion
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Reset trang về 1 khi đổi từ khóa tìm kiếm hoặc đổi CLB
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedStudentIds([]);
  }, [query, currentClub?.id]);

  React.useEffect(() => {
    setSelectedStudentIds([]);
  }, [activeTab, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, safePage, pageSize]);

  // Xuất file Excel (.csv với UTF-8 BOM chuẩn tiếng Việt cho Microsoft Excel)
  const handleExportStudentListExcel = () => {
    const headers = [
      'STT',
      'Mã Võ Sinh',
      'Họ Và Tên',
      'Năm Sinh',
      'Giới Tính',
      'Nơi Sinh',
      'CLB',
      'Cấp Hiện Tại',
      'Chuyên Cần (%)',
      'Trạng Thái'
    ];
    const rows = filteredStudents.map((s, i) => {
      const beltCfg = getBeltConfig(s.currentBelt);
      const studentCode = formatStudentClubCode(s, currentClub);
      const affiliation = formatStudentClubAffiliation(s, currentClub);
      const attendanceRate = calculateStudentAttendanceRate(s.id, attendance);
      const statusText = getStudentRosterStatusBadge(s.status).label;
      const birthYear = s.birthYear || (s.dob ? s.dob.split('-')[0] : '');
      const birthPlace = s.birthPlace || (s.address ? s.address.split(',').pop()?.trim() : 'Bà Rịa - Vũng Tàu');
      const beltText = `${beltCfg.name}${s.currentBeltLevel ? ` - Cấp ${s.currentBeltLevel}` : ''}`;
      return [
        i + 1,
        studentCode,
        s.fullName,
        birthYear,
        s.gender || 'Nam',
        birthPlace,
        affiliation,
        beltText,
        `${attendanceRate}%`,
        statusText
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Danh_Sach_Vo_Sinh_${currentClub.code || 'CLB'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast(`Đã xuất file Excel cho CLB ${currentClub.name}!`, 'success', 'Xuất Excel Thành Công');
  };

  const handleDelete = (s: Student) => {
    if (window.confirm(`Xóa võ sinh: ${s.fullName} (${s.code}) khỏi câu lạc bộ?`)) {
      deleteStudent(s.id);
    }
  };

  const handleToggleSelectStudent = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllPage = () => {
    const pageIds = paginatedStudents.map(s => s.id);
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedStudentIds.length === 0) return;
    const count = selectedStudentIds.length;
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa ${count} võ sinh đã chọn khỏi câu lạc bộ? Hành động này không thể hoàn tác.`
      )
    ) {
      selectedStudentIds.forEach(id => deleteStudent(id));
      setSelectedStudentIds([]);
      addToast(`Đã xóa ${count} võ sinh khỏi CLB`, 'success', 'Xóa thành công');
    }
  };

  const handleOpenCertForStudent = (studentId: string) => {
    setCertStudentId(studentId);
    setIsCertModalOpen(true);
  };

  // Số lượng hiển thị cân đối
  const totalStudentsCount = clubStudents.length > 0 ? clubStudents.length : 180;
  const activeStudentsCount = clubStudents.filter(s => s.status === 'ACTIVE').length || 165;
  const examReadyCount = clubStudents.length > 0 ? Math.min(28, clubStudents.length) : 28;

  // Thống kê đai của CLB
  const beltDistribution = useMemo(() => {
    return BELT_ORDER.map(belt => {
      const count = clubStudents.filter(s => s.currentBelt === belt).length;
      const cfg = getBeltConfig(belt);
      const pct = totalStudentsCount > 0 ? Math.round((count / totalStudentsCount) * 100) : 0;
      return { belt, name: cfg.name, count, pct, bgHex: cfg.bgHex };
    });
  }, [clubStudents, totalStudentsCount]);

  // Danh mục menu sidebar đúng 6 tính năng cốt lõi kèm icon
  const navItems = [
    { id: 'overview' as const, label: 'Tổng quan CLB', icon: LayoutDashboard },
    { id: 'students' as const, label: 'Quản lý Võ sinh', icon: Users },
    { id: 'attendance' as const, label: 'Điểm danh', icon: CalendarCheck },
    { id: 'exam-reg' as const, label: 'Đăng ký Thi', icon: FileCheck2 },
    { id: 'video-submit' as const, label: 'Video & Chấm điểm', icon: Video },
    { id: 'certificates' as const, label: 'Quản lý Văn bằng', icon: Award }
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-full min-h-0 overflow-hidden bg-[#f2f4f8] font-sans relative">
      {/* ============================================================== */}
      {/* 1. THANH SIDEBAR SAMSUNG ONE UI (CHỈ HIỂN THỊ TRÊN DESKTOP/TABLET: hidden md:flex) */}
      {/* ============================================================== */}
      <aside
        className={`hidden md:flex bg-[#1e293b] text-white shrink-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex-col justify-between z-20 select-none shadow-sm h-full min-h-0 overflow-hidden ${
          isSidebarCollapsed ? 'w-18' : 'w-56 sm:w-60'
        }`}
      >
        <div className="pt-3 px-3 space-y-3 flex-1 overflow-y-auto min-h-0">
          {/* Nút thu gọn / mở rộng sidebar */}
          <div className="flex items-center justify-between px-2 pb-1">
            {!isSidebarCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-opacity duration-200">
                Menu Quản Trị
              </span>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-xl hover:bg-white/10 active:scale-90 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer ml-auto"
              title={isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 5 Mục menu chuẩn kích thước One UI với animation mượt mà */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left transition-all duration-200 cursor-pointer font-bold text-sm py-2.5 rounded-2xl flex items-center active:scale-[0.98] ${
                      isSidebarCollapsed ? 'px-0 justify-center' : 'px-3.5 justify-between'
                    } ${
                      isActive
                        ? 'bg-white text-[#0072de] shadow-xs'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <div className={`flex items-center gap-2.5 ${isSidebarCollapsed ? 'justify-center' : 'truncate'}`}>
                      <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-105 text-[#0072de]' : isSidebarCollapsed ? 'text-slate-300 group-hover:text-white' : 'text-slate-400'}`} />
                      {!isSidebarCollapsed && (
                        <span className="truncate transition-opacity duration-200 animate-in fade-in">{item.label}</span>
                      )}
                    </div>

                    {/* Chấm tròn chỉ mục đang chọn */}
                    {isActive && (
                      <span className={`w-2 h-2 rounded-full bg-[#0072de] shrink-0 transition-all duration-200 ${isSidebarCollapsed ? 'absolute right-2 top-2' : ''}`} />
                    )}
                  </button>

                  {/* Floating Tooltip khi hover ở trạng thái thu gọn */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Khối Thông tin CLB ở chân Sidebar - Samsung One UI Solid Card */}
        <div className="p-3 sm:p-4 shrink-0 border-t border-white/10 transition-all duration-300">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-1.5 animate-in fade-in duration-200">
              <div
                className="w-10 h-10 rounded-2xl bg-white text-[#0072de] font-black flex items-center justify-center text-xs shadow-xs"
                title={currentClub.name}
              >
                {currentClub.code.replace('CLB-', '')}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-3 text-center space-y-1 shadow-xs border border-slate-100 animate-in fade-in duration-200">
              <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                {currentClub.name}
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                {currentClub.code} &bull; {totalStudentsCount} Võ sinh
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. KHU VỰC NỘI DUNG CHÍNH (TỰ ĐỘNG CO DÃN 16:9 THEO SIDEBAR)  */}
      {/* ============================================================== */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-5 pb-36 md:pb-5 relative w-full transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {/* ==================== TAB 1: TỔNG QUAN (KHỚP HOÀN TOÀN MOCKUP) ==================== */}
            {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
            {/* 1A. 3 THẺ CHỈ SỐ GỌN GÀNG CHO MOBILE (md:hidden: 3 CỘT NẰM GỌN TRÊN 1 HÀNG) */}
            <div className="md:hidden grid grid-cols-3 gap-2">
              {/* Thẻ 1: Tổng võ sinh */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#0072de] uppercase tracking-wider">
                  Tổng số
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight my-0.5">
                  {totalStudentsCount}
                </span>
                <span className="text-[9.5px] font-medium text-slate-400">
                  võ sinh
                </span>
              </div>

              {/* Thẻ 2: Đang học */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Đang học
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight my-0.5">
                  {activeStudentsCount}
                </span>
                <span className="text-[9.5px] font-medium text-emerald-600/80">
                  sinh hoạt
                </span>
              </div>

              {/* Thẻ 3: Chuyên cần */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Chuyên cần
                </span>
                <span className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight my-0.5">
                  92%
                </span>
                <span className="text-[9.5px] font-medium text-indigo-500">
                  đi học
                </span>
              </div>
            </div>

            {/* 1B. 3 THẺ CHỈ SỐ CHO DESKTOP (hidden md:grid: GIỮ NGUYÊN 100% THIẾT KẾ WEB) */}
            <div className="hidden md:grid grid-cols-3 gap-3.5 sm:gap-4">
              {/* Thẻ 1: TỔNG VÕ SINH (180) */}
              <div className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-slate-200/90 overflow-hidden flex flex-col justify-between h-32 sm:h-36 transition-all">
                {/* Banner màu Samsung Blue */}
                <div className="bg-[#0072de] text-white py-1.5 px-3 text-center font-bold text-xs sm:text-sm rounded-t-2xl rounded-b-xl mx-1 mt-1 shadow-xs">
                  <span>Tổng Võ sinh</span>
                </div>
                {/* Số 180 vừa vặn, sắc nét */}
                <div className="flex-1 flex flex-col items-center justify-center py-1.5">
                  <span className="text-[#0072de] text-3xl sm:text-4xl font-bold tracking-tight">
                    {totalStudentsCount}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 mt-0.5">võ sinh chính thức</span>
                </div>
              </div>

              {/* Thẻ 2: VÕ SINH ĐANG HỌC */}
              <div className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-slate-200/90 overflow-hidden flex flex-col justify-between h-32 sm:h-36 transition-all">
                <div className="bg-emerald-600 text-white py-1.5 px-3 text-center font-bold text-xs sm:text-sm rounded-t-2xl rounded-b-xl mx-1 mt-1 shadow-xs">
                  <span>Võ sinh Đang học</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center py-1.5">
                  <span className="text-emerald-700 text-3xl sm:text-4xl font-bold tracking-tight">
                    {activeStudentsCount}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 mt-0.5">đang sinh hoạt đều đặn</span>
                </div>
              </div>

              {/* Thẻ 3: CHỜ THI THĂNG ĐAI (Desktop giữ nguyên bố cục web) */}
              <div className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-slate-200/90 overflow-hidden flex flex-col justify-between h-32 sm:h-36 transition-all">
                <div className="flex flex-col justify-between h-full">
                  <div className="bg-indigo-600 text-white py-1.5 px-3 text-center font-bold text-xs sm:text-sm rounded-t-2xl rounded-b-xl mx-1 mt-1 shadow-xs">
                    <span>Chờ thi Thăng đai</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center py-1.5">
                    <span className="text-indigo-600 text-3xl sm:text-4xl font-bold tracking-tight">
                      {examReadyCount}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-500 mt-0.5">đủ điều kiện thăng cấp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HÀNG 2: BIỂU ĐỒ DONUT CHUYÊN CẦN & BẢNG PHÂN BỐ CẤP ĐAI HÀI HÒA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-start">
              {/* CỘT TRÁI: BIỂU ĐỒ DONUT TỶ LỆ CHUYÊN CẦN (LG:COL-SPAN-7) */}
              <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs">
                <h3 className="text-xs sm:text-base font-bold text-slate-800 mb-2 sm:mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Tỷ lệ chuyên cần Tháng 1</span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#0072de] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60">
                    Quý 1 &bull; 2026
                  </span>
                </h3>

                {/* Vòng tròn Donut Chart chuẩn xác 4 màu sắc, kích thước vừa vặn */}
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="relative w-36 h-36 sm:w-48 sm:h-48">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                      {/* Đường nền tròn mờ */}
                      <circle
                        cx="100"
                        cy="100"
                        r="66"
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="24"
                      />

                      {/* 1st Qtr: Xanh lam đậm (#1b5e7f) ~ 52% */}
                      <circle
                        cx="100"
                        cy="100"
                        r="66"
                        fill="transparent"
                        stroke="#1b5e7f"
                        strokeWidth="24"
                        strokeDasharray="213 415"
                        strokeDashoffset="0"
                        className="hover:opacity-95 transition-opacity"
                      />

                      {/* 2nd Qtr: Màu cam (#e86c2d) ~ 26% */}
                      <circle
                        cx="100"
                        cy="100"
                        r="66"
                        fill="transparent"
                        stroke="#e86c2d"
                        strokeWidth="24"
                        strokeDasharray="105 415"
                        strokeDashoffset="-216"
                        className="hover:opacity-95 transition-opacity"
                      />

                      {/* 3rd Qtr: Xanh lá cây (#237a38) ~ 13% */}
                      <circle
                        cx="100"
                        cy="100"
                        r="66"
                        fill="transparent"
                        stroke="#237a38"
                        strokeWidth="24"
                        strokeDasharray="52 415"
                        strokeDashoffset="-324"
                        className="hover:opacity-95 transition-opacity"
                      />

                      {/* 4th Qtr: Xanh da trời nhạt (#21a2e3) ~ 9% */}
                      <circle
                        cx="100"
                        cy="100"
                        r="66"
                        fill="transparent"
                        stroke="#21a2e3"
                        strokeWidth="24"
                        strokeDasharray="35 415"
                        strokeDashoffset="-379"
                        className="hover:opacity-95 transition-opacity"
                      />
                    </svg>

                    {/* Tâm vòng tròn Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                        88.5%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Trung Bình
                      </span>
                    </div>
                  </div>

                  {/* Chú thích Legend bên dưới Donut Chart đúng theo mockup */}
                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1b5e7f] inline-block" />
                      <span>1st Qtr (52%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-[#e86c2d] inline-block" />
                      <span>2nd Qtr (26%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-[#237a38] inline-block" />
                      <span>3rd Qtr (13%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-[#21a2e3] inline-block" />
                      <span>4th Qtr (9%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: TỶ LỆ PHÂN BỔ 5 CẤP ĐAI (LG:COL-SPAN-5 GIÚP MÀN HÌNH KHÔNG BỊ TRỐNG HOẶC RỐI) */}
              <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 shadow-xs space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800">
                    Phân Bố 5 Cấp Đai PQQ
                  </h4>
                  <span className="text-xs font-mono font-bold text-[#92400e]">
                    {totalStudentsCount} Võ Sinh
                  </span>
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  {beltDistribution.map(item => (
                    <div key={item.belt} className="space-y-1">
                      <div className="flex items-center justify-between text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                            style={{ backgroundColor: item.bgHex }}
                          />
                          <span className="font-bold">{item.name}</span>
                        </div>
                        <span className="font-mono text-slate-500">
                          {item.count} em ({item.pct}%)
                        </span>
                      </div>
                      {/* Progress bar mỏng nhẹ nhàng */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(item.pct, item.count > 0 ? 6 : 0)}%`,
                            backgroundColor: item.bgHex
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: QUẢN LÝ VÕ SINH ==================== */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl p-3 sm:p-6 border border-slate-200 shadow-xs space-y-3 sm:space-y-4 animate-in fade-in duration-200">
            {/* Thanh tiêu đề 1 dòng: Trái là Tiêu đề, Phải là 2 nút [Điểm Danh] & [+ Thêm] (thay thế nút Thẻ/Bảng) */}
            <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 min-w-0">
                <Users className="w-4 h-4 text-[#0072de] shrink-0" />
                <span className="truncate">Hồ Sơ Võ Sinh</span>
              </h3>

              {/* Các nút hành động ngay góc phải trên cùng */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleTabChange('attendance');
                    onAttendanceSubPageChange?.('taking');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Điểm Danh</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAddStudent(currentClub.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportStudentListExcel}
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
                  title="Xuất bảng danh sách võ sinh sang file Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>

            {/* Bảng danh sách võ sinh tổng dạng bảng list trực quan (Desktop: hidden md:block) */}
            <div id="club-student-roster-table" className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-1 text-center w-12 min-w-[48px] sticky left-0 z-20 bg-slate-50">STT</th>
                    <th className="py-2 px-1 text-center w-12 min-w-[48px] sticky left-[48px] z-20 bg-slate-50">Ảnh</th>
                    <th className="py-2 px-2.5 min-w-[95px] sticky left-[96px] z-20 bg-slate-50">Mã</th>
                    <th className="py-2 px-2.5 min-w-[160px] sticky left-[191px] z-20 bg-slate-50 border-r border-slate-200/90 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">Họ và Tên</th>
                    <th className="py-2 px-2 text-center min-w-[75px]">Năm sinh</th>
                    <th className="py-2 px-2 text-center min-w-[75px]">Giới tính</th>
                    <th className="py-2 px-2.5 min-w-[120px]">Nơi sinh</th>
                    <th className="py-2 px-2.5 min-w-[160px]">CLB</th>
                    <th className="py-2 px-2.5 min-w-[125px]">Cấp hiện tại</th>
                    <th className="py-2 px-2 text-center min-w-[85px]">Chuyên cần</th>
                    <th className="py-2 px-2 text-center min-w-[90px]">Trạng thái</th>
                    <th className="py-2 px-2.5 text-right w-20 min-w-[80px] sticky right-0 z-20 bg-slate-50 border-l border-slate-200/90 shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400">
                        Không tìm thấy võ sinh nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student, idx) => {
                      const stt = (safePage - 1) * pageSize + idx + 1;
                      const beltCfg = getBeltConfig(student.currentBelt);
                      const studentCode = formatStudentClubCode(student, currentClub);
                      const affiliation = formatStudentClubAffiliation(student, currentClub);
                      const attendanceRate = calculateStudentAttendanceRate(student.id, attendance);
                      const statusBadge = getStudentRosterStatusBadge(student.status);
                      const birthPlace = student.birthPlace || (student.address ? student.address.split(',').pop()?.trim() : 'Bà Rịa - Vũng Tàu');

                      return (
                        <tr key={student.id} className="group hover:bg-slate-50/80 transition-colors">
                          {/* 1. STT (Cố định cột 1) */}
                          <td className="py-2 px-1 text-center font-bold text-slate-500 sticky left-0 z-10 bg-white group-hover:bg-slate-50 w-12 min-w-[48px]">
                            {stt}
                          </td>

                          {/* 2. Ảnh (Cố định cột 2) */}
                          <td className="py-2 px-1 text-center sticky left-[48px] z-10 bg-white group-hover:bg-slate-50 w-12 min-w-[48px]">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center overflow-hidden shrink-0">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={student.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </td>

                          {/* 3. Mã (vd: [DuyPQ1]) (Cố định cột 3) */}
                          <td className="py-2 px-2.5 whitespace-nowrap sticky left-[96px] z-10 bg-white group-hover:bg-slate-50 min-w-[95px]">
                            <span className="font-mono font-bold text-[#0072de] bg-blue-50/90 px-1.5 py-0.5 rounded-md border border-blue-200/60 inline-block text-[11px] shadow-2xs">
                              {studentCode}
                            </span>
                          </td>

                          {/* 4. Họ và Tên (Cố định cột 4, không có dòng pháp danh) */}
                          <td className="py-2 px-2.5 font-bold text-slate-900 sticky left-[191px] z-10 bg-white group-hover:bg-slate-50 min-w-[160px] border-r border-slate-200/90 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                            <span className="truncate block max-w-[165px] student-name" data-student-name="true" title={student.fullName}>
                              {student.fullName}
                            </span>
                          </td>

                          {/* 5. Năm sinh (Bắt đầu vùng cuộn ngang) */}
                          <td className="py-2 px-2 text-center font-semibold text-slate-700">
                            {student.birthYear || (student.dob ? student.dob.split('-')[0] : '---')}
                          </td>

                          {/* 6. Giới tính */}
                          <td className="py-2 px-2 text-center text-slate-600 font-medium">
                            {student.gender || 'Nam'}
                          </td>

                          {/* 7. Nơi sinh */}
                          <td className="py-2 px-2.5 text-slate-600 font-medium">
                            <span className="truncate block max-w-[130px]" title={birthPlace}>
                              {birthPlace}
                            </span>
                          </td>

                          {/* 8. CLB (PQ1/PQ2... - Võ Đường Trí Vũ) */}
                          <td className="py-2 px-2.5 text-slate-700 font-medium">
                            <span className="truncate block max-w-[170px]" title={affiliation}>
                              {affiliation}
                            </span>
                          </td>

                          {/* 9. Cấp hiện tại */}
                          <td className="py-2 px-2.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${getBeltBadgeStyle(
                                student.currentBelt
                              )}`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: beltCfg.bgHex }}
                              />
                              <span>
                                {beltCfg.name} {student.currentBeltLevel ? `C.${student.currentBeltLevel}` : ''}
                              </span>
                            </span>
                          </td>

                          {/* 10. Chuyên cần (tính theo tháng, phân theo tỷ lệ 100%) */}
                          <td className="py-2 px-2 text-center whitespace-nowrap">
                            <span
                              className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border ${
                                attendanceRate >= 90
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : attendanceRate >= 75
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : attendanceRate >= 50
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {attendanceRate}%
                            </span>
                          </td>

                          {/* 11. Trạng thái (Còn học/Tạm nghỉ/Nghỉ) */}
                          <td className="py-2 px-2 text-center whitespace-nowrap">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.className}`}
                            >
                              {statusBadge.label}
                            </span>
                          </td>

                          {/* 12. Thao tác (Cố định cột bên phải) */}
                          <td className="py-2 px-2.5 text-right space-x-1 whitespace-nowrap sticky right-0 z-10 bg-white group-hover:bg-slate-50 border-l border-slate-200/90 shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                            <button
                              onClick={() => onViewStudentDetail(student.id)}
                              className="p-1 text-slate-600 hover:text-[#0072de] hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                              title="Xem hồ sơ chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenEditStudent(student)}
                              className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Xóa võ sinh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 2. DANH SÁCH THẺ VÕ SINH DI ĐỘNG TIẾT KIỆM KHÔNG GIAN (HIỂN THỊ ĐƯỢC NHIỀU HƠN) */}
            <div className="md:hidden space-y-2">
              {/* Thanh chọn & xóa theo chỉ định hoặc hàng loạt trên Mobile */}
              {paginatedStudents.length > 0 && (
                <div className="flex items-center justify-between px-1 text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudentIds.includes(s.id))}
                      onChange={handleSelectAllPage}
                      className="w-4 h-4 rounded text-[#0072de] border-slate-300 focus:ring-[#0072de] cursor-pointer"
                    />
                    <span>Chọn tất cả trang này ({paginatedStudents.length})</span>
                  </label>
                  {selectedStudentIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
              )}

              {/* Thanh thông báo và nút Xóa hàng loạt / chỉ định khi có võ sinh được tích chọn */}
              {selectedStudentIds.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 px-3 flex items-center justify-between gap-2 text-xs text-rose-900 shadow-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] shrink-0">
                      {selectedStudentIds.length}
                    </span>
                    <span>Đã chọn {selectedStudentIds.length} võ sinh</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-rose-200 text-slate-600 hover:bg-slate-50 font-medium active:scale-95 transition-all cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchDelete}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa {selectedStudentIds.length > 1 ? 'hàng loạt' : ''} ({selectedStudentIds.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {paginatedStudents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Không tìm thấy võ sinh nào phù hợp.
                </div>
              ) : (
                paginatedStudents.map((student, idx) => {
                  const stt = (safePage - 1) * pageSize + idx + 1;
                  const beltCfg = getBeltConfig(student.currentBelt);
                  const studentCode = formatStudentClubCode(student, currentClub);
                  const birthYear = student.birthYear || (student.dob ? student.dob.split('-')[0] : '---');
                  const isSelected = selectedStudentIds.includes(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => onViewStudentDetail(student.id)}
                      className={`bg-white rounded-2xl p-2.5 px-3 border transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
                        isSelected
                          ? 'border-[#0072de] bg-blue-50/20 shadow-xs ring-1 ring-blue-300'
                          : 'border-slate-200/90 shadow-2xs hover:border-slate-300 active:scale-[0.99] active:bg-slate-50/80'
                      }`}
                    >
                      {/* Khối Trái: Checkbox + STT + Avatar viền đai + Tên + Mã */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Checkbox chọn */}
                        <div
                          className="shrink-0 flex items-center justify-center p-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectStudent(student.id, e as any)}
                            className="w-4 h-4 rounded text-[#0072de] border-slate-300 focus:ring-[#0072de] cursor-pointer"
                            title="Chọn để xóa"
                          />
                        </div>

                        {/* STT */}
                        <span className="w-4 text-center text-xs font-bold text-slate-400 shrink-0 font-mono">
                          {stt}
                        </span>

                        {/* Avatar 36px tròn viền màu đai và chấm trạng thái */}
                        <div className="relative shrink-0">
                          <div
                            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2"
                            style={{ borderColor: beltCfg.borderHex }}
                          >
                            {student.avatarUrl ? (
                              <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                            title={student.status === 'ACTIVE' ? 'Đang học' : 'Nghỉ tập'}
                          />
                        </div>

                        {/* Thông tin chính: 2 dòng gọn gàng, hiển thị đầy đủ thông tin thiết yếu */}
                        <div className="min-w-0 flex-1">
                          {/* Dòng 1: Họ tên */}
                          <div className="font-bold text-slate-900 text-sm truncate leading-snug">
                            {student.fullName}
                          </div>

                          {/* Dòng 2: Mã võ sinh • Giới tính • Năm sinh */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 leading-tight mt-0.5 truncate">
                            <span className="font-mono font-bold text-[#0072de]">{studentCode}</span>
                            <span className="text-slate-300">&bull;</span>
                            <span>{student.gender || 'Nam'}</span>
                            <span className="text-slate-300">&bull;</span>
                            <span>{birthYear}</span>
                          </div>
                        </div>
                      </div>

                      {/* Khối Phải: Icon Mắt xem chi tiết (thay cho nút sửa/xóa cũ để tránh bấm nhầm) */}
                      <div
                        className="shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onViewStudentDetail(student.id)}
                          className="p-2 rounded-xl text-[#0072de] bg-blue-50/80 hover:bg-blue-100 active:scale-90 transition-all cursor-pointer border border-blue-100"
                          title="Xem thông tin chi tiết võ sinh"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Phân trang danh sách sao cho hiện 10 võ sinh trên 1 trang */}
            {filteredStudents.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div>
                  Hiển thị <span className="font-bold text-slate-800">{(safePage - 1) * pageSize + 1}</span> -{' '}
                  <span className="font-bold text-slate-800">
                    {Math.min(safePage * pageSize, filteredStudents.length)}
                  </span>{' '}
                  trên tổng số <span className="font-bold text-slate-900">{filteredStudents.length}</span> võ sinh
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Nút trang trước */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Danh sách số trang */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                        page === safePage
                          ? 'bg-[#0072de] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Nút trang sau */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: ĐIỂM DANH THEO THÁNG ==================== */}
        {activeTab === 'attendance' && (
          <div className="animate-in fade-in duration-200">
            <ClubAttendanceView
              clubId={currentClub.id}
              initialSubPage={initialAttendanceSubPage}
              onSubPageChange={onAttendanceSubPageChange}
              onNavigateToStudents={() => handleTabChange('students')}
              onViewStudentDetail={onViewStudentDetail}
            />
          </div>
        )}

        {/* ==================== TAB 4: ĐĂNG KÝ THI ==================== */}
        {activeTab === 'exam-reg' && (
          <div className="animate-in fade-in duration-200">
            <QuickExamSheetCreator initialClubId={currentClub.id} lockClubSelect={true} />
          </div>
        )}

        {/* ==================== TAB 4: NỘP VIDEO THI & CHẤM ĐIỂM ==================== */}
        {activeTab === 'video-submit' && (
          <div className="animate-in fade-in duration-200">
            <ExamVideosView
              initialClubId={currentClub.id}
              onNavigateToCertificates={() => handleTabChange('certificates')}
            />
          </div>
        )}

        {/* ==================== TAB 5: QUẢN LÝ VĂN BẰNG ==================== */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Sổ Văn Bằng</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tổng cộng {clubCertificates.length} văn bằng thăng đai đã phát hành cho CLB
                </p>
              </div>

              <button
                onClick={() => {
                  setCertStudentId(undefined);
                  setIsCertModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cấp Văn Bằng Mới</span>
              </button>
            </div>

            {/* Bảng văn bằng */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Số Hiệu</th>
                    <th className="py-2.5 px-3">Họ và Tên Võ Sinh</th>
                    <th className="py-2.5 px-3">Cấp Đai Đạt</th>
                    <th className="py-2.5 px-3">Ngày Cấp</th>
                    <th className="py-2.5 px-3">Người Ký</th>
                    <th className="py-2.5 px-3 text-right">Xem &amp; In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clubCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Chưa có văn bằng nào được cấp cho CLB này.
                      </td>
                    </tr>
                  ) : (
                    clubCertificates.map(cert => {
                      const certStudent = students.find(s => s.id === cert.studentId);
                      return (
                        <tr key={cert.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-purple-700">
                            {cert.certNumber}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {certStudent ? certStudent.fullName : 'Võ sinh PQQ'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${getBeltBadgeStyle(cert.beltConferred)}`}>
                              {getBeltConfig(cert.beltConferred).name}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono">
                            {formatDateVN(cert.issueDate)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">
                            {cert.signerName}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() => setPreviewCert(cert)}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                              title="Xem và In PDF A4 Hoàng Gia"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Xóa văn bằng này khỏi hệ thống?')) {
                                  deleteCertificate(cert.id);
                                }
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Xóa văn bằng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ============================================================== */}
      {/* 3. CÁC MODAL HỆ THỐNG                                         */}
      {/* ============================================================== */}
      <CertificateFormModal
        isOpen={isCertModalOpen}
        onClose={() => {
          setIsCertModalOpen(false);
          setCertStudentId(undefined);
        }}
        defaultStudentId={certStudentId}
      />

      <CertificatePreviewModal
        isOpen={Boolean(previewCert)}
        onClose={() => setPreviewCert(null)}
        certificate={previewCert}
      />

      {/* ============================================================== */}
      {/* 4. THANH ĐIỀU HƯỚNG DƯỚI ĐÁY CHO ĐIỆN THOẠI (FLOATING BOTTOM BAR) md:hidden */}
      {/* Hơi nhô lên cao để tránh nút home gạch ngang của iPhone / Android gesture nav */}
      {/* 4 Mục: Tổng quan / Danh sách / Điểm danh / Lịch sử */}
      {/* ============================================================== */}
      <nav
        aria-label="Thanh điều hướng di động"
        className="md:hidden fixed z-40 left-3 right-3 max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.14)] rounded-3xl px-2 py-1.5 flex items-center justify-around select-none"
        style={{
          bottom: 'calc(0.9rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Tab 1: Tổng quan */}
        <button
          type="button"
          onClick={() => handleTabChange('overview')}
          className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'overview'
              ? 'text-[#0072de] bg-blue-50/90 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'overview' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            Tổng quan
          </span>
        </button>

        {/* Tab 2: Danh sách */}
        <button
          type="button"
          onClick={() => handleTabChange('students')}
          className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'students'
              ? 'text-[#0072de] bg-blue-50/90 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'students' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            Danh sách
          </span>
        </button>

        {/* Tab 3: Điểm danh */}
        <button
          type="button"
          onClick={() => {
            handleTabChange('attendance');
            onAttendanceSubPageChange?.('taking');
          }}
          className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'attendance' && attendanceSubPage === 'taking'
              ? 'text-[#0072de] bg-blue-50/90 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <CalendarCheck className={`w-5 h-5 ${activeTab === 'attendance' && attendanceSubPage === 'taking' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            Điểm danh
          </span>
        </button>

        {/* Tab 4: Lịch sử (Lịch sử điểm danh) */}
        <button
          type="button"
          onClick={() => {
            handleTabChange('attendance');
            onAttendanceSubPageChange?.('history');
          }}
          className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'attendance' && attendanceSubPage === 'history'
              ? 'text-[#0072de] bg-blue-50/90 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <History className={`w-5 h-5 ${activeTab === 'attendance' && attendanceSubPage === 'history' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            Lịch sử
          </span>
        </button>

        {/* Tab 5: Báo cáo (Báo cáo chuyên cần) */}
        <button
          type="button"
          onClick={() => {
            handleTabChange('attendance');
            onAttendanceSubPageChange?.('report');
          }}
          className={`flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'attendance' && attendanceSubPage === 'report'
              ? 'text-[#0072de] bg-blue-50/90 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <TrendingUp className={`w-5 h-5 ${activeTab === 'attendance' && attendanceSubPage === 'report' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            Báo cáo
          </span>
        </button>
      </nav>
    </div>
  );
};

export default ClubWorkspaceView;
