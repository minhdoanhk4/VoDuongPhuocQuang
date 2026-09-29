import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus, Student } from '../../types';
import { getBeltConfig, getBeltBadgeStyle } from '../../utils/beltColors';
import { formatDateVN } from '../../utils/formatters';
import {
  Check,
  X,
  User,
  Save,
  Clock,
  History,
  Settings2,
  FileText,
  Share2,
  CalendarDays,
  ArrowLeft,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit
} from 'lucide-react';

interface ClubAttendanceViewProps {
  clubId: string;
  onNavigateToStudents?: () => void;
  initialSubPage?: 'taking' | 'history';
  onSubPageChange?: (subPage: 'taking' | 'history') => void;
}

const WEEKDAY_MAP: Record<number, string> = {
  0: 'Chủ Nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7'
};

const WEEKDAY_INDEX: Record<string, number> = {
  'Chủ Nhật': 0,
  'CN': 0,
  'Thứ 2': 1,
  'Thứ Hai': 1,
  'T2': 1,
  'Thứ 3': 2,
  'Thứ Ba': 2,
  'T3': 2,
  'Thứ 4': 3,
  'Thứ Tư': 3,
  'T4': 3,
  'Thứ 5': 4,
  'Thứ Năm': 4,
  'T5': 4,
  'Thứ 6': 5,
  'Thứ Sáu': 5,
  'T6': 5,
  'Thứ 7': 6,
  'Thứ Bảy': 6,
  'T7': 6
};

const ALL_WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export interface ScheduledSession {
  date: string; // YYYY-MM-DD
  dayName: string; // Thứ 2, Thứ 4...
  sessionIndex: number;
  isToday: boolean;
  isPast: boolean;
  hasRecord: boolean;
}

