import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BeltRank, Student, ExamSheet, VideoSubmission } from '../../types';
import { BELT_ORDER, getBeltConfig, getNextBeltRank } from '../../utils/beltColors';
import { formatDateVN, getResultBadge } from '../../utils/formatters';
import { ExamScorecardPrintModal } from './ExamScorecardPrintModal';
import { VideoGradingModal } from './VideoGradingModal';
import { VideoSubmitModal } from './VideoSubmitModal';
import {
  FilePlus2,
  Building2,
  Award,
  Calendar,
  CheckCircle2,
  Printer,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  Video,
  Play,
  Scale
} from 'lucide-react';

interface QuickExamSheetCreatorProps {
  initialClubId?: string;
  initialBelt?: string;
  lockClubSelect?: boolean;
}

export const QuickExamSheetCreator: React.FC<QuickExamSheetCreatorProps> = ({
  initialClubId = 'ALL',
  initialBelt = 'ALL',
  lockClubSelect = false
}) => {
  const { clubs, students, exams, examSheets, addExamSheet, addToast, videos } = useApp();

  const [selectedClubId, setSelectedClubId] = useState<string>(initialClubId);
  const [selectedBelt, setSelectedBelt] = useState<string>(initialBelt);
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync when props change
  React.useEffect(() => {
    if (initialClubId) setSelectedClubId(initialClubId);
  }, [initialClubId]);

  React.useEffect(() => {
    if (initialBelt) setSelectedBelt(initialBelt);
  }, [initialBelt]);

  // Modals
  const [sheetToPrint, setSheetToPrint] = useState<ExamSheet | null>(null);
  const [videoToGrade, setVideoToGrade] = useState<VideoSubmission | null>(null);
  const [submitVideoStudent, setSubmitVideoStudent] = useState<Student | null>(null);

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];

  // Danh sách ID các võ sinh đã có phiếu trong kỳ thi này
  const registeredIds = useMemo(() => {
    if (!currentExam) return [];
    return examSheets.filter(s => s.examId === currentExam.id).map(s => s.studentId);
  }, [examSheets, currentExam]);

  // Lọc danh sách võ sinh theo CLB và Cấp Đai
  const eligibleStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedClubId !== 'ALL' && s.clubId !== selectedClubId) {
        return false;
      }
      if (selectedBelt !== 'ALL' && s.currentBelt !== selectedBelt) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(term);
        const matchPhone = s.phone.includes(term);
        return matchName || matchPhone;
      }
      return true;
    });
  }, [students, selectedClubId, selectedBelt, searchTerm]);

  // Các phiếu thi đã tạo của đợt thi này
  const createdSheetsInExam = useMemo(() => {
    if (!currentExam) return [];
    return examSheets.filter(s => s.examId === currentExam.id);
  }, [examSheets, currentExam]);

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const unregistered = eligibleStudents.filter(s => !registeredIds.includes(s.id)).map(s => s.id);
    if (selectedStudentIds.length === unregistered.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(unregistered);
    }
  };

  const handleBatchCreateSheets = () => {
    if (!currentExam) {
      addToast('Vui lòng chọn hoặc tạo đợt thi trước!', 'warning');
      return;
    }
    if (selectedStudentIds.length === 0) {
      addToast('Vui lòng chọn ít nhất 1 võ sinh để tạo phiếu dự thi!', 'warning');
      return;
    }

    let createdCount = 0;
    for (const sId of selectedStudentIds) {
      const student = students.find(s => s.id === sId);
      if (!student) continue;

      const next = getNextBeltRank(student.currentBelt, student.currentBeltLevel);

      addExamSheet({
        examId: currentExam.id,
        studentId: student.id,
        targetBelt: next.belt,
        targetBeltLevel: next.level,
        scoreCanBan: 0,
        scoreBaiQuyen: 0,
        scoreBinhKhi: 0,
        scoreTheLuc: 0,
        scoreDoiKhang: 0,
        scoreLyThuyet: 0,
        totalScore: 0,
        averageScore: 0,
        result: 'FAIL',
        examiners: currentExam.examinerCouncil,
        notes: `Đăng ký từ danh sách ${student.unitName || 'CLB'}`
      });
      createdCount++;
    }

    setSelectedStudentIds([]);
    addToast(`Đã tạo thành công ${createdCount} phiếu dự thi thăng đai!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900">
                Thư Ký Môn Phái
              </span>
              <span className="text-xs text-slate-500 font-medium">
                &bull; Tạo Phiếu Dự Thi Thăng Đai Nhanh
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Tạo Phiếu Dự Thi Theo Câu Lạc Bộ & Cấp Đai
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Khóa thi:</span>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0072de]"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.sessionCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters: Chọn CLB và Chọn Cấp Đai */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lọc theo CLB */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#0072de]" />
              <span>1. Chọn Câu Lạc Bộ:</span>
            </label>
            {lockClubSelect ? (
              <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
                <span className="font-black text-[#0072de]">
                  {clubs.find(c => c.id === selectedClubId)?.name || 'CLB Hiện Tại'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0072de] text-white">
                  Đang chọn
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClubId('ALL')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    selectedClubId === 'ALL'
                      ? 'bg-[#0072de] text-white border-[#0072de] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất Cả 5 CLB
                </button>
                {clubs.map(c => {
                  const isSelected = selectedClubId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClubId(c.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center truncate ${
                        isSelected
                          ? 'bg-[#0072de] text-white border-[#0072de] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={c.name}
                    >
                      {c.name.replace('CLB ', '')}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lọc theo Cấp Đai */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0072de]" />
              <span>2. Chọn Cấp Đai Võ Sinh:</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedBelt('ALL')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  selectedBelt === 'ALL'
                    ? 'bg-[#0072de] text-white border-[#0072de] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất Cả Đai
              </button>
              {BELT_ORDER.map(belt => {
                const cfg = getBeltConfig(belt);
                const isSelected = selectedBelt === belt;
                return (
                  <button
                    key={belt}
                    type="button"
                    onClick={() => setSelectedBelt(belt)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center truncate ${
                      isSelected
                        ? 'bg-[#0072de] text-white border-[#0072de] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cfg.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Student List with Checkboxes for Quick Exam Registration */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 text-[#0072de]" />
              <span>Chọn tất cả chưa đăng ký</span>
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Đã chọn: <strong className="text-[#0072de] font-black">{selectedStudentIds.length}</strong> võ sinh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchCreateSheets}
              disabled={selectedStudentIds.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-40 cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Tạo {selectedStudentIds.length} Phiếu Dự Thi Ngay</span>
            </button>
          </div>
        </div>

        {/* Student Checkbox Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-3 text-center w-10">Chọn</th>
                <th className="py-3 px-4">Họ và Tên Võ Sinh</th>
                <th className="py-3 px-3 text-center">Năm sinh</th>
                <th className="py-3 px-4">Câu Lạc Bộ</th>
                <th className="py-3 px-3">Cấp Đai Hiện Tại</th>
                <th className="py-3 px-4">Cấp Đai Sẽ Thi Lên</th>
                <th className="py-3 px-4">Trạng Thái Đăng Ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eligibleStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không có võ sinh nào thuộc bộ lọc này.
                  </td>
                </tr>
              ) : (
                eligibleStudents.map(student => {
                  const club = clubs.find(c => c.id === student.clubId);
                  const curBeltCfg = getBeltConfig(student.currentBelt);
                  const nextBelt = getNextBeltRank(student.currentBelt, student.currentBeltLevel);
                  const nextBeltCfg = getBeltConfig(nextBelt.belt);
                  const isRegistered = registeredIds.includes(student.id);
                  const isChecked = selectedStudentIds.includes(student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isRegistered ? 'bg-slate-50/50 opacity-70' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        {isRegistered ? (
                          <span title="Đã có phiếu thi">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectStudent(student.id)}
                            className="w-4 h-4 rounded text-[#0072de] focus:ring-[#0072de] cursor-pointer"
                          />
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span>{student.fullName}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">{student.code}</span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {student.birthYear || (student.dob ? student.dob.split('-')[0] : '---')}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {club?.name}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                          style={{ backgroundColor: curBeltCfg.bgHex, color: curBeltCfg.textHex }}
                        >
                          {curBeltCfg.name} - Cấp {student.currentBeltLevel}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-2xs"
                            style={{ backgroundColor: nextBeltCfg.bgHex, color: nextBeltCfg.textHex }}
                          >
                            {nextBeltCfg.name} - Cấp {nextBelt.level}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isRegistered ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Đã Đăng Ký
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Chưa đăng ký</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* List of Already Created Exam Sheets in this Session */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Danh Sách Võ Sinh Đã Đăng Ký Trong Khóa Này ({createdSheetsInExam.length})
            </h3>
            <p className="text-xs text-slate-500">
              Theo dõi nộp video bài thi và kết quả đánh giá Đạt / Không đạt từ Ban Giám Khảo
            </p>
          </div>
        </div>

        {createdSheetsInExam.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Chưa có thí sinh nào được đăng ký trong kỳ thi này. Hãy chọn võ sinh ở bảng trên và nhấn &ldquo;Tạo Phiếu Dự Thi Ngay&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {createdSheetsInExam.map(sheet => {
              const student = students.find(s => s.id === sheet.studentId);
              const club = student ? clubs.find(c => c.id === student.clubId) : null;
              const targetBeltCfg = getBeltConfig(sheet.targetBelt);
              const matchingVideo = videos.find(v => v.studentId === sheet.studentId);

              return (
                <div
                  key={sheet.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{student?.fullName}</span>
                      <span className="text-[10px] text-slate-500 block">{club?.name}</span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                      style={{ backgroundColor: targetBeltCfg.bgHex, color: targetBeltCfg.textHex }}
                    >
                      Thi: {targetBeltCfg.name} {sheet.targetBeltLevel}
                    </span>
                  </div>

                  {/* Video & Evaluation Status */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    {matchingVideo ? (
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold border ${
                          matchingVideo.status === 'PASS'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : matchingVideo.status === 'PENDING'
                              ? 'bg-blue-50 text-[#0072de] border-blue-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {matchingVideo.status === 'PASS'
                          ? '✅ ĐẠT'
                          : matchingVideo.status === 'PENDING'
                            ? '⏳ Chờ chấm video'
                            : '❌ Chưa đạt'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium text-[10px]">
                        Chưa nộp video
                      </span>
                    )}

                    <span className="font-semibold text-slate-600 text-[10px]">
                      {matchingVideo ? `Đã nộp: ${matchingVideo.submittedAt}` : 'Chờ nộp video thi'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-1.5 flex items-center justify-end gap-1.5">
                    {matchingVideo ? (
                      <button
                        onClick={() => setVideoToGrade(matchingVideo)}
                        className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0072de] font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Scale className="w-3 h-3 text-[#0072de]" />
                        <span>Xem &amp; Chấm Video</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSubmitVideoStudent(student || null)}
                        className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0072de] font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Video className="w-3 h-3 text-[#0072de]" />
                        <span>Nộp Video</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSheetToPrint(sheet)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Printer className="w-3 h-3 text-slate-600" />
                      <span>In Phiếu PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ExamScorecardPrintModal
        isOpen={!!sheetToPrint}
        onClose={() => setSheetToPrint(null)}
        examSheet={sheetToPrint}
      />

      <VideoGradingModal
        isOpen={!!videoToGrade}
        onClose={() => setVideoToGrade(null)}
        video={videoToGrade}
      />

      <VideoSubmitModal
        isOpen={!!submitVideoStudent}
        onClose={() => setSubmitVideoStudent(null)}
        defaultStudentId={submitVideoStudent?.id}
        defaultClubId={submitVideoStudent?.clubId}
      />
    </div>
  );
};
