import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BeltRank, ExamSession } from '../../types';
import { BELT_ORDER, getBeltConfig, getNextBeltRank } from '../../utils/beltColors';
import { X, UserPlus, Award, Check } from 'lucide-react';

interface ExamCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamSession | null;
}

export const ExamCandidateModal: React.FC<ExamCandidateModalProps> = ({
  isOpen,
  onClose,
  exam
}) => {
  const { students, examSheets, addExamSheet, clubs } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [targetBelt, setTargetBelt] = useState<BeltRank>('LAM_DAI');
  const [targetBeltLevel, setTargetBeltLevel] = useState<number>(1);
  const [examiners, setExaminers] = useState(exam?.examinerCouncil || '');
  const [notes, setNotes] = useState('');

  // Lọc ra các võ sinh chưa đăng ký vào đợt thi này
  const registeredStudentIds = exam ? examSheets.filter(s => s.examId === exam.id).map(s => s.studentId) : [];
  const availableStudents = students.filter(s => !registeredStudentIds.includes(s.id));

  // Tự động gợi ý cấp đai thi lên khi chọn võ sinh
  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const student = students.find(s => s.id === id);
    if (student) {
      const next = getNextBeltRank(student.currentBelt, student.currentBeltLevel);
      setTargetBelt(next.belt);
      setTargetBeltLevel(next.level);
    }
  };

  useEffect(() => {
    if (availableStudents.length > 0 && !selectedStudentId) {
      handleStudentChange(availableStudents[0].id);
    }
  }, [availableStudents, selectedStudentId]);

  if (!isOpen || !exam) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    addExamSheet({
      examId: exam.id,
      studentId: selectedStudentId,
      targetBelt,
      targetBeltLevel: Number(targetBeltLevel),
      scoreCanBan: 0,
      scoreBaiQuyen: 0,
      scoreBinhKhi: 0,
      scoreTheLuc: 0,
      scoreDoiKhang: 0,
      scoreLyThuyet: 0,
      totalScore: 0,
      averageScore: 0,
      result: 'FAIL',
      examiners: examiners.trim() || exam.examinerCouncil,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  const currentStudent = students.find(s => s.id === selectedStudentId);
  const currentBeltCfg = currentStudent ? getBeltConfig(currentStudent.currentBelt) : null;
  const targetBeltCfg = getBeltConfig(targetBelt);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-[#0072de] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">Đăng Ký Võ Sinh Dự Thi</h3>
              <p className="text-xs text-blue-100 font-light truncate max-w-xs">{exam.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {availableStudents.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Tất cả võ sinh hiện tại đã được đăng ký vào đợt thi này!
            </div>
          ) : (
            <>
              {/* Chọn võ sinh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Võ Sinh Đăng Ký Thi <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={e => handleStudentChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {availableStudents.map(s => {
                    const club = clubs.find(c => c.id === s.clubId);
                    const b = getBeltConfig(s.currentBelt);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.fullName} {s.dharmaName ? `(${s.dharmaName})` : ''} - {b.name} Cấp {s.currentBeltLevel} [{club?.name || 'PQQ'}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Thông tin chuyển cấp đai */}
              {currentStudent && currentBeltCfg && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span>Cấp đai hiện tại:</span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs"
                      style={{ backgroundColor: currentBeltCfg.bgHex, color: currentBeltCfg.textHex }}
                    >
                      {currentBeltCfg.name} - Cấp {currentStudent.currentBeltLevel}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Cấp Đai Thi Lên:
                      </label>
                      <select
                        value={targetBelt}
                        onChange={e => setTargetBelt(e.target.value as BeltRank)}
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {BELT_ORDER.map(belt => {
                          const cfg = getBeltConfig(belt);
                          return (
                            <option key={belt} value={belt}>
                              {cfg.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Cấp / Gạch Thi Lên:
                      </label>
                      <select
                        value={targetBeltLevel}
                        onChange={e => setTargetBeltLevel(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {Array.from({ length: targetBeltCfg.maxLevels }, (_, i) => i + 1).map(lvl => (
                          <option key={lvl} value={lvl}>
                            Cấp {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giám Khảo / Phân Ban Chấm Thi
                </label>
                <input
                  type="text"
                  value={examiners}
                  onChange={e => setExaminers(e.target.value)}
                  placeholder="VD: Võ sư Tâm Thiện, HLV Tuệ Minh..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi Chú Đăng Ký
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ghi chú bài quyền, nguyện vọng..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072de]"
                />
              </div>
            </>
          )}

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
              disabled={availableStudents.length === 0}
              className="px-5 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Đăng Ký Dự Thi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
