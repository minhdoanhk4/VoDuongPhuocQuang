import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { getBeltConfig } from '../../utils/beltColors';
import { formatDateVN } from '../../utils/formatters';
import { pdfService } from '../../services/pdfService';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Download,
  Search,
  History,
  Check
} from 'lucide-react';

interface AttendanceViewProps {
  clubId: string;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ clubId }) => {
  const { clubs, students, attendance, saveAttendanceBatch, addToast } = useApp();

  const currentClub = clubs.find(c => c.id === clubId);
  const clubStudents = useMemo(() => {
    return students.filter(s => s.clubId === clubId && s.status === 'ACTIVE');
  }, [students, clubId]);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSession, setSelectedSession] = useState<string>('Chiều (17:30 - 19:30)');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'checkin' | 'history'>('checkin');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Local draft records for the current date & session
  const [draftStatus, setDraftStatus] = useState<Record<string, { status: AttendanceStatus; notes: string }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
    clubStudents.forEach(s => {
      const existing = attendance.find(
        a => a.studentId === s.id && a.date === todayStr && a.session === 'Chiều (17:30 - 19:30)'
      );
      initial[s.id] = {
        status: existing ? existing.status : 'PRESENT',
        notes: existing?.notes || ''
      };
    });
    return initial;
  });

  // Re-sync draft when date or session changes
  const handleDateOrSessionChange = (newDate: string, newSession: string) => {
    setSelectedDate(newDate);
    setSelectedSession(newSession);
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    clubStudents.forEach(s => {
      const existing = attendance.find(
        a => a.studentId === s.id && a.date === newDate && a.session === newSession
      );
      updated[s.id] = {
        status: existing ? existing.status : 'PRESENT',
        notes: existing?.notes || ''
      };
    });
    setDraftStatus(updated);
  };

  // Set single student status
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setDraftStatus(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Set single student notes
  const setStudentNotes = (studentId: string, notes: string) => {
    setDraftStatus(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'PRESENT',
        notes
      }
    }));
  };

  // Quick batch actions
  const setAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    clubStudents.forEach(s => {
      updated[s.id] = {
        status: 'PRESENT',
        notes: draftStatus[s.id]?.notes || ''
      };
    });
    setDraftStatus(updated);
    addToast('Đã đánh dấu tất cả võ sinh CÓ MẶT', 'info');
  };

  // Save changes
  const handleSaveAttendance = () => {
    const recordsToSave: AttendanceRecord[] = clubStudents.map(student => {
      const draft = draftStatus[student.id] || { status: 'PRESENT', notes: '' };
      return {
        id: `att_${student.id}_${selectedDate}_${Date.now()}`,
        clubId,
        studentId: student.id,
        date: selectedDate,
        session: selectedSession,
        status: draft.status,
        notes: draft.notes,
        updatedAt: new Date().toISOString()
      };
    });

    saveAttendanceBatch(recordsToSave);
  };

  // Filtered students by search
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return clubStudents;
    const term = searchTerm.toLowerCase();
    return clubStudents.filter(s =>
      s.fullName.toLowerCase().includes(term) ||
      (s.dharmaName && s.dharmaName.toLowerCase().includes(term)) ||
      s.code.toLowerCase().includes(term) ||
      s.phone.includes(term)
    );
  }, [clubStudents, searchTerm]);

  // Statistics for current session
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;

    clubStudents.forEach(s => {
      const st = draftStatus[s.id]?.status || 'PRESENT';
      if (st === 'PRESENT') present++;
      else if (st === 'LATE') late++;
      else if (st === 'EXCUSED') excused++;
      else if (st === 'ABSENT') absent++;
    });

    return { present, late, excused, absent, total: clubStudents.length };
  }, [clubStudents, draftStatus]);

  // Unique past dates with records for history view
  const historyDates = useMemo(() => {
    const dates = new Set<string>();
    attendance.filter(a => a.clubId === clubId).forEach(a => dates.add(a.date));
    return Array.from(dates).sort().reverse();
  }, [attendance, clubId]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    const filename = `Diem_Danh_${currentClub?.code || 'CLB'}_${selectedDate}.pdf`;
    await pdfService.exportElementToPdf('attendance-printable-area', filename, 'portrait');
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner CLB & Chế độ xem */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900">
              Điểm Danh Võ Sinh
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {currentClub?.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Sổ Điểm Danh Buổi Tập &bull; {currentClub?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            HLV phụ trách: <strong>{currentClub?.coach}</strong> &bull; Tổng số võ sinh CLB: <strong>{clubStudents.length} em</strong>
          </p>
        </div>

        {/* Tab Toggle: Điểm danh hôm nay vs Lịch sử */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'checkin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Điểm Danh Buổi Tập</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-amber-600" />
            <span>Lịch Sử ({historyDates.length} ngày)</span>
          </button>
        </div>
      </div>

      {activeTab === 'checkin' ? (
        <>
          {/* Controls: Date, Session, Quick Action Buttons */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Ngày điểm danh
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => handleDateOrSessionChange(e.target.value, selectedSession)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Ca / Buổi tập
                </label>
                <select
                  value={selectedSession}
                  onChange={e => handleDateOrSessionChange(selectedDate, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
                >
                  <option value="Sáng (06:00 - 08:00)">Ca Sáng (06:00 - 08:00)</option>
                  <option value="Chiều (17:30 - 19:30)">Ca Chiều (17:30 - 19:30)</option>
                  <option value="Tối (19:30 - 21:00)">Ca Tối (19:30 - 21:00)</option>
                  <option value="Chủ Nhật (Cả ngày)">Chủ Nhật (Cả ngày)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Tìm kiếm võ sinh
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên, pháp danh..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={setAllPresent}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chọn Có Mặt Tất Cả</span>
                </button>
              </div>
            </div>

            {/* Quick Stat Pill Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số</span>
                <span className="text-xl font-black text-slate-800">{stats.total}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Có mặt</span>
                <span className="text-xl font-black text-emerald-800">{stats.present}</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Đi trễ</span>
                <span className="text-xl font-black text-amber-800">{stats.late}</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Có phép</span>
                <span className="text-xl font-black text-blue-800">{stats.excused}</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Vắng mặt</span>
                <span className="text-xl font-black text-rose-800">{stats.absent}</span>
              </div>
            </div>
          </div>

          {/* Attendance Check-in Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">
                  Danh Sách Điểm Danh Ngày {formatDateVN(selectedDate)} ({selectedSession})
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  {filteredStudents.length} võ sinh
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isExporting ? 'Đang xuất PDF...' : 'Tải Báo Cáo'}</span>
                </button>

                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Điểm Danh</span>
                </button>
              </div>
            </div>

            <div id="attendance-printable-area" className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-4">Mã VS</th>
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-3">Pháp danh</th>
                    <th className="py-3 px-3">Cấp đai</th>
                    <th className="py-3 px-4 text-center">Trạng Thái Điểm Danh</th>
                    <th className="py-3 px-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Không có võ sinh nào thuộc CLB này hoặc không khớp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const beltCfg = getBeltConfig(student.currentBelt);
                      const current = draftStatus[student.id] || { status: 'PRESENT', notes: '' };

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-600">
                            {student.code}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {student.fullName}
                          </td>
                          <td className="py-3 px-3 text-slate-600 italic">
                            {student.dharmaName || '---'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${beltCfg.badgeBg}`}>
                              {beltCfg.name} (Cấp {student.currentBeltLevel})
                            </span>
                          </td>
                          {/* 4 Status Radio Buttons */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.id, 'PRESENT')}
                                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                  current.status === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Có mặt</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.id, 'LATE')}
                                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                  current.status === 'LATE'
                                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>Đi trễ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.id, 'EXCUSED')}
                                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                  current.status === 'EXCUSED'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                              >
                                <AlertCircle className="w-3 h-3" />
                                <span>Có phép</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.id, 'ABSENT')}
                                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                  current.status === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Vắng</span>
                              </button>
                            </div>
                          </td>
                          {/* Notes input */}
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={current.notes || ''}
                              onChange={e => setStudentNotes(student.id, e.target.value)}
                              placeholder="Ghi chú (lý do...)"
                              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Nhấn <strong>Lưu Điểm Danh</strong> để hoàn tất ghi nhận buổi tập vào hệ thống.
              </span>
              <button
                onClick={handleSaveAttendance}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Điểm Danh Buổi Tập</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* History View */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">
              Lịch Sử Điểm Danh Các Buổi Tập &bull; {currentClub?.name}
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {historyDates.length} ngày đã ghi nhận
            </span>
          </div>

          {historyDates.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              Chưa có dữ liệu điểm danh lịch sử cho CLB này. Hãy tiến hành điểm danh buổi đầu tiên!
            </div>
          ) : (
            <div className="space-y-3">
              {historyDates.map(date => {
                const recordsForDate = attendance.filter(a => a.clubId === clubId && a.date === date);
                const pCount = recordsForDate.filter(r => r.status === 'PRESENT').length;
                const lCount = recordsForDate.filter(r => r.status === 'LATE').length;
                const eCount = recordsForDate.filter(r => r.status === 'EXCUSED').length;
                const aCount = recordsForDate.filter(r => r.status === 'ABSENT').length;

                return (
                  <div
                    key={date}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-50/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <strong className="text-slate-900 font-black text-sm">
                          Ngày {formatDateVN(date)}
                        </strong>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tổng số ghi nhận: {recordsForDate.length} võ sinh
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold">
                        {pCount} Có mặt
                      </span>
                      {lCount > 0 && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold">
                          {lCount} Đi trễ
                        </span>
                      )}
                      {eCount > 0 && (
                        <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-900 font-bold">
                          {eCount} Có phép
                        </span>
                      )}
                      {aCount > 0 && (
                        <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-900 font-bold">
                          {aCount} Vắng
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setSelectedDate(date);
                          setActiveTab('checkin');
                        }}
                        className="ml-2 px-3 py-1 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-700"
                      >
                        Mở xem lại &rarr;
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
};
