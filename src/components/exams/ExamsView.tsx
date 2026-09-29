import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamSession, ExamSheet } from '../../types';
import { getBeltConfig } from '../../utils/beltColors';
import { formatDateVN, getResultBadge } from '../../utils/formatters';
import { ExamFormModal } from './ExamFormModal';
import { ExamCandidateModal } from './ExamCandidateModal';
import { ExamGradingModal } from './ExamGradingModal';
import { ExamScorecardPrintModal } from './ExamScorecardPrintModal';
import confetti from 'canvas-confetti';
import {
  Calendar,
  FilePlus,
  UserPlus,
  Award,
  Edit,
  Trash2,
  CheckCircle2,
  Printer,
  ChevronRight,
  Calculator,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { exams, examSheets, students, clubs, deleteExam, deleteExamSheet, generateCertificatesForExam, addToast } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<ExamSession | null>(null);

  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [sheetToGrade, setSheetToGrade] = useState<ExamSheet | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [sheetToPrint, setSheetToPrint] = useState<ExamSheet | null>(null);

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const currentSheets = currentExam ? examSheets.filter(s => s.examId === currentExam.id) : [];

  const passedCount = currentSheets.filter(s => s.result === 'PASS' || s.result === 'DISTINCTION').length;

  const handleCreateCertificates = () => {
    if (!currentExam) return;
    const { createdCount } = generateCertificatesForExam(currentExam.id);
    if (createdCount > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleDeleteExam = (exam: ExamSession) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đợt thi: ${exam.name}? Toàn bộ phiếu dự thi liên quan sẽ bị xóa.`)) {
      deleteExam(exam.id);
      if (selectedExamId === exam.id && exams.length > 1) {
        setSelectedExamId(exams.find(e => e.id !== exam.id)?.id || '');
      }
    }
  };

  const handleDeleteSheet = (sheet: ExamSheet) => {
    const student = students.find(s => s.id === sheet.studentId);
    if (window.confirm(`Hủy đăng ký dự thi của võ sinh: ${student?.fullName || ''}?`)) {
      deleteExamSheet(sheet.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Quản Lý Khóa Thi & Phiếu Chấm Điểm Thăng Đai
          </h2>
          <p className="text-xs text-slate-500">
            Tổ chức các đợt thi thăng đai, chấm điểm điện tử 6 môn và tự động cấp văn bằng.
          </p>
        </div>

        <button
          onClick={() => {
            setExamToEdit(null);
            setIsExamModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-colors shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          <span>Tạo Đợt Thi Mới</span>
        </button>
      </div>

      {/* Exam Sessions Horizontal Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-600" />
            Chọn Đợt Thi:
          </span>
          {exams.length === 0 ? (
            <span className="text-xs text-slate-400 italic py-1.5">Chưa có đợt thi nào.</span>
          ) : (
            exams.map(exam => {
              const isSelected = exam.id === selectedExamId;
              const count = examSheets.filter(s => s.examId === exam.id).length;
              return (
                <button
                  key={exam.id}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{exam.sessionCode} - {exam.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isSelected ? 'bg-amber-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Exam Dashboard & Candidates */}
      {currentExam ? (
        <div className="space-y-6">
          {/* Exam Summary Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 tracking-wider">
                    {currentExam.sessionCode}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    currentExam.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentExam.status === 'ONGOING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}>
                    {currentExam.status === 'COMPLETED' ? 'Đã Hoàn Tất' : currentExam.status === 'ONGOING' ? 'Đang Diễn Ra' : 'Sắp Diễn Ra'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {currentExam.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Ngày thi: <strong>{formatDateVN(currentExam.examDate)}</strong></span>
                  <span>Địa điểm: <strong>{currentExam.location}</strong></span>
                  <span>Hội đồng: <strong>{currentExam.examinerCouncil}</strong></span>
                </div>
              </div>

              {/* Action Buttons for this Exam */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCandidateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng Ký Thí Sinh</span>
                </button>
                <button
                  onClick={handleCreateCertificates}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
                  title="Tự động phát hành văn bằng cho tất cả thí sinh thi Đạt"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tự Động Sinh Văn Bằng ({passedCount})</span>
                </button>
                <button
                  onClick={() => {
                    setExamToEdit(currentExam);
                    setIsExamModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs transition-colors"
                  title="Sửa thông tin kỳ thi"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteExam(currentExam)}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 text-xs transition-colors"
                  title="Xóa kỳ thi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Tổng thí sinh đăng ký</span>
                <span className="text-lg font-black text-slate-900">{currentSheets.length}</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-800">
                <span className="block">Thi Đạt chuẩn</span>
                <span className="text-lg font-black">{passedCount}</span>
              </div>
              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-rose-800">
                <span className="block">Chưa đạt / Chờ thi</span>
                <span className="text-lg font-black">{currentSheets.length - passedCount}</span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                <span className="block">Tỷ lệ đỗ</span>
                <span className="text-lg font-black">
                  {currentSheets.length > 0 ? `${Math.round((passedCount / currentSheets.length) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Scorecards List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Danh Sách Phiếu Dự Thi & Bảng Điểm ({currentSheets.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Nhấn &ldquo;Chấm Điểm&rdquo; để nhập điểm 6 môn, hoặc &ldquo;In Phiếu&rdquo; để tải PDF
                </p>
              </div>
              <button
                onClick={() => setIsCandidateModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm thí sinh</span>
              </button>
            </div>

            {currentSheets.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Chưa có võ sinh nào đăng ký tham gia kỳ thi này. Hãy nhấn nút &ldquo;Đăng Ký Thí Sinh&rdquo; ở trên.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Thí Sinh</th>
                      <th className="py-3 px-4">CLB</th>
                      <th className="py-3 px-4">Cấp Đai Thi Lên</th>
                      <th className="py-3 px-3 text-center">Căn Bản</th>
                      <th className="py-3 px-3 text-center">Bài Quyền</th>
                      <th className="py-3 px-3 text-center">Binh Khí</th>
                      <th className="py-3 px-3 text-center">Thể Lực</th>
                      <th className="py-3 px-3 text-center">Đối Kháng</th>
                      <th className="py-3 px-3 text-center">Võ Đạo</th>
                      <th className="py-3 px-3 text-center">Điểm TB</th>
                      <th className="py-3 px-4 text-center">Kết Quả</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentSheets.map(sheet => {
                      const student = students.find(s => s.id === sheet.studentId);
                      const club = student ? clubs.find(c => c.id === student.clubId) : null;
                      const targetBeltCfg = getBeltConfig(sheet.targetBelt);
                      const resultBadge = getResultBadge(sheet.result);

                      return (
                        <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{student?.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{student?.code}</div>
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {club?.name || '---'}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-2xs whitespace-nowrap"
                              style={{ backgroundColor: targetBeltCfg.bgHex, color: targetBeltCfg.textHex }}
                            >
                              {targetBeltCfg.name} - Cấp {sheet.targetBeltLevel}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {(sheet.scoreCanBan ?? 0) > 0 ? (sheet.scoreCanBan ?? 0).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {(sheet.scoreBaiQuyen ?? 0) > 0 ? (sheet.scoreBaiQuyen ?? 0).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {(sheet.scoreBinhKhi ?? 0) > 0 ? (sheet.scoreBinhKhi ?? 0).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {(sheet.scoreTheLuc ?? 0) > 0 ? (sheet.scoreTheLuc ?? 0).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {(sheet.scoreDoiKhang ?? 0) > 0 ? (sheet.scoreDoiKhang ?? 0).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {(sheet.scoreLyThuyet ?? 0) > 0 ? (sheet.scoreLyThuyet ?? 0).toFixed(1) : '-'}
                          </td>

                          <td className="py-3 px-3 text-center font-black text-sm text-slate-900">
                            {(sheet.averageScore ?? 0) > 0 ? `${(sheet.averageScore ?? 0).toFixed(1)}` : '-'}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${resultBadge.className}`}>
                              {resultBadge.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSheetToGrade(sheet);
                                  setIsGradingModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1 transition-colors"
                                title="Chấm điểm trực tiếp"
                              >
                                <Calculator className="w-3.5 h-3.5 text-amber-600" />
                                <span>Chấm Điểm</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSheetToPrint(sheet);
                                  setIsPrintModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title="In / Xuất PDF phiếu thi"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteSheet(sheet)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hủy đăng ký"
                              >
                                <Trash2 className="w-4 h-4" />
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
        </div>
      ) : null}

      {/* Modals */}
      <ExamFormModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        examToEdit={examToEdit}
      />

      <ExamCandidateModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        exam={currentExam}
      />

      <ExamGradingModal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        examSheet={sheetToGrade}
      />

      <ExamScorecardPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        examSheet={sheetToPrint}
      />
    </div>
  );
};
