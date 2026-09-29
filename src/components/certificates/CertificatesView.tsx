import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate } from '../../types';
import { BELT_ORDER, getBeltConfig } from '../../utils/beltColors';
import { formatDateVN } from '../../utils/formatters';
import { CertificatePreviewModal } from './CertificatePreviewModal';
import { CertificateFormModal } from './CertificateFormModal';
import { Search, Award, Download, Plus, Eye, Edit, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface CertificatesViewProps {
  initialSelectedCertId?: string | null;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ initialSelectedCertId }) => {
  const { certificates, students, exams, clubs, deleteCertificate } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBelt, setSelectedBelt] = useState('ALL');
  const [selectedExamId, setSelectedExamId] = useState('ALL');

  const [previewCert, setPreviewCert] = useState<Certificate | null>(() => {
    if (initialSelectedCertId) {
      return certificates.find(c => c.id === initialSelectedCertId) || null;
    }
    return null;
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(!!initialSelectedCertId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [certToEdit, setCertToEdit] = useState<Certificate | null>(null);

  const filteredCerts = useMemo(() => {
    return certificates.filter(cert => {
      const student = students.find(s => s.id === cert.studentId);
      if (selectedBelt !== 'ALL' && cert.beltConferred !== selectedBelt) {
        return false;
      }
      if (selectedExamId !== 'ALL' && cert.examId !== selectedExamId) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNum = cert.certNumber.toLowerCase().includes(term);
        const matchName = student ? student.fullName.toLowerCase().includes(term) : false;
        return matchNum || matchName;
      }
      return true;
    });
  }, [certificates, students, selectedBelt, selectedExamId, searchTerm]);

  const handleDelete = (c: Certificate) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa văn bằng số ${c.certNumber}?`)) {
      deleteCertificate(c.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Quản Lý Văn Bằng Thăng Đai Môn Phái
          </h2>
          <p className="text-xs text-slate-500">
            Hệ thống cấp phát chứng nhận thăng đai, lưu sổ văn bằng và xuất file PDF chuẩn in ấn A4.
          </p>
        </div>

        <button
          onClick={() => {
            setCertToEdit(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-700/20 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cấp Văn Bằng Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm theo số bằng, tên võ sinh..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={selectedBelt}
              onChange={e => setSelectedBelt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">Tất cả Cấp Đai ({certificates.length})</option>
              {BELT_ORDER.map(b => (
                <option key={b} value={b}>
                  {getBeltConfig(b).name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">Tất cả Khóa Thi ({exams.length})</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Certificates Grid List */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Chưa có văn bằng nào được tìm thấy</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bạn có thể cấp văn bằng mới hoặc vào mục &ldquo;Kỳ Thi & Phiếu Thi&rdquo; để tự động sinh bằng cho thí sinh thi đạt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCerts.map(cert => {
            const student = students.find(s => s.id === cert.studentId);
            const club = student ? clubs.find(c => c.id === student.clubId) : null;
            const exam = exams.find(e => e.id === cert.examId);
            const beltCfg = getBeltConfig(cert.beltConferred);

            return (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Belt decorative header strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: beltCfg.bgHex }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-2xs"
                      style={{ backgroundColor: beltCfg.bgHex, color: beltCfg.textHex }}
                    >
                      {beltCfg.name} - Cấp {cert.beltLevel}
                    </span>
                    <span className="font-mono text-xs font-black text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {cert.certNumber}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 mt-2 group-hover:text-purple-900 transition-colors">
                    {student?.fullName || 'Võ sinh'}
                  </h3>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Đơn vị CLB:</span>
                      <strong className="text-slate-800">{club?.name || '---'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ngày cấp bằng:</span>
                      <span>{formatDateVN(cert.issueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Quyết định số:</span>
                      <span className="font-medium text-slate-700">{cert.decisionNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCertToEdit(cert);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Sửa thông tin văn bằng"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cert)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa văn bằng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setPreviewCert(cert);
                      setIsPreviewOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-purple-200"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    <span>Xem & Tải PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CertificatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        certificate={previewCert}
      />

      <CertificateFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        certificateToEdit={certToEdit}
      />
    </div>
  );
};