export const ClubAttendanceView: React.FC<ClubAttendanceViewProps> = ({
  clubId,
  onNavigateToStudents,
  initialSubPage = 'taking',
  onSubPageChange
}) => {
  const { clubs, students, attendance, saveAttendanceBatch, updateClub, addToast, syncToGoogleSheet, settings } = useApp();

  const currentClub = clubs.find(c => c.id === clubId) || clubs[0];

  // 2 trang trong mục điểm danh: 'taking' (Điểm danh buổi tập) và 'history' (Lịch sử xem điểm danh)
  const [attendanceSubPage, setAttendanceSubPage] = useState<'taking' | 'history'>(() => {
    return initialSubPage || (localStorage.getItem('pqq_att_subpage') as 'taking' | 'history') || 'taking';
  });

  const handleSubPageChange = (subPage: 'taking' | 'history') => {
    setAttendanceSubPage(subPage);
    localStorage.setItem('pqq_att_subpage', subPage);
    if (onSubPageChange) {
      onSubPageChange(subPage);
    }
  };

  useEffect(() => {
    if (initialSubPage && initialSubPage !== attendanceSubPage) {
      setAttendanceSubPage(initialSubPage);
    }
  }, [initialSubPage]);

  // Danh sách võ sinh của CLB
  const clubStudents = useMemo(() => {
    return students.filter(s => s.clubId === clubId);
  }, [students, clubId]);

  // Lịch tập của CLB (Mặc định: Thứ 2, Thứ 4, Thứ 6 nếu chưa set)
  const trainingSchedule = useMemo(() => {
    if (currentClub.trainingSchedule && currentClub.trainingSchedule.length > 0) {
      return currentClub.trainingSchedule;
    }
    return ['Thứ 2', 'Thứ 4', 'Thứ 6'];
  }, [currentClub.trainingSchedule]);

  const trainingTime = currentClub.trainingTime || '17:30 - 19:30';

  // Thời gian thực tế hiện tại
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0 - 11
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

  // Lựa chọn tháng cho trang Lịch Sử Điểm Danh
  const [historySelectedMonth, setHistorySelectedMonth] = useState<string>(currentMonthStr);

  // Tự động tính toán các buổi tập trong tháng theo lịch đã set của CLB (Dành cho tháng đang chọn ở trang lịch sử)
  const historySessionsOfMonth: ScheduledSession[] = useMemo(() => {
    const [yStr, mStr] = historySelectedMonth.split('-');
    const y = parseInt(yStr, 10) || currentYear;
    const m = (parseInt(mStr, 10) || (currentMonthIndex + 1)) - 1;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const allowedDayIndices = new Set(
      trainingSchedule.map(s => WEEKDAY_INDEX[s]).filter(i => i !== undefined)
    );

    const list: ScheduledSession[] = [];
    let count = 1;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(y, m, day);
      const dayOfWeek = d.getDay();

      if (allowedDayIndices.has(dayOfWeek)) {
        const mm = String(m + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateStr = `${y}-${mm}-${dd}`;
        const dayName = WEEKDAY_MAP[dayOfWeek];
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;
        const hasRecord = attendance.some(a => a.clubId === currentClub.id && a.date === dateStr);

        list.push({
          date: dateStr,
          dayName,
          sessionIndex: count++,
          isToday,
          isPast,
          hasRecord
        });
      }
    }

    return list;
  }, [historySelectedMonth, currentYear, currentMonthIndex, trainingSchedule, todayStr, attendance, currentClub.id]);

  // Danh sách các buổi tập trong tháng hiện tại (phục vụ lấy ngày mặc định khi điểm danh)
  const currentMonthSessions: ScheduledSession[] = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const allowedDayIndices = new Set(
      trainingSchedule.map(s => WEEKDAY_INDEX[s]).filter(i => i !== undefined)
    );

    const list: ScheduledSession[] = [];
    let count = 1;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonthIndex, day);
      const dayOfWeek = d.getDay();

      if (allowedDayIndices.has(dayOfWeek)) {
        const mm = String(currentMonthIndex + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateStr = `${currentYear}-${mm}-${dd}`;
        const dayName = WEEKDAY_MAP[dayOfWeek];
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;
        const hasRecord = attendance.some(a => a.clubId === currentClub.id && a.date === dateStr);

        list.push({
          date: dateStr,
          dayName,
          sessionIndex: count++,
          isToday,
          isPast,
          hasRecord
        });
      }
    }

    return list;
  }, [currentYear, currentMonthIndex, trainingSchedule, todayStr, attendance, currentClub.id]);

  // Tự động nhận diện ngày tập: ưu tiên hôm nay nếu là ngày tập
  const defaultSessionDate = useMemo(() => {
    const todaySession = currentMonthSessions.find(s => s.isToday);
    if (todaySession) return todaySession.date;

    const pastSessions = currentMonthSessions.filter(s => s.isPast);
    if (pastSessions.length > 0) {
      return pastSessions[pastSessions.length - 1].date;
    }

    return currentMonthSessions[0]?.date || todayStr;
  }, [currentMonthSessions, todayStr]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultSessionDate);

  useEffect(() => {
    if (defaultSessionDate) {
      setSelectedDate(defaultSessionDate);
    }
  }, [defaultSessionDate]);

  // Thông tin buổi tập đang chọn
  const activeSessionInfo = useMemo(() => {
    const session = currentMonthSessions.find(s => s.date === selectedDate);
    const d = new Date(selectedDate);
    const dayName = WEEKDAY_MAP[d.getDay()] || 'Buổi tập';
    return {
      date: selectedDate,
      dayName,
      sessionIndex: session ? session.sessionIndex : 1,
      totalSessions: currentMonthSessions.length,
      isToday: selectedDate === todayStr
    };
  }, [currentMonthSessions, selectedDate, todayStr]);

  // Trạng thái nháp điểm danh cho từng võ sinh (PRESENT / ABSENT)
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus>>({});
  // Ghi chú cho từng võ sinh (Lý do vắng mặt / note)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  // Quản lý việc mở ô nhập ghi chú trên mobile cho từng võ sinh
  const [openNoteStudentId, setOpenNoteStudentId] = useState<string | null>(null);

  // Trạng thái hiển thị Pop-up Báo cáo điểm danh buổi tập hiện tại (Hình 4)
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal Chi tiết một buổi tập trong trang Lịch Sử (khi nhấn icon Mắt)
  const [selectedHistorySession, setSelectedHistorySession] = useState<ScheduledSession | null>(null);

  // Modal Báo Cáo Điểm Danh (Theo tháng, theo năm, có vòng tròn tỷ lệ %)
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportTimeframe, setReportTimeframe] = useState<'month' | 'year'>('month');
  const [reportMonth, setReportMonth] = useState<string>(currentMonthStr);
  const [reportYear, setReportYear] = useState<number>(currentYear);

  // Modal chỉnh sửa cấu hình lịch tập của CLB
  const [isScheduleSettingsOpen, setIsScheduleSettingsOpen] = useState<boolean>(false);
  const [tempSchedule, setTempSchedule] = useState<string[]>(trainingSchedule);

  // Đồng bộ draft và notes khi thay đổi ngày tập hoặc danh sách võ sinh
  useEffect(() => {
    const initialStatus: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};

    clubStudents.forEach(s => {
      const existing = attendance.find(
        a => a.studentId === s.id && a.date === selectedDate
      );
      if (existing) {
        initialStatus[s.id] = existing.status;
        initialNotes[s.id] = (existing.notes === 'Có mặt' || existing.notes === 'Vắng') ? '' : (existing.notes || '');
      } else {
        // Mặc định: Còn học -> Có mặt, Tạm nghỉ/Nghỉ -> Vắng
        initialStatus[s.id] = s.status === 'ACTIVE' ? 'PRESENT' : 'ABSENT';
        initialNotes[s.id] = '';
      }
    });

    setAttendanceDraft(initialStatus);
    setNotesDraft(initialNotes);
  }, [selectedDate, clubStudents, attendance]);

  // Thay đổi trạng thái Có/Vắng cho một võ sinh (Từng võ sinh độc lập)
  const toggleStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceDraft(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Cập nhật ghi chú cho võ sinh
  const handleNoteChange = (studentId: string, note: string) => {
    setNotesDraft(prev => ({
      ...prev,
      [studentId]: note
    }));
  };

  // Tính toán số lượng Hiện có và Vắng
  const { presentCount, absentCount, totalCount } = useMemo(() => {
    let present = 0;
    let absent = 0;
    clubStudents.forEach(s => {
      const st = attendanceDraft[s.id] || 'PRESENT';
      if (st === 'PRESENT') {
        present++;
      } else {
        absent++;
      }
    });
    return {
      presentCount: present,
      absentCount: absent,
      totalCount: clubStudents.length
    };
  }, [clubStudents, attendanceDraft]);

  // Danh sách các võ sinh vắng trong buổi đang chọn
  const absentStudents = useMemo(() => {
    return clubStudents.filter(s => (attendanceDraft[s.id] || 'PRESENT') === 'ABSENT');
  }, [clubStudents, attendanceDraft]);

  // Mở popup xác nhận / Báo cáo điểm danh (Hình 4)
  const handleOpenConfirm = () => {
    if (clubStudents.length === 0) {
      addToast('Câu lạc bộ chưa có võ sinh nào để điểm danh!', 'warning', 'Chưa có võ sinh');
      return;
    }
    setIsConfirmOpen(true);
  };

  // Xác nhận lưu điểm danh vào cơ sở dữ liệu
  const handleConfirmSave = async () => {
    setIsSaving(true);

    const nowIso = new Date().toISOString();
    const recordsToSave: AttendanceRecord[] = clubStudents.map(student => {
      const status = attendanceDraft[student.id] || 'PRESENT';
      const userNote = notesDraft[student.id]?.trim() || '';
      return {
        id: `att_${student.id}_${selectedDate}`,
        clubId: currentClub.id,
        studentId: student.id,
        date: selectedDate,
        session: `${activeSessionInfo.dayName} (${trainingTime})`,
        status,
        notes: userNote || (status === 'PRESENT' ? 'Có mặt' : 'Vắng'),
        createdAt: nowIso,
        updatedAt: nowIso
      };
    });

    saveAttendanceBatch(recordsToSave);

    if (settings.isAutoSync && settings.googleSheetScriptUrl) {
      syncToGoogleSheet().catch(() => {});
    }

    setIsSaving(false);
    setIsConfirmOpen(false);

    // Hiển thị thông báo đẩy (Toast)
    addToast(
      `Điểm danh thành công! Đã ghi nhận Hiện diện: ${presentCount} võ sinh, Vắng: ${absentCount} võ sinh.`,
      'success',
      'Điểm Danh Hoàn Tất'
    );
  };

  // Chia sẻ điểm danh (Copy nội dung báo cáo điểm danh để gửi Zalo / Tin nhắn)
  const handleShareAttendance = async () => {
    const absentListStr =
      absentStudents.length > 0
        ? absentStudents
            .map(s => {
              const note = notesDraft[s.id]?.trim();
              return `- ${s.fullName}${note ? ` (Lý do: ${note})` : ' (Chưa có ghi chú)'}`;
            })
            .join('\n')
        : '- Tất cả võ sinh đều hiện diện đầy đủ';

    const shareText = `🥋 BÁO CÁO ĐIỂM DANH - ${currentClub.name}
📅 Buổi tập: ${activeSessionInfo.dayName}, Ngày ${formatDateVN(selectedDate)}
⏰ Khung giờ: ${trainingTime}
📊 Sĩ Số: ${totalCount} | Hiện Diện: ${presentCount} | Vắng: ${absentCount}

Danh sách võ sinh vắng:
${absentListStr}

@Vo Duong Tri Vu Phuoc Quang 2026`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        addToast('Đã sao chép nội dung báo cáo điểm danh để gửi Zalo/tin nhắn!', 'success', 'Chia Sẻ Điểm Danh');
      } else {
        addToast('Trình duyệt không hỗ trợ sao chép tự động', 'warning');
      }
    } catch {
      addToast('Không thể sao chép nội dung điểm danh', 'error');
    }
  };

  // Lưu cấu hình lịch tập mới cho CLB
  const handleSaveScheduleConfig = () => {
    if (tempSchedule.length === 0) {
      addToast('Vui lòng chọn ít nhất 1 ngày tập trong tuần cho CLB!', 'warning', 'Chưa chọn ngày tập');
      return;
    }
    updateClub({
      ...currentClub,
      trainingSchedule: tempSchedule,
      updatedAt: new Date().toISOString()
    });
    setIsScheduleSettingsOpen(false);
    addToast(`Đã cập nhật lịch tập của CLB: ${tempSchedule.join(', ')}`, 'success');
  };

  const toggleScheduleDay = (day: string) => {
    if (tempSchedule.includes(day)) {
      setTempSchedule(tempSchedule.filter(d => d !== day));
    } else {
      setTempSchedule([...tempSchedule, day]);
    }
  };

  // ==============================================================
  // DỮ LIỆU TÍNH TOÁN BÁO CÁO TỔNG HỢP THEO THÁNG / THEO NĂM (KÈM VÒNG TRÒN TỶ LỆ %)
  // ==============================================================
  const reportData = useMemo(() => {
    const filterPrefix = reportTimeframe === 'month' ? reportMonth : String(reportYear);
    const records = attendance.filter(
      a => a.clubId === currentClub.id && a.date.startsWith(filterPrefix)
    );

    const datesSet = new Set<string>();
    records.forEach(r => datesSet.add(r.date));
    const totalRecordedSessions = datesSet.size;

    const presentCountTotal = records.filter(r => r.status === 'PRESENT').length;
    const absentCountTotal = records.filter(r => r.status === 'ABSENT').length;
    const totalChecks = presentCountTotal + absentCountTotal;
    const overallRate = totalChecks > 0 ? Math.round((presentCountTotal / totalChecks) * 100) : 0;

    // Phân tích từng võ sinh
    const studentStats = clubStudents.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.id);
      const studentPresent = studentRecords.filter(r => r.status === 'PRESENT').length;
      const studentAbsent = studentRecords.filter(r => r.status === 'ABSENT').length;
      const total = studentPresent + studentAbsent;
      const rate = total > 0 ? Math.round((studentPresent / total) * 100) : 0;
      return {
        student,
        present: studentPresent,
        absent: studentAbsent,
        rate
      };
    });

    return {
      totalRecordedSessions,
      presentCountTotal,
      absentCountTotal,
      overallRate,
      studentStats
    };
  }, [attendance, currentClub.id, reportTimeframe, reportMonth, reportYear, clubStudents]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* TRANG 1: MÀN HÌNH ĐIỂM DANH BUỔI TẬP (attendanceSubPage === 'taking') */}
      {/* ============================================================== */}
      {attendanceSubPage === 'taking' && (
        <div className="w-full min-w-0 flex flex-col lg:flex-row gap-3.5 sm:gap-4 items-start">
          {/* KHỐI TRÁI: THẺ ĐIỂM DANH CHÍNH (flex-1 min-w-0 tự động co dãn theo sidebar) */}
          <div className="flex-1 min-w-0 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5 transition-all duration-300">
            {/* 1A. HEADER DÀNH CHO MOBILE (md:hidden) - GỌN GÀNG, KHÔNG DƯ THỪA CHỖ TRỐNG, TIẾT KIỆM CHIỀU CAO */}
            <div className="md:hidden space-y-2.5 pb-2.5 border-b border-slate-100">
              {/* Hàng 1: Tiêu đề + Thứ, Ngày, Giờ (Trái) & Sĩ số SS, HD, V (Phải) trên CÙNG 1 HÀNG */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 leading-tight truncate">
                    Điểm Danh Buổi Tập
                  </h3>
                  <div className="text-[11.5px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>{activeSessionInfo.dayName}, {formatDateVN(selectedDate)}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      {trainingTime}
                    </span>
                  </div>
                </div>

                {/* Sĩ số mini nằm ngay góc phải trên cùng */}
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/90 text-xs font-bold shrink-0 shadow-2xs">
                  <div title="Sĩ số">
                    <span className="text-slate-400 text-[10px] font-bold mr-0.5">SS:</span>
                    <span className="text-[#0072de] font-mono font-black">{totalCount}</span>
                  </div>
                  <div title="Hiện diện">
                    <span className="text-slate-400 text-[10px] font-bold mr-0.5">HD:</span>
                    <span className="text-emerald-600 font-mono font-black">{presentCount}</span>
                  </div>
                  <div title="Vắng">
                    <span className="text-slate-400 text-[10px] font-bold mr-0.5">V:</span>
                    <span className="text-rose-600 font-mono font-black">{absentCount}</span>
                  </div>
                </div>
              </div>

              {/* Hàng 2: 3 Nút tiện ích tinh tế, vừa vặn ngón tay */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#0072de]" />
                  <span className="truncate">Báo Cáo</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareAttendance}
                  className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#0072de]" />
                  <span className="truncate">Chia Sẻ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTempSchedule(trainingSchedule);
                    setIsScheduleSettingsOpen(true);
                  }}
                  className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">Lịch Tập</span>
                </button>
              </div>
            </div>

            {/* 1B. HEADER DÀNH CHO DESKTOP (hidden md:flex) - GIỮ NGUYÊN 100% BỐ CỤC 3 CỘT */}
            <div className="hidden md:flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              {/* Cột trái: Tiêu đề buổi tập & Ngày tập */}
              <div className="text-left">
                <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Điểm Danh Buổi Tập
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                  {activeSessionInfo.dayName}, {formatDateVN(selectedDate)}
                </div>
              </div>

              {/* Cột giữa: THÁNG X & Khung giờ */}
              <div className="text-center">
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-wide uppercase">
                  Tháng {currentMonthIndex + 1}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time: {trainingTime}</span>
                </div>
              </div>

              {/* Cột phải: SS, HD, V */}
              <div className="flex items-center gap-3.5 text-xs sm:text-sm font-bold bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1">
                  <span className="text-slate-600 font-semibold">SS:</span>
                  <span className="text-[#0072de] font-mono text-sm sm:text-base font-extrabold">{totalCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-600 font-semibold">HD:</span>
                  <span className="text-emerald-600 font-mono text-sm sm:text-base font-extrabold">{presentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-600 font-semibold">V:</span>
                  <span className="text-rose-600 font-mono text-sm sm:text-base font-extrabold">{absentCount}</span>
                </div>
              </div>
            </div>

            {/* Dành cho tablet (hidden md:flex lg:hidden) để có các nút tiện ích */}
            <div className="hidden md:flex lg:hidden items-center justify-end gap-2 pt-1 pb-1">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#0072de]" />
                <span>Báo Cáo</span>
              </button>
              <button
                type="button"
                onClick={handleShareAttendance}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#0072de]" />
                <span>Chia Sẻ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempSchedule(trainingSchedule);
                  setIsScheduleSettingsOpen(true);
                }}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Lịch Tập</span>
              </button>
            </div>

            {/* 2. BẢNG DANH SÁCH VÕ SINH ĐIỂM DANH (THEO HÌNH 3: 7 CỘT - DESKTOP / TABLET: hidden md:block)
                STT, Ảnh, Họ và Tên, Năm sinh, Cấp đai, Có/Vắng, Ghi Chú
                (KHÔNG CÒN DÃY Ô NGÀY TRÊN BẢNG, KHÔNG CHECK TẤT CẢ) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0e4b75] text-white font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-1 text-center w-10 min-w-[36px]">STT</th>
                    <th className="py-2 px-1 text-center w-10 min-w-[36px]">Ảnh</th>
                    <th className="py-2 px-2.5 min-w-[130px]">Họ và Tên</th>
                    <th className="py-2 px-1.5 text-center min-w-[65px]">Năm sinh</th>
                    <th className="py-2 px-2 min-w-[105px]">Cấp đai</th>
                    <th className="py-2 px-2 text-center min-w-[110px]">Có/Vắng</th>
                    <th className="py-2 px-2.5 min-w-[130px]">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clubStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Chưa có võ sinh nào trong câu lạc bộ.
                      </td>
                    </tr>
                  ) : (
                    clubStudents.map((student, idx) => {
                      const isPresent = (attendanceDraft[student.id] || 'PRESENT') === 'PRESENT';
                      const beltCfg = getBeltConfig(student.currentBelt);
                      const birthYear = student.birthYear || (student.dob ? student.dob.split('-')[0] : '---');

                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors hover:bg-slate-50/80 ${
                            !isPresent ? 'bg-rose-50/25' : ''
                          }`}
                        >
                          {/* 1. STT */}
                          <td className="py-1.5 px-1 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>

                          {/* 2. Ảnh */}
                          <td className="py-1.5 px-1 text-center">
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

                          {/* 3. Họ và Tên (Không có dòng pháp danh) */}
                          <td className="py-1.5 px-2.5 font-bold text-slate-900">
                            <span className="truncate block max-w-[170px]" title={student.fullName}>
                              {student.fullName}
                            </span>
                          </td>

                          {/* 4. Năm sinh */}
                          <td className="py-1.5 px-1.5 text-center font-semibold text-slate-700">
                            {birthYear}
                          </td>

                          {/* 5. Cấp đai */}
                          <td className="py-1.5 px-2 whitespace-nowrap">
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

                          {/* 6. Ô check [Có / Vắng] (Từng võ sinh độc lập) */}
                          <td className="py-1.5 px-2 text-center">
                            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => toggleStudentStatus(student.id, 'PRESENT')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 active:scale-95 ${
                                  isPresent
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Có</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleStudentStatus(student.id, 'ABSENT')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 active:scale-95 ${
                                  !isPresent
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Vắng</span>
                              </button>
                            </div>
                          </td>

                          {/* 7. Ghi Chú (Nhập lý do vắng / ghi chú theo Hình 3 & 4) */}
                          <td className="py-1.5 px-2.5">
                            <input
                              type="text"
                              placeholder="Nhập lý do / ghi chú..."
                              value={notesDraft[student.id] || ''}
                              onChange={e => handleNoteChange(student.id, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0072de] focus:outline-none transition-all"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 3. DANH SÁCH THẺ ĐIỂM DANH CHO ĐIỆN THOẠI (md:hidden) */}
            <div className="md:hidden space-y-2">
              {clubStudents.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Chưa có võ sinh nào trong câu lạc bộ.
                </div>
              ) : (
                clubStudents.map((student, idx) => {
                  const isPresent = (attendanceDraft[student.id] || 'PRESENT') === 'PRESENT';
                  const beltCfg = getBeltConfig(student.currentBelt);
                  const birthYear = student.birthYear || (student.dob ? student.dob.split('-')[0] : '---');
                  const currentNote = notesDraft[student.id] || '';
                  const hasCustomNote = currentNote && currentNote !== 'Có mặt' && currentNote !== 'Vắng';
                  const isNoteOpen = openNoteStudentId === student.id || !isPresent || Boolean(hasCustomNote);

                  return (
                    <div
                      key={student.id}
                      className={`p-2.5 rounded-2xl border transition-all ${
                        isPresent
                          ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                          : 'bg-rose-50/40 border-rose-200 shadow-2xs'
                      }`}
                    >
                      {/* Hàng 1: STT, Avatar viền đai, Họ tên, Đai + Năm sinh, Nút Có/Vắng */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs font-mono font-bold text-slate-400 w-4 text-center shrink-0">
                            {idx + 1}
                          </span>

                          {/* Avatar 34px viền màu đai */}
                          <div
                            className="w-8.5 h-8.5 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 shrink-0"
                            style={{ borderColor: beltCfg.borderHex }}
                          >
                            {student.avatarUrl ? (
                              <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm truncate leading-snug">
                              {student.fullName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-bold ${getBeltBadgeStyle(student.currentBelt)}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: beltCfg.bgHex }} />
                                <span>{beltCfg.name} {student.currentBeltLevel ? `C.${student.currentBeltLevel}` : ''}</span>
                              </span>
                              <span className="text-[10px] text-slate-400">&bull; {birthYear}</span>
                              {hasCustomNote && isPresent && !openNoteStudentId && (
                                <span className="text-[9.5px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 truncate max-w-[85px]">
                                  {currentNote}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Nút Có / Vắng chuẩn ngón tay + nút mở note khi có mặt */}
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                toggleStudentStatus(student.id, 'PRESENT');
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                                isPresent
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Có</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                toggleStudentStatus(student.id, 'ABSENT');
                                if (!notesDraft[student.id]) {
                                  handleNoteChange(student.id, 'Có phép');
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                                !isPresent
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Vắng</span>
                            </button>
                          </div>

                          {/* Nút chỉnh sửa ghi chú cho võ sinh có mặt */}
                          {isPresent && (
                            <button
                              type="button"
                              onClick={() => setOpenNoteStudentId(openNoteStudentId === student.id ? null : student.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                openNoteStudentId === student.id || hasCustomNote
                                  ? 'text-[#0072de] bg-blue-50'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Thêm ghi chú"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Hàng 2 (Mở rộng thông minh): Khi Vắng hoặc khi được mở ghi chú */}
                      {isNoteOpen && (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5 animate-in fade-in duration-150">
                          {!isPresent && (
                            <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                              <span className="text-slate-400 font-semibold">Lý do nhanh:</span>
                              {['Có phép', 'Bị ốm', 'Bận việc', 'Không phép'].map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleNoteChange(student.id, tag)}
                                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                                    currentNote === tag
                                      ? 'bg-rose-600 text-white shadow-2xs'
                                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder={isPresent ? "Ghi chú thêm (vd: đến trễ 15p)..." : "Nhập chi tiết lý do vắng..."}
                              value={currentNote === 'Có mặt' || currentNote === 'Vắng' ? '' : currentNote}
                              onChange={e => handleNoteChange(student.id, e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0072de] focus:outline-none transition-all"
                            />
                            {isPresent && openNoteStudentId === student.id && (
                              <button
                                type="button"
                                onClick={() => setOpenNoteStudentId(null)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                              >
                                Ẩn
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Thanh Lưu Điểm Danh Nổi Trên Điện Thoại (Nổi phía trên thanh menu điều hướng đáy) */}
            <div
              className="md:hidden fixed left-3 right-3 max-w-md mx-auto z-30 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-between border border-slate-700/60"
              style={{
                bottom: 'calc(4.8rem + env(safe-area-inset-bottom, 0px))'
              }}
            >
              <div className="text-xs">
                <span className="text-slate-400 font-medium">Hiện diện: </span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{presentCount}</span>
                <span className="text-slate-600 mx-1.5">&bull;</span>
                <span className="text-slate-400 font-medium">Vắng: </span>
                <span className="font-bold text-rose-400 font-mono text-sm">{absentCount}</span>
              </div>

              <button
                type="button"
                onClick={handleOpenConfirm}
                className="px-5 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] active:scale-95 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Lưu ({presentCount}/{totalCount})</span>
              </button>
            </div>

            {/* 4. NÚT SAVE DƯỚI CÙNG (DÀNH CHO MÀN HÌNH MÁY TÍNH / TABLET: hidden md:flex) */}
            <div className="hidden md:flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 font-medium">
                Buổi tập: <span className="font-bold text-slate-800">{activeSessionInfo.dayName}, {formatDateVN(selectedDate)}</span> &bull; Đang chọn: <span className="font-bold text-emerald-700">{presentCount} Có mặt</span>, <span className="font-bold text-rose-700">{absentCount} Vắng</span>
              </div>

              <button
                type="button"
                onClick={handleOpenConfirm}
                className="px-8 py-2 rounded-full bg-[#0072de] hover:bg-[#0060bd] active:scale-95 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* KHỐI PHẢI: THANH 4 NÚT HÀNH ĐỘNG (CHỈ HIỂN THỊ TRÊN MÀN HÌNH MÁY TÍNH: hidden lg:flex) */}
          <div className="hidden lg:flex w-full lg:w-44 xl:w-48 shrink-0 flex-col gap-2">
            {/* Nút 1: Lịch Sử Điểm Danh (Chuyển sang Trang 2 Lịch Sử) */}
            <button
              type="button"
              onClick={() => handleSubPageChange('history')}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#0e4b75] hover:bg-[#093554] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <History className="w-4 h-4 shrink-0" />
              <span className="truncate">Lịch Sử Điểm Danh</span>
            </button>

            {/* Nút 2: Báo Cáo Điểm Danh (Mở modal Báo cáo theo tháng / theo năm có vòng tròn %) */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#0e4b75] hover:bg-[#093554] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">Báo Cáo Điểm Danh</span>
            </button>

            {/* Nút 3: Chia sẻ điểm danh */}
            <button
              type="button"
              onClick={handleShareAttendance}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#0e4b75] hover:bg-[#093554] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Chia sẻ điểm danh</span>
            </button>

            {/* Nút Cài đặt Lịch tập CLB */}
            <button
              type="button"
              onClick={() => {
                setTempSchedule(trainingSchedule);
                setIsScheduleSettingsOpen(true);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-600 font-semibold text-xs shadow-2xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 mt-0.5"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Cài Đặt Lịch Tập</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TRANG 2: MÀN HÌNH LỊCH SỬ XEM ĐIỂM DANH (attendanceSubPage === 'history') */}
      {/* CÓ NÚT BACK, DẠNG Ô BUỔI 1, BUỔI 2, THỨ NGÀY THÁNG, TỶ LỆ 30/80, NÚT MẮT XEM CHI TIẾT */}
      {/* ============================================================== */}
      {attendanceSubPage === 'history' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-200">
          {/* Thanh tiêu đề có Nút Back & Bộ chọn tháng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Nút Back quay lại trang điểm danh (chỉ icon) */}
              <button
                type="button"
                onClick={() => handleSubPageChange('taking')}
                className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xs hover:shadow-xs"
                title="Quay lại điểm danh buổi tập"
              >
                <ArrowLeft className="w-5 h-5 text-[#0072de]" />
              </button>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#0072de]" />
                  <span>Lịch Sử Điểm Danh</span>
                </h3>
              </div>
            </div>

            {/* Ô chọn tháng xem lịch sử */}
            <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <CalendarDays className="w-4 h-4 text-[#0072de]" />
              <span className="font-bold text-slate-700">Chọn tháng:</span>
              <input
                type="month"
                value={historySelectedMonth}
                onChange={e => setHistorySelectedMonth(e.target.value)}
                className="bg-white border border-slate-200 font-bold text-slate-900 text-xs px-2.5 py-1 rounded-xl shadow-2xs outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Lưới các ô Buổi 1, Buổi 2... có thứ ngày tháng (không có năm), tỷ lệ 30/80, nút mắt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {historySessionsOfMonth.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Tháng {historySelectedMonth} chưa có buổi tập nào theo lịch cố định ({trainingSchedule.join(', ')}).
              </div>
            ) : (
              historySessionsOfMonth.map(session => {
                const dateRecords = attendance.filter(
                  a => a.clubId === currentClub.id && a.date === session.date
                );
                const hasRecorded = dateRecords.length > 0;
                const datePresent = hasRecorded ? dateRecords.filter(r => r.status === 'PRESENT').length : 0;
                const totalStudents = clubStudents.length;

                // Tách ngày và tháng, KHÔNG HIỂN THỊ NĂM theo yêu cầu người dùng
                const dateParts = session.date.split('-');
                const dayMonthStr = `${dateParts[2]}/${dateParts[1]}`;

                return (
                  <div
                    key={session.date}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      session.isToday
                        ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                        : hasRecorded
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200/80 text-slate-400'
                    }`}
                  >
                    {/* Dòng trên: Buổi X & Tag hôm nay / đã ghi */}
                    <div className="flex items-center justify-between">
                      <div className="font-black text-slate-900 text-sm">
                        Buổi {session.sessionIndex}
                      </div>

                      {session.isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          Hôm Nay ⭐
                        </span>
                      )}

                      {hasRecorded && !session.isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã lưu</span>
                        </span>
                      )}

                      {!hasRecorded && !session.isToday && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          Chưa ghi
                        </span>
                      )}
                    </div>

                    {/* Thứ ngày tháng (KHÔNG CÓ NĂM) */}
                    <div>
                      <div className="text-xs font-bold text-slate-700">
                        {session.dayName}, {dayMonthStr}
                      </div>
                    </div>

                    {/* Chú thích Tỷ lệ đi học là 30/80 */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-500 font-medium">Tỷ lệ đi học: </span>
                        <span className={`font-mono font-bold ${hasRecorded ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {hasRecorded ? `${datePresent}/${totalStudents}` : `---/${totalStudents}`}
                        </span>
                      </div>

                      {/* Nút xem icon mắt để mở pop-up xem chi tiết số lượng và tên võ sinh vắng */}
                      <button
                        type="button"
                        onClick={() => setSelectedHistorySession(session)}
                        className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0072de] transition-colors cursor-pointer active:scale-90"
                        title="Xem chi tiết số lượng và danh sách võ sinh vắng"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: BÁO CÁO ĐIỂM DANH THEO HÌNH 4 (BUỔI TẬP ĐANG CHỌN)     */}
      {/* ============================================================== */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header: BÁO CÁO ĐIỂM DANH */}
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wide text-center uppercase">
              BÁO CÁO ĐIỂM DANH
            </h3>

            {/* Tóm tắt số lượng: Sĩ Số, Hiện Diện, Vắng (Hình 4) */}
            <div className="flex items-center justify-center gap-6 py-2 border-b border-slate-100 text-xs sm:text-sm font-bold">
              <div>
                Sĩ Số: <span className="text-[#0072de] font-mono font-extrabold">{totalCount}</span>
              </div>
              <div>
                Hiện Diện: <span className="text-emerald-600 font-mono font-extrabold">{presentCount}</span>
              </div>
              <div>
                Vắng: <span className="text-rose-600 font-mono font-extrabold">{absentCount}</span>
              </div>
            </div>

            {/* Danh sách võ sinh vắng (kèm lý do(note)) (Hình 4) */}
            <div className="space-y-1.5 text-left">
              <div className="text-xs font-bold text-slate-800">
                Danh sách võ sinh vắng (kèm lý do(note)):
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1.5 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                {absentStudents.length === 0 ? (
                  <div className="text-emerald-600 font-semibold text-center py-3">
                    - Tất cả võ sinh đều hiện diện đầy đủ (Không có võ sinh vắng)
                  </div>
                ) : (
                  absentStudents.map(student => (
                    <div key={student.id} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-slate-400 font-bold">-</span>
                      <span className="font-bold text-slate-900">{student.fullName}</span>
                      {notesDraft[student.id]?.trim() ? (
                        <span className="text-rose-600 font-medium">
                          ({notesDraft[student.id].trim()})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          (Chưa có ghi chú lý do)
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2 nút thao tác: Hủy và Save (Hình 4) */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSaving}
                className="px-6 py-2 rounded-full border border-rose-300 text-rose-600 font-bold text-xs hover:bg-rose-50 cursor-pointer transition-colors"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="px-8 py-2 rounded-full bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Đang lưu...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: POP-UP CHI TIẾT SỐ LƯỢNG & TÊN VÕ SINH VẮNG (NÚT MẮT)   */}
      {/* ============================================================== */}
      {selectedHistorySession && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header popup chi tiết buổi tập */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Chi Tiết Buổi {selectedHistorySession.sessionIndex} &bull; {selectedHistorySession.dayName} ({selectedHistorySession.date.split('-')[2]}/{selectedHistorySession.date.split('-')[1]})
                </h4>
                <p className="text-xs text-slate-500">
                  {currentClub.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistorySession(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dữ liệu thống kê của buổi tập này */}
            {(() => {
              const sessionRecords = attendance.filter(
                a => a.clubId === currentClub.id && a.date === selectedHistorySession.date
              );
              const hasRec = sessionRecords.length > 0;
              const presCount = sessionRecords.filter(r => r.status === 'PRESENT').length;
              const absCount = sessionRecords.filter(r => r.status === 'ABSENT').length;
              const absRecords = sessionRecords.filter(r => r.status === 'ABSENT');

              return (
                <div className="space-y-4">
                  {/* Thống kê Sĩ số, Có, Vắng */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center text-xs">
                    <div>
                      <div className="text-slate-500 text-[11px]">Sĩ số</div>
                      <div className="text-base font-bold text-slate-900">{clubStudents.length}</div>
                    </div>
                    <div>
                      <div className="text-emerald-600 font-bold text-[11px]">Hiện diện</div>
                      <div className="text-base font-bold text-emerald-700">{hasRec ? presCount : 0}</div>
                    </div>
                    <div>
                      <div className="text-rose-600 font-bold text-[11px]">Vắng mặt</div>
                      <div className="text-base font-bold text-rose-700">{hasRec ? absCount : 0}</div>
                    </div>
                  </div>

                  {/* Danh sách tên võ sinh vắng mặt kèm lý do */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-800">
                      Danh sách võ sinh vắng mặt:
                    </div>

                    {!hasRec ? (
                      <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Buổi tập này chưa lưu bản ghi điểm danh nào.
                      </div>
                    ) : absRecords.length === 0 ? (
                      <div className="py-4 text-center text-emerald-600 text-xs font-semibold bg-emerald-50/50 rounded-xl border border-emerald-200">
                        ✅ Tất cả võ sinh đều hiện diện đầy đủ!
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {absRecords.map(rec => {
                          const studentInfo = clubStudents.find(s => s.id === rec.studentId);
                          return (
                            <div
                              key={rec.id}
                              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 flex items-start justify-between gap-2 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900">
                                  {studentInfo?.fullName || 'Võ sinh'}
                                </span>
                                {rec.notes && rec.notes !== 'Vắng mặt' && rec.notes !== 'Vắng' && (
                                  <div className="text-[11px] text-rose-600 mt-0.5">
                                    Lý do: {rec.notes}
                                  </div>
                                )}
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                Vắng
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Nút hành động trong pop-up chi tiết */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(selectedHistorySession.date);
                        setSelectedHistorySession(null);
                        handleSubPageChange('taking');
                        addToast(`Chuyển sang điểm danh buổi: ${selectedHistorySession.dayName} (${selectedHistorySession.date.split('-')[2]}/${selectedHistorySession.date.split('-')[1]})`, 'info');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      Điểm danh / Sửa buổi này
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHistorySession(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: BÁO CÁO ĐIỂM DANH THEO THÁNG / THEO NĂM CÓ VÒNG TRÒN % */}
      {/* ============================================================== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header modal báo cáo */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0072de] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Báo Cáo Chuyên Cần
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Thống kê tỷ lệ phần trăm theo tháng hoặc theo năm
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thanh chuyển chế độ: Theo Tháng | Theo Năm */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setReportTimeframe('month')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    reportTimeframe === 'month'
                      ? 'bg-white text-[#0072de] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Theo Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setReportTimeframe('year')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    reportTimeframe === 'year'
                      ? 'bg-white text-[#0072de] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Theo Năm
                </button>
              </div>

              {/* Bộ chọn tương ứng theo tháng / theo năm */}
              <div>
                {reportTimeframe === 'month' ? (
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={e => setReportMonth(e.target.value)}
                    className="bg-white border border-slate-200 font-bold text-slate-900 px-3 py-1.5 rounded-xl shadow-2xs outline-none cursor-pointer text-xs"
                  />
                ) : (
                  <select
                    value={reportYear}
                    onChange={e => setReportYear(parseInt(e.target.value, 10))}
                    className="bg-white border border-slate-200 font-bold text-slate-900 px-3 py-1.5 rounded-xl shadow-2xs outline-none cursor-pointer text-xs"
                  >
                    <option value={2027}>Năm 2027</option>
                    <option value={2026}>Năm 2026</option>
                    <option value={2025}>Năm 2025</option>
                    <option value={2024}>Năm 2024</option>
                  </select>
                )}
              </div>
            </div>

            {/* KHỐI VÒNG TRÒN TỶ LỆ % CHUYÊN CẦN (CIRCULAR PROGRESS RING) */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-around gap-4">
              {/* Vòng tròn SVG */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                {(() => {
                  const radius = 40;
                  const circumference = 2 * Math.PI * radius;
                  const ratePercent = Math.min(100, Math.max(0, reportData.overallRate));
                  const strokeOffset = circumference - (ratePercent / 100) * circumference;
                  const strokeColor = ratePercent >= 80 ? '#10b981' : ratePercent >= 60 ? '#0072de' : '#f43f5e';

                  return (
                    <>
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Vòng nền mờ */}
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          className="stroke-slate-200"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Vòng tỷ lệ phần trăm */}
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          className="transition-all duration-700 ease-out"
                          stroke={strokeColor}
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      {/* Số % hiển thị ở tâm vòng tròn */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-slate-900 leading-none">
                          {ratePercent}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                          Chuyên cần
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Các chỉ số thống kê bên cạnh vòng tròn */}
              <div className="space-y-2 text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Số buổi đã điểm danh:</span>
                  <span className="font-bold text-slate-900 font-mono">{reportData.totalRecordedSessions} buổi</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Tổng lượt có mặt:</span>
                  <span className="font-bold text-emerald-700 font-mono">{reportData.presentCountTotal} lượt</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Tổng lượt vắng:</span>
                  <span className="font-bold text-rose-700 font-mono">{reportData.absentCountTotal} lượt</span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-600 font-semibold">Sĩ số trung bình:</span>
                  <span className="font-black text-[#0072de] font-mono">{clubStudents.length} võ sinh</span>
                </div>
              </div>
            </div>

            {/* Bảng tóm tắt tỷ lệ chuyên cần từng võ sinh */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Tỷ lệ chuyên cần từng võ sinh ({reportTimeframe === 'month' ? `Tháng ${reportMonth.split('-')[1]}` : `Năm ${reportYear}`}):</span>
                <span className="text-[11px] font-normal text-slate-500">{clubStudents.length} võ sinh</span>
              </div>

              <div className="max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 text-xs">
                {reportData.studentStats.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Chưa có dữ liệu</div>
                ) : (
                  reportData.studentStats.map(({ student, present, absent, rate }) => (
                    <div key={student.id} className="p-2.5 flex items-center justify-between gap-2">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]">
                        {student.fullName}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-500">
                          {present} Có &bull; {absent} Vắng
                        </span>
                        <span
                          className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full border ${
                            rate >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rate >= 60
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {rate}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Nút đóng */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
              >
                Đóng Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CÀI ĐẶT LỊCH TẬP CLB (T2, T3, T4, T5, T6, T7, CN)     */}
      {/* ============================================================== */}
      {isScheduleSettingsOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#0072de]" />
                <span>Cài Đặt Lịch Tập CLB</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsScheduleSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Chọn các ngày tập cố định trong tuần của {currentClub.name}. Hệ thống sẽ tự động tính toán buổi tập hàng tháng theo lịch này.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {ALL_WEEKDAYS.map(day => {
                const isSelected = tempSchedule.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleScheduleDay(day)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-[#0072de] text-white border-[#0072de] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleSettingsOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveScheduleConfig}
                className="flex-1 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                Lưu Lịch Tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubAttendanceView;
