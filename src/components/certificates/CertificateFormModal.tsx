import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BeltRank, Certificate } from '../../types';
import { BELT_ORDER, getBeltConfig } from '../../utils/beltColors';
import { X, Award, Check } from 'lucide-react';

interface CertificateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateToEdit?: Certificate | null;
  defaultStudentId?: string;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  isOpen,
  onClose,
  certificateToEdit,
  defaultStudentId
}) => {
  const { students, exams, addCertificate, updateCertificate, settings } = useApp();

  const [certNumber, setCertNumber] = useState('');
  const [studentId, setStudentId] = useState(defaultStudentId || students[0]?.id || '');
  const [examId, setExamId] = useState(exams[0]?.id || '');
  const [beltConferred, setBeltConferred] = useState<BeltRank>('LAM_DAI');
  const [beltLevel, setBeltLevel] = useState<number>(1);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [signerTitle, setSignerTitle] = useState(settings.masterSignerTitle || 'Trưởng Ban Chuyên Môn');
  const [signerName, setSignerName] = useState(settings.masterSignerName || 'Võ sư Thích Tâm Thiện');
  const [decisionNumber, setDecisionNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (certificateToEdit) {
      setCertNumber(certificateToEdit.certNumber);
      setStudentId(certificateToEdit.studentId);
      setExamId(certificateToEdit.examId);
      setBeltConferred(certificateToEdit.beltConferred);
      setBeltLevel(certificateToEdit.beltLevel);
      setIssueDate(certificateToEdit.issueDate);
      setSignerTitle(certificateToEdit.signerTitle);
      setSignerName(certificateToEdit.signerName);
      setDecisionNumber(certificateToEdit.decisionNumber);
      setNotes(certificateToEdit.notes || '');
    } else {
      const year = new Date().getFullYear();
      const random = Math.floor(100 + Math.random() * 900);
      setCertNumber(`VB-PQQ-${year}-${random}`);
      const initialStudent = defaultStudentId ? students.find(s => s.id === defaultStudentId) || students[0] : students[0];
      setStudentId(initialStudent?.id || students[0]?.id || '');
      setExamId(exams[0]?.id || '');
      setBeltConferred(initialStudent?.currentBelt || 'LAM_DAI');
      setBeltLevel(initialStudent?.currentBeltLevel || 1);
      setIssueDate(new Date().toISOString().split('T')[0]);
      setSignerTitle(settings.masterSignerTitle || 'Trưởng Ban Chuyên Môn');
      setSignerName(settings.masterSignerName || 'Võ sư Thích Tâm Thiện');
      setDecisionNumber(`15/QĐ-PQQ/${year}`);
      setNotes('');
    }
  }, [certificateToEdit, isOpen, defaultStudentId, students, exams, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim() || !studentId) return;

    if (certificateToEdit) {
      updateCertificate({
        ...certificateToEdit,
        certNumber: certNumber.trim(),
        studentId,
        examId,
        beltConferred,
        beltLevel: Number(beltLevel),
        issueDate,
        signerTitle: signerTitle.trim(),
        signerName: signerName.trim(),
        decisionNumber: decisionNumber.trim(),
        notes: notes.trim() || undefined
      });
    } else {
      addCertificate({
        certNumber: certNumber.trim(),
        studentId,
        examId,
        beltConferred,
        beltLevel: Number(beltLevel),
        issueDate,
        signerTitle: signerTitle.trim(),
        signerName: signerName.trim(),
        decisionNumber: decisionNumber.trim(),
        qrCode: `PQQ-${certNumber.trim()}-${beltConferred}`,
        status: 'ACTIVE',
        notes: notes.trim() || undefined
      });
    }

    onClose();
  };

  const selectedBeltCfg = getBeltConfig(beltConferred);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">
                {certificateToEdit ? 'Chỉnh Sửa Văn Bằng' : 'Cấp Văn Bằng Thăng Đai'}
              </h3>
              <p className="text-xs text-purple-200 font-light">Môn Phái Phật Quang Quyền</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Hiệu Bằng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={certNumber}
                onChange={e => setCertNumber(e.target.value)}
                placeholder="VB-PQQ-2026-001"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Quyết Định Chuẩn Y
              </label>
              <input
                type="text"
                value={decisionNumber}
                onChange={e => setDecisionNumber(e.target.value)}
                placeholder="10/QĐ-PQQ/2026"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Võ Sinh Nhận Bằng <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} {s.dharmaName ? `(${s.dharmaName})` : ''} - {s.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Đợt Thi Được Công Nhận
            </label>
            <select
              value={examId}
              onChange={e => setExamId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.sessionCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cấp Đai Được Cấp
              </label>
              <select
                value={beltConferred}
                onChange={e => setBeltConferred(e.target.value as BeltRank)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <select
                value={beltLevel}
                onChange={e => setBeltLevel(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: selectedBeltCfg.maxLevels }, (_, i) => i + 1).map(lvl => (
                  <option key={lvl} value={lvl}>
                    Cấp {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Ký Cấp Bằng
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chức Danh Người Ký
              </label>
              <input
                type="text"
                value={signerTitle}
                onChange={e => setSignerTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ Tên Người Ký Bằng
            </label>
            <input
              type="text"
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-700/20 flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{certificateToEdit ? 'Lưu Thay Đổi' : 'Phát Hành Bằng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
