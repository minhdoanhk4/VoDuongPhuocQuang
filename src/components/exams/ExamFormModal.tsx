import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamSession, ExamStatus } from '../../types';
import { X, Calendar, MapPin, Users, Check, Sparkles } from 'lucide-react';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  examToEdit?: ExamSession | null;
}

export const ExamFormModal: React.FC<ExamFormModalProps> = ({
  isOpen,
  onClose,
  examToEdit
}) => {
  const { addExam, updateExam } = useApp();

  const [sessionCode, setSessionCode] = useState('');
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [examinerCouncil, setExaminerCouncil] = useState('');
  const [status, setStatus] = useState<ExamStatus>('UPCOMING');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (examToEdit) {
      setSessionCode(examToEdit.sessionCode);
      setName(examToEdit.name);
      setExamDate(examToEdit.examDate);
      setLocation(examToEdit.location);
      setExaminerCouncil(examToEdit.examinerCouncil);
      setStatus(examToEdit.status);
      setNotes(examToEdit.notes || '');
    } else {
      const year = new Date().getFullYear();
      const random = Math.floor(10 + Math.random() * 90);
      setSessionCode(`KT-${year}-${random}`);
      setName(`Kỳ thi Thăng đai Phật Quang Quyền - Khóa ${year}`);
      setExamDate(new Date().toISOString().split('T')[0]);
      setLocation('Tổ đình Thiền Tôn Phật Quang, Núi Dinh, Bà Rịa - Vũng Tàu');
      setExaminerCouncil('Hội đồng Giám khảo Ban Chuyên Môn Môn Phái');
      setStatus('UPCOMING');
      setNotes('');
    }
  }, [examToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sessionCode.trim()) return;

    if (examToEdit) {
      updateExam({
        ...examToEdit,
        sessionCode: sessionCode.trim(),
        name: name.trim(),
        examDate,
        location: location.trim(),
        examinerCouncil: examinerCouncil.trim(),
        status,
        notes: notes.trim() || undefined
      });
    } else {
      addExam({
        sessionCode: sessionCode.trim(),
        name: name.trim(),
        examDate,
        location: location.trim(),
        examinerCouncil: examinerCouncil.trim(),
        status,
        notes: notes.trim() || undefined
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-[#0072de] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">
                {examToEdit ? 'Chỉnh Sửa Đợt Thi' : 'Tạo Khóa Thi Thăng Đai Mới'}
              </h3>
              <p className="text-xs text-blue-100 font-light">Môn Phái Phật Quang Quyền</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên Khóa / Đợt Thi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Kỳ thi Thăng đai Khóa Thu Đông 2026"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã Khóa Thi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sessionCode}
                onChange={e => setSessionCode(e.target.value)}
                placeholder="KT-2026-01"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0072de]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Tổ Chức Thi
              </label>
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa Điểm Tổ Chức Thi
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="VD: Tổ đình Thiền Tôn Phật Quang..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hội Đồng Giám Khảo Chấm Thi
            </label>
            <input
              type="text"
              value={examinerCouncil}
              onChange={e => setExaminerCouncil(e.target.value)}
              placeholder="VD: Võ sư Tâm Thiện, HLV Tuệ Minh..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trạng Thái Đợt Thi
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ExamStatus)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de]"
            >
              <option value="UPCOMING">Sắp Diễn Ra</option>
              <option value="ONGOING">Đang Diễn Ra</option>
              <option value="COMPLETED">Đã Hoàn Tất</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi Chú Đợt Thi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Thông tin quy định, trang phục, dặn dò võ sinh..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de] resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{examToEdit ? 'Lưu Thay Đổi' : 'Tạo Đợt Thi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
