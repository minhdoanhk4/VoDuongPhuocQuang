import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus, Student } from '../../types';
import { getBeltConfig, getBeltBadgeStyle } from '../../utils/beltColors';
import { formatDateVN } from '../../utils/formatters';
import {
  CalendarCheck,
  Check,
  X,
  User,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  Save,
  HelpCircle
} from 'lucide-react';

interface ClubAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
}

export const ClubAttendanceModal: React.FC<ClubAttendanceModalProps> = ({
  isOpen,
  onClose,
  clubId
}) => {
  const { clubs, students, attendance, saveAttendanceBatch, addToast, syncToGoogleSheet, settings } = useApp();

  const currentClub = clubs.find(c => c.id === clubId) || clubs[0];

  // Danh sách võ sinh đang sinh hoạt tại CLB
  const clubStudents = useMemo(() => {
    return students.filter(s => s.clubId === clubId);
  }, [students, clubId]);

  // Thời gian điểm danh: Mặc định tháng hiện tại và ngày hôm nay
  const today = new Date().toISOString().split('T')[0];
  const currentYearMonth = today.slice(0, 7); // YYYY-MM

  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [sessionName, setSessionName] = useState<string>('Chiều (17:30 - 19:30)');

  // Trạng thái nháp điểm danh cho từng võ sinh (PRESENT / ABSENT)
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus>>({});

  // Trạng thái hiển thị Pop-up xác nhận
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Đồng bộ draft khi thay đổi ngày hoặc danh sách võ sinh
  useEffect(() => {
    if (!isOpen) return;

    const initialMap: Record<string, AttendanceStatus> = {};
    clubStudents.forEach(s => {
      // Tìm xem đã có bản ghi điểm danh trong ngày này chưa
      const existing = attendance.find(
        a => a.studentId === s.id && a.date === selectedDate
      );
      if (existing) {
        initialMap[s.id] = existing.status;
      } else {
        // Mặc định: Còn học -> Có mặt, Tạm nghỉ/Nghỉ -> Vắng
        initialMap[s.id] = s.status === 'ACTIVE' ? 'PRESENT' : 'ABSENT';
      }
    });
    setAttendanceDraft(initialMap);
  }, [isOpen, selectedDate, clubStudents, attendance]);

  // Khi người dùng đổi tháng, tự động đặt ngày về ngày đầu tiên hoặc ngày hôm nay nếu trùng tháng
  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    if (today.startsWith(newMonth)) {
      setSelectedDate(today);
    } else {
      setSelectedDate(`${newMonth}-01`);
    }
  };

  // Thay đổi trạng thái Có/Vắng cho một võ sinh
  const toggleStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceDraft(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Đánh dấu tất cả Có
  const setAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    clubStudents.forEach(s => {
      updated[s.id] = 'PRESENT';
    });
    setAttendanceDraft(updated);
  };

  // Đánh dấu tất cả Vắng
  const setAllAbsent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    clubStudents.forEach(s => {
      updated[s.id] = 'ABSENT';
    });
    setAttendanceDraft(updated);
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

  // Xử lý khi nhấn nút Lưu ở đáy danh sách -> MỞ POPUP XÁC NHẬN
  const handleOpenConfirm = () => {
    if (clubStudents.length === 0) {
      addToast('Câu lạc bộ chưa có võ sinh nào để điểm danh!', 'warning', 'Chưa có võ sinh');
      return;
    }
    setIsConfirmOpen(true);
  };

  // Xử lý xác nhận lưu trong Pop-up
  const handleConfirmSave = async () => {
    setIsSaving(true);

    const now = new Date().toISOString();
    const recordsToSave: AttendanceRecord[] = clubStudents.map(student => {
      const status = attendanceDraft[student.id] || 'PRESENT';
      return {
        id: `att_${student.id}_${selectedDate}`,
        clubId: currentClub.id,
        studentId: student.id,
        date: selectedDate,
        session: sessionName,
        status,
        notes: status === 'PRESENT' ? 'Có mặt đúng giờ' : 'Vắng mặt',
        createdAt: now,
        updatedAt: now
      };
    });

    // Lưu vào App State & LocalStorage
    saveAttendanceBatch(recordsToSave);

    // Tự động đồng bộ Google Sheets nếu đã cấu hình
    if (settings.isAutoSync && settings.googleSheetScriptUrl) {
      syncToGoogleSheet().catch(() => {});
    }

    setIsSaving(false);
    setIsConfirmOpen(false);
    onClose();

    // Hiển thị thông báo thành công trên thanh thông báo đẩy (Toast)
    addToast(
      `Điểm danh thành công! Đã ghi nhận Hiện có: ${presentCount} võ sinh, Vắng: ${absentCount} võ sinh.`,
      'success',
      'Điểm Danh Hoàn Tất'
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MODAL ĐIỂM DANH THEO THÁNG (SAMSUNG ONE UI MINIMALIST SOLID) */}
      {/* ============================================================== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 overflow-y-auto">
        <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Điểm Danh Theo Tháng &bull; {currentClub.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ghi nhận chuyên cần từng võ sinh theo tháng và phân kỳ tập luyện
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Thanh công cụ chọn Tháng / Ngày & Tác vụ nhanh */}
          <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200/80 shrink-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Chọn Tháng & Ngày */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-700">Tháng:</span>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => handleMonthChange(e.target.value)}
                    className="font-bold text-slate-900 bg-transparent border-0 outline-hidden cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs">
                  <span className="font-bold text-slate-700">Ngày tập:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="font-bold text-slate-900 bg-transparent border-0 outline-hidden cursor-pointer"
                  />
                </div>
              </div>

              {/* Tác vụ nhanh và Đếm số lượng */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={setAllPresent}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs cursor-pointer transition-all active:scale-95"
                >
                  Tất cả Có
                </button>
                <button
                  type="button"
                  onClick={setAllAbsent}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer transition-all active:scale-95"
                >
                  Tất cả Vắng
                </button>

                {/* Badge Thống kê */}
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                    Có: {presentCount}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold">
                    Vắng: {absentCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách võ sinh điểm danh (dạng bảng trực quan) */}
          <div className="flex-1 overflow-y-auto p-4 sm:px-6">
            {clubStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                CLB hiện chưa có võ sinh nào. Vui lòng thêm võ sinh trước khi điểm danh.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">STT</th>
                      <th className="py-3 px-3 w-14 text-center">Ảnh</th>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-3 text-center">Năm sinh</th>
                      <th className="py-3 px-3">Cấp đai hiện tại</th>
                      <th className="py-3 px-4 text-center w-48">Điểm danh [Có / Vắng]</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clubStudents.map((student, idx) => {
                      const isPresent = (attendanceDraft[student.id] || 'PRESENT') === 'PRESENT';
                      const beltCfg = getBeltConfig(student.currentBelt);

                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors ${
                            isPresent ? 'hover:bg-slate-50/70' : 'bg-rose-50/20 hover:bg-rose-50/40'
                          }`}
                        >
                          {/* STT */}
                          <td className="py-3 px-3 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>

                          {/* Ảnh đại diện nhỏ */}
                          <td className="py-3 px-3 text-center">
                            <div className="w-9 h-9 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={student.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </td>

                          {/* Họ và Tên */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-sm">
                              {student.fullName}
                            </div>
                            {student.dharmaName && (
                              <div className="text-[11px] font-medium text-amber-700">
                                PD: {student.dharmaName}
                              </div>
                            )}
                          </td>

                          {/* Năm sinh */}
                          <td className="py-3 px-3 text-center font-semibold text-slate-700">
                            {student.birthYear || (student.dob ? student.dob.split('-')[0] : '---')}
                          </td>

                          {/* Cấp đai hiện tại */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getBeltBadgeStyle(
                                student.currentBelt
                              )}`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: beltCfg.bgHex }}
                              />
                              <span>
                                {beltCfg.name} {student.currentBeltLevel ? `- Cấp ${student.currentBeltLevel}` : ''}
                              </span>
                            </span>
                          </td>

                          {/* Ô check [Có / Vắng] theo dạng segmented button */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/90 shadow-2xs">
                              {/* Nút Có */}
                              <button
                                type="button"
                                onClick={() => toggleStudentStatus(student.id, 'PRESENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 active:scale-95 ${
                                  isPresent
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Có</span>
                              </button>

                              {/* Nút Vắng */}
                              <button
                                type="button"
                                onClick={() => toggleStudentStatus(student.id, 'ABSENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 active:scale-95 ${
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Thanh chân trang: Nút Save phía dưới cùng danh sách */}
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
              Đang chọn: <span className="font-bold text-emerald-700">{presentCount} Có mặt</span> &bull;{' '}
              <span className="font-bold text-rose-700">{absentCount} Vắng</span> trên tổng số{' '}
              <span className="font-bold text-slate-900">{totalCount} võ sinh</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleOpenConfirm}
                className="px-5 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Điểm Danh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. POP-UP THÔNG BÁO XÁC NHẬN SỐ LƯỢNG HIỆN CÓ VÀ VẮNG         */}
      {/* ============================================================== */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header popup */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0072de] flex items-center justify-center mx-auto border border-blue-200 shadow-xs mb-2">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Xác Nhận Lưu Kết Quả Điểm Danh
              </h3>
              <p className="text-xs text-slate-500">
                {currentClub.name} &bull; Ngày {formatDateVN(selectedDate)}
              </p>
            </div>

            {/* Khối hiển thị số lượng Hiện có và Vắng rõ ràng, nổi bật */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/90 text-center">
              {/* Cột Hiện có */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  Hiện có
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {presentCount}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">võ sinh</div>
              </div>

              {/* Cột Vắng */}
              <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                  Vắng mặt
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-700">
                  {absentCount}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">võ sinh</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 text-center font-medium leading-relaxed">
              Bạn có chắc chắn muốn lưu kết quả điểm danh này vào hệ thống cơ sở dữ liệu không?
            </p>

            {/* 2 nút thao tác: Hủy và Xác nhận */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Đang lưu...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Xác nhận</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
