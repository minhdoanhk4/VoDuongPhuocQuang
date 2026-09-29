import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamSheet } from '../../types';
import { getBeltConfig } from '../../utils/beltColors';
import { calculateExamResult, getResultBadge } from '../../utils/formatters';
import { X, Check, Award, Calculator, Sparkles } from 'lucide-react';

interface ExamGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  examSheet: ExamSheet | null;
}

export const ExamGradingModal: React.FC<ExamGradingModalProps> = ({
  isOpen,
  onClose,
  examSheet
}) => {
  const { students, exams, updateExamSheet } = useApp();

  const [scoreCanBan, setScoreCanBan] = useState<number>(0);
  const [scoreBaiQuyen, setScoreBaiQuyen] = useState<number>(0);
  const [scoreBinhKhi, setScoreBinhKhi] = useState<number>(0);
  const [scoreTheLuc, setScoreTheLuc] = useState<number>(0);
  const [scoreDoiKhang, setScoreDoiKhang] = useState<number>(0);
  const [scoreLyThuyet, setScoreLyThuyet] = useState<number>(0);
  const [examiners, setExaminers] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (examSheet) {
      setScoreCanBan(examSheet.scoreCanBan || 0);
      setScoreBaiQuyen(examSheet.scoreBaiQuyen || 0);
      setScoreBinhKhi(examSheet.scoreBinhKhi || 0);
      setScoreTheLuc(examSheet.scoreTheLuc || 0);
      setScoreDoiKhang(examSheet.scoreDoiKhang || 0);
      setScoreLyThuyet(examSheet.scoreLyThuyet || 0);
      setExaminers(examSheet.examiners || '');
      setNotes(examSheet.notes || '');
    }
  }, [examSheet, isOpen]);

  if (!isOpen || !examSheet) return null;

  const student = students.find(s => s.id === examSheet.studentId);
  const exam = exams.find(e => e.id === examSheet.examId);
  const targetBeltCfg = getBeltConfig(examSheet.targetBelt);

  // Tính toán điểm số thời gian thực
  const { totalScore, averageScore, result } = calculateExamResult({
    scoreCanBan,
    scoreBaiQuyen,
    scoreBinhKhi,
    scoreTheLuc,
    scoreDoiKhang,
    scoreLyThuyet
  });

  const resultBadge = getResultBadge(result);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateExamSheet({
      ...examSheet,
      scoreCanBan: Number(scoreCanBan),
      scoreBaiQuyen: Number(scoreBaiQuyen),
      scoreBinhKhi: Number(scoreBinhKhi),
      scoreTheLuc: Number(scoreTheLuc),
      scoreDoiKhang: Number(scoreDoiKhang),
      scoreLyThuyet: Number(scoreLyThuyet),
      totalScore,
      averageScore,
      result,
      examiners: examiners.trim() || undefined,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0072de] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">Phiếu Chấm Điểm Thăng Đai</h3>
              <p className="text-xs text-blue-100 font-light truncate max-w-xs">{exam?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-slate-900">
              {student?.fullName} {student?.dharmaName ? `(${student.dharmaName})` : ''}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Mã VS: {student?.code}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Đăng ký thi thăng:</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs inline-block mt-0.5"
              style={{ backgroundColor: targetBeltCfg.bgHex, color: targetBeltCfg.textHex }}
            >
              {targetBeltCfg.name} - Cấp {examSheet.targetBeltLevel}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* 6 Tiêu chí chấm điểm (Thang điểm 10) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Bảng Chấm Điểm Chi Tiết (Thang điểm 10)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Căn Bản Quyền Pháp & Tấn
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                  value={scoreCanBan}
                  onChange={e => setScoreCanBan(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white"
                />
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Bài Quyền Quy Định
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                  value={scoreBaiQuyen}
                  onChange={e => setScoreBaiQuyen(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white"
                />
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Binh Khí (Côn / Kiếm / Đao)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={scoreBinhKhi}
                  onChange={e => setScoreBinhKhi(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white"
                />
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Thể Lực & Công Phá
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                  value={scoreTheLuc}
                  onChange={e => setScoreTheLuc(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white"
                />
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. Song Đấu & Phân Thế
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                  value={scoreDoiKhang}
                  onChange={e => setScoreDoiKhang(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white"
                />
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6. Lý Thuyết Võ Đạo PQQ
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                  value={scoreLyThuyet}
                  onChange={e => setScoreLyThuyet(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Real-time Result Summary Box */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#0072de] font-semibold block">Kết Quả Đánh Giá Tự Động:</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xs text-slate-600">Tổng điểm: <strong>{totalScore}</strong>/60</span>
                <span className="text-xs text-slate-600">&bull;</span>
                <span className="text-sm font-black text-slate-900">Điểm TB: {averageScore}/10</span>
              </div>
            </div>

            <div>
              <span className={`px-3 py-1 rounded-full border text-xs font-black shadow-xs ${resultBadge.className}`}>
                {resultBadge.label}
              </span>
            </div>
          </div>

          {/* Giám khảo & Nhận xét */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giám Khảo Chấm Điểm
              </label>
              <input
                type="text"
                value={examiners}
                onChange={e => setExaminers(e.target.value)}
                placeholder="Họ tên giám khảo chấm..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhận Xét Của Hội Đồng Chấm Thi
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ưu điểm, nhược điểm, lời nhắc nhở võ sinh..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de] resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
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
              <span>Lưu Kết Quả Chấm Thi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
