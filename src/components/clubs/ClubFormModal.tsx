import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Club } from '../../types';
import { X, Building2, Check, Calendar, MapPin, Clock } from 'lucide-react';

interface ClubFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubToEdit?: Club | null;
}

const DAYS_OF_WEEK = [
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
  'Chủ Nhật'
];

export const ClubFormModal: React.FC<ClubFormModalProps> = ({
  isOpen,
  onClose,
  clubToEdit
}) => {
  const { addClub, updateClub, addToast } = useApp();

  // 4 trường tinh giản theo yêu cầu
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [establishedMonth, setEstablishedMonth] = useState('2026-09');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Thứ 2', 'Thứ 4', 'Thứ 6']);

  useEffect(() => {
    if (clubToEdit) {
      setName(clubToEdit.name);
      setAddress(clubToEdit.address || '');
      const dateStr = clubToEdit.establishedDate || '2026-09';
      setEstablishedMonth(dateStr.length >= 7 ? dateStr.slice(0, 7) : '2026-09');
      setSelectedDays(clubToEdit.trainingSchedule || ['Thứ 2', 'Thứ 4', 'Thứ 6']);
    } else {
      setName('');
      setAddress('');
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      setEstablishedMonth(`${yyyy}-${mm}`);
      setSelectedDays(['Thứ 2', 'Thứ 4', 'Thứ 6']);
    }
  }, [clubToEdit, isOpen]);

  if (!isOpen) return null;

  // Toggle ngày tập
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Tự động tạo mã code chuẩn CLB-XXX
  const generateClubCode = (clubName: string): string => {
    const raw = clubName.replace(/^CLB\s*/i, '').trim();
    if (!raw) return `CLB-${Date.now().toString().slice(-4)}`;
    const initials = raw
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    return `CLB-${initials}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Tên Câu Lạc Bộ không được để trống!', 'warning', 'Thiếu thông tin');
      return;
    }
    if (!address.trim()) {
      addToast('Nơi thành lập không được để trống!', 'warning', 'Thiếu thông tin');
      return;
    }
    if (selectedDays.length === 0) {
      addToast('Vui lòng chọn ít nhất một ngày tập võ trong tuần!', 'warning', 'Thiếu thông tin');
      return;
    }

    if (clubToEdit) {
      updateClub({
        ...clubToEdit,
        name: name.trim(),
        address: address.trim(),
        establishedDate: establishedMonth,
        trainingSchedule: selectedDays
      });
    } else {
      const generatedCode = generateClubCode(name);
      addClub({
        name: name.trim(),
        code: generatedCode,
        coach: 'Ban Huấn Luyện Môn Phái',
        phone: '',
        address: address.trim(),
        establishedDate: establishedMonth,
        trainingSchedule: selectedDays
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Samsung One UI Solid Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0072de] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {clubToEdit ? 'Chỉnh Sửa Câu Lạc Bộ' : 'Thêm Câu Lạc Bộ Mới'}
              </h3>
              <p className="text-xs text-blue-100 font-light">
                Hệ Thống Quản Trị PQSM &bull; Phật Quang Quyền
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form tinh giản: 4 trường */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* 1. Tên CLB */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <span>Tên CLB</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên CLB"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0072de] placeholder:text-slate-400 bg-white"
            />
          </div>

          {/* 2. Nơi thành lập */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0072de]" />
              <span>Nơi thành lập</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nơi thành lập"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0072de] placeholder:text-slate-400 bg-white"
            />
          </div>

          {/* 3. Tháng, Năm thành lập */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0072de]" />
              <span>Tháng, Năm thành lập</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="month"
              required
              value={establishedMonth}
              onChange={(e) => setEstablishedMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0072de] font-medium bg-white"
            />
          </div>

          {/* 4. Thời gian tập võ (Thứ 2 - CN, option ô chọn) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0072de]" />
              <span>Thời gian tập võ</span>
            </label>

            {/* Các ô chọn Thứ 2 -> Chủ Nhật */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#0072de] text-white border-[#0072de] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>{day}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                        isSelected
                          ? 'bg-white text-[#0072de] border-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#0072de] hover:bg-[#0060bd] active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{clubToEdit ? 'Lưu Thay Đổi' : 'Thêm CLB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubFormModal;
