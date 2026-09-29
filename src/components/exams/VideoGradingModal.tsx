import React, { useState } from 'react';
import { VideoSubmission, VideoExamResult } from '../../types';
import { getBeltConfig } from '../../utils/beltColors';
import { useApp } from '../../context/AppContext';
import {
  Video,
  CheckCircle2,
  XCircle,
  X,
  ExternalLink,
  Award,
  UserCheck,
  Play
} from 'lucide-react';

interface VideoGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoSubmission | null;
  onGraded?: (result: VideoExamResult) => void;
}

export const VideoGradingModal: React.FC<VideoGradingModalProps> = ({
  isOpen,
  onClose,
  video,
  onGraded
}) => {
  const { gradeVideoSubmission, students, clubs } = useApp();

  const [selectedResult, setSelectedResult] = useState<VideoExamResult>('PASS');
  const [judgeNote, setJudgeNote] = useState('');
  const [reviewerName, setReviewerName] = useState('Võ sư Thích Tâm Thiện');

  React.useEffect(() => {
    if (video) {
      setSelectedResult(video.status === 'FAIL' ? 'FAIL' : 'PASS');
      setJudgeNote(video.judgeNote || '');
      if (video.reviewerName) {
        setReviewerName(video.reviewerName);
      }
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const student = students.find(s => s.id === video.studentId);
  const club = clubs.find(c => c.id === video.clubId);
  const targetBeltCfg = getBeltConfig(video.targetBelt);

  // Helper to extract YouTube embed URL if applicable
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const embedUrl = getEmbedUrl(video.videoUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gradeVideoSubmission(video.id, selectedResult, judgeNote, reviewerName);
    if (onGraded) onGraded(selectedResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0072de] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Chấm Điểm Video Bài Thi Thăng Đai
              </h3>
              <p className="text-xs text-blue-100 font-light">
                Đánh giá bài thi xem ĐẠT hoặc KHÔNG ĐẠT &bull; Môn Phái Phật Quang Quyền
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

        {/* Candidate & Exam Information Banner */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {video.studentName}
              </span>
            </div>
            <p className="text-slate-500 mt-0.5">
              Đơn vị: <strong className="text-slate-700">{club?.name || 'CLB'}</strong> &bull; Bài thi:{' '}
              <strong className="text-slate-900">{video.content}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Cấp đai thi lên:</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs"
              style={{ backgroundColor: targetBeltCfg.bgHex, color: targetBeltCfg.textHex }}
            >
              {targetBeltCfg.name} - Cấp {video.targetBeltLevel}
            </span>
          </div>
        </div>

        {/* Video Player or External Link */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-[#0072de]" />
                <span>Video Bài Thi Nộp:</span>
              </label>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#0072de] hover:underline font-bold"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {embedUrl ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-black">
                <iframe
                  src={embedUrl}
                  title={`Video bài thi của ${video.studentName}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="truncate max-w-md">
                  <span className="text-xs text-slate-500 block">Đường dẫn liên kết:</span>
                  <span className="text-xs font-mono font-bold text-slate-800 truncate block">
                    {video.videoUrl}
                  </span>
                </div>
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Xem Video</span>
                </a>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* 2 Big Choice Buttons: ĐẠT vs KHÔNG ĐẠT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Kết Quả Đánh Giá Của Giám Khảo:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Nút ĐẠT */}
                <button
                  type="button"
                  onClick={() => setSelectedResult('PASS')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedResult === 'PASS'
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                  }`}
                >
                  <CheckCircle2
                    className={`w-7 h-7 ${
                      selectedResult === 'PASS' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <div className="text-center">
                    <span className="text-sm font-black block">ĐẠT (PASS)</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Đạt chuẩn thăng đai &amp; cấp chứng nhận
                    </span>
                  </div>
                </button>

                {/* Nút KHÔNG ĐẠT */}
                <button
                  type="button"
                  onClick={() => setSelectedResult('FAIL')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedResult === 'FAIL'
                      ? 'border-rose-500 bg-rose-50/80 text-rose-900 shadow-sm ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                  }`}
                >
                  <XCircle
                    className={`w-7 h-7 ${
                      selectedResult === 'FAIL' ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  />
                  <div className="text-center">
                    <span className="text-sm font-black block">KHÔNG ĐẠT (FAIL)</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Chưa đạt yêu cầu, cần rèn luyện thêm
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Nhận xét của Giám Khảo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhận Xét Của Hội Đồng Ban Giám Khảo
              </label>
              <textarea
                rows={3}
                required
                value={judgeNote}
                onChange={e => setJudgeNote(e.target.value)}
                placeholder={
                  selectedResult === 'PASS'
                    ? 'Nhận xét ưu điểm, đòn thế, thần thái võ đạo...'
                    : 'Ghi rõ động tác chưa đạt, tấn pháp cần khắc phục để võ sinh rèn luyện thêm...'
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/50 resize-none font-medium"
              />
            </div>

            {/* Giám khảo chấm */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ Tên Giám Khảo Chấm
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  placeholder="Võ sư Thích Tâm Thiện, HLV Tuệ Minh..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white font-semibold"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedResult === 'PASS'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>
                  Lưu Kết Quả:{' '}
                  {selectedResult === 'PASS' ? 'ĐẠT TIÊU CHUẨN' : 'KHÔNG ĐẠT'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
