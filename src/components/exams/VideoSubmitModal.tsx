import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BeltRank } from '../../types';
import { BELT_ORDER, getBeltConfig, getNextBeltRank } from '../../utils/beltColors';
import { Video, X, Check, Link2, User, Award, Building2 } from 'lucide-react';

interface VideoSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClubId?: string;
  defaultStudentId?: string;
}

export const VideoSubmitModal: React.FC<VideoSubmitModalProps> = ({
  isOpen,
  onClose,
  defaultClubId,
  defaultStudentId
}) => {
  const { clubs, students, addVideoSubmission, exams } = useApp();

  const [selectedClubId, setSelectedClubId] = useState(defaultClubId || clubs[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId || '');
  const [targetBelt, setTargetBelt] = useState<BeltRank>('LUC_DAI');
  const [targetBeltLevel, setTargetBeltLevel] = useState<number>(1);
  const [content, setContent] = useState('Bài Quyền Thập Nhị Phân Thế');
  const [videoUrl, setVideoUrl] = useState('');
  const [judgeNote, setJudgeNote] = useState('');
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');

  // Cập nhật khi default props thay đổi
  useEffect(() => {
    if (defaultClubId) setSelectedClubId(defaultClubId);
  }, [defaultClubId]);

  useEffect(() => {
    if (defaultStudentId) setSelectedStudentId(defaultStudentId);
  }, [defaultStudentId]);

  // Võ sinh thuộc CLB được chọn
  const clubStudents = students.filter(s => selectedClubId === 'ALL' || s.clubId === selectedClubId);

  // Tự động gợi ý đai tiếp theo khi chọn võ sinh
  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) {
        const next = getNextBeltRank(student.currentBelt, student.currentBeltLevel);
        setTargetBelt(next.belt);
        setTargetBeltLevel(next.level);
      }
    } else if (clubStudents.length > 0) {
      setSelectedStudentId(clubStudents[0].id);
    }
  }, [selectedStudentId, selectedClubId, students]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !videoUrl.trim()) return;

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    addVideoSubmission({
      examId: selectedExamId || undefined,
      studentId: student.id,
      studentName: student.fullName,
      clubId: student.clubId,
      targetBelt,
      targetBeltLevel,
      content: content.trim(),
      videoUrl: videoUrl.trim(),
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      judgeNote: judgeNote.trim() || 'Chờ Hội đồng Ban Giám khảo chấm duyệt'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0072de] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Nộp Video Bài Thi Thăng Đai</h3>
              <p className="text-xs text-blue-100 font-light">Gửi link video bài thi để Giám khảo chấm đạt/không đạt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Chọn CLB & Đợt Thi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#0072de]" />
                <span>Câu Lạc Bộ</span>
              </label>
              <select
                value={selectedClubId}
                onChange={e => {
                  setSelectedClubId(e.target.value);
                  setSelectedStudentId('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/50"
              >
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Khóa / Kỳ Thi (nếu có)
              </label>
              <select
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/50"
              >
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chọn Võ Sinh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#0072de]" />
              <span>Võ Sinh Nộp Bài Thi <span className="text-rose-500">*</span></span>
            </label>
            {clubStudents.length === 0 ? (
              <p className="text-slate-400 italic py-2">CLB này chưa có võ sinh nào.</p>
            ) : (
              <select
                required
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/50"
              >
                {clubStudents.map(s => {
                  const cfg = getBeltConfig(s.currentBelt);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.fullName} - Đai: {cfg.name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Cấp Đai Thi Lên */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#0072de]" />
                <span>Cấp Đai Thi Lên</span>
              </label>
              <select
                value={targetBelt}
                onChange={e => setTargetBelt(e.target.value as BeltRank)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/50"
              >
                {BELT_ORDER.map(b => (
                  <option key={b} value={b}>
                    {getBeltConfig(b).name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cấp / Gạch
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={targetBeltLevel}
                onChange={e => setTargetBeltLevel(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/50 text-center"
              />
            </div>
          </div>

          {/* Nội dung bài thi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên Bài Thi / Kỹ Thuật Nộp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="VD: Bài Quyền Thập Nhị Phân Thế, Bát Đoạn Quyền, Song Luyện Côn..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white font-medium"
            />
          </div>

          {/* Link Video */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-[#0072de]" />
              <span>Đường Dẫn Video (YouTube / Google Drive / MP4) <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... hoặc link Google Drive"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white font-mono"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi Chú Của Thí Sinh / HLV
            </label>
            <input
              type="text"
              value={judgeNote}
              onChange={e => setJudgeNote(e.target.value)}
              placeholder="Lời nhắn gửi cho Ban Giám Khảo..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/50"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              <span>Nộp Video Bài Thi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
