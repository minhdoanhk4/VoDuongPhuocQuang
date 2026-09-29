import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate } from '../../types';
import { getBeltConfig } from '../../utils/beltColors';
import { formatDateVN } from '../../utils/formatters';
import { pdfService } from '../../services/pdfService';
import { X, Download, Printer, Award, ShieldCheck, Sparkles } from 'lucide-react';

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  isOpen,
  onClose,
  certificate
}) => {
  const { students, clubs, exams, settings } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !certificate) return null;

  const student = students.find(s => s.id === certificate.studentId);
  const club = student ? clubs.find(c => c.id === student.clubId) : null;
  const exam = exams.find(e => e.id === certificate.examId);
  const beltCfg = getBeltConfig(certificate.beltConferred);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const filename = `Van_Bang_${certificate.certNumber}_${student?.fullName || 'PQQ'}.pdf`;
    await pdfService.exportElementToPdf('certificate-printable-canvas', filename, 'landscape');
    setIsExporting(false);
  };

  const handlePrint = () => {
    pdfService.printElement('certificate-printable-canvas');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Control Bar */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-slate-950 text-white flex items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-sm truncate block">Văn Bằng Thăng Đai</span>
              <span className="font-mono text-[10px] sm:text-xs text-blue-400 truncate block">({certificate.certNumber})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In nhanh</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Đang tạo...' : 'Tải PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area (A4 Landscape aspect ratio: 297mm x 210mm) */}
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto bg-slate-100 flex justify-center">
          <div
            id="certificate-printable-canvas"
            className="w-full max-w-[280mm] bg-[#fffdf7] text-slate-900 shadow-2xl relative p-8 sm:p-12 font-serif select-none"
            style={{
              aspectRatio: '297 / 210',
              border: '12px double #b45309',
              boxShadow: 'inset 0 0 0 3px #fef3c7, 0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Inner Golden Border */}
            <div className="w-full h-full border-2 border-amber-600/80 p-6 flex flex-col justify-between relative">
              {/* Corner decorative flourishes */}
              <div className="absolute top-2 left-2 text-amber-700 text-xl font-bold">&#10041;</div>
              <div className="absolute top-2 right-2 text-amber-700 text-xl font-bold">&#10041;</div>
              <div className="absolute bottom-2 left-2 text-amber-700 text-xl font-bold">&#10041;</div>
              <div className="absolute bottom-2 right-2 text-amber-700 text-xl font-bold">&#10041;</div>

              {/* Watermark Lotus Logo in background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <Award className="w-96 h-96 text-amber-900" />
              </div>

              {/* Header Section */}
              <div className="text-center space-y-1">
                <div className="text-xs uppercase tracking-widest text-slate-600 font-sans font-bold">
                  HỘI ĐỒNG CHƯỞNG QUẢN &bull; BAN CHUYÊN MÔN
                </div>
                <h2 className="text-lg sm:text-xl uppercase font-black tracking-wider text-amber-900">
                  MÔN PHÁI PHẬT QUANG QUYỀN
                </h2>
                <div className="text-xs italic text-amber-800 tracking-wide font-sans">
                  &ldquo;Bản Thể Tự Tại - Võ Đạo Viên Minh&rdquo;
                </div>

                <div className="w-24 h-0.5 bg-amber-600 mx-auto mt-2 mb-2" />

                <h1 className="text-2xl sm:text-4xl uppercase font-black tracking-tight text-amber-950 font-serif pt-2">
                  VĂN BẰNG THĂNG ĐAI
                </h1>
                <p className="text-xs text-slate-500 font-sans uppercase tracking-widest">
                  GIẤY CHỨNG NHẬN CẤP ĐAI MÔN PHÁI
                </p>
              </div>

              {/* Main Body */}
              <div className="my-auto text-center space-y-3 font-sans">
                <p className="text-sm text-slate-700">
                  Hội đồng Ban Chuyên Môn Môn Phái Phật Quang Quyền chứng nhận:
                </p>

                {/* Candidate Name in Calligraphic prominence */}
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wide font-serif">
                    {student?.fullName}
                  </div>
                  {student?.dharmaName && (
                    <div className="text-sm font-bold text-amber-800 mt-0.5">
                      Pháp danh: {student.dharmaName}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
                  <span>Mã võ sinh: <strong className="font-mono text-slate-900">{student?.code}</strong></span>
                  <span>&bull;</span>
                  <span>Sinh ngày: <strong>{formatDateVN(student?.dob)}</strong></span>
                  <span>&bull;</span>
                  <span>Đơn vị: <strong>{club?.name}</strong></span>
                </div>

                <p className="text-xs text-slate-700 max-w-xl mx-auto pt-1">
                  Đã hoàn thành xuất sắc các nội dung kiểm tra quyền thuật, binh khí, thể lực, đối kháng và lý thuyết võ đạo tại:
                  <strong className="block text-slate-900 font-semibold mt-0.5">{exam?.name || 'Kỳ thi thăng đai'}</strong>
                </p>

                {/* Conferred Belt Badge */}
                <div className="pt-2 flex flex-col items-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    CÔNG NHẬN THĂNG CẤP ĐAI:
                  </div>
                  <div
                    className="px-6 py-2 rounded-full font-black text-sm sm:text-base tracking-wider uppercase shadow-md flex items-center gap-2"
                    style={{ backgroundColor: beltCfg.bgHex, color: beltCfg.textHex }}
                  >
                    <Award className="w-5 h-5" />
                    <span>{beltCfg.name} - CẤP {certificate.beltLevel}</span>
                  </div>
                </div>
              </div>

              {/* Footer Section: Cert numbers, Date, Signatures & Red Seal */}
              <div className="pt-4 grid grid-cols-3 items-end text-xs font-sans">
                {/* Left: Cert numbers & Decision */}
                <div className="space-y-1 text-slate-600">
                  <div>Số hiệu bằng: <strong className="font-mono text-slate-900">{certificate.certNumber}</strong></div>
                  <div>Quyết định số: <strong className="text-slate-900">{certificate.decisionNumber}</strong></div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Mã xác thực: {certificate.qrCode || certificate.certNumber}
                  </div>
                </div>

                {/* Center: Red Stamp / Seal */}
                <div className="flex justify-center">
                  <div className="cert-seal">
                    <div className="text-center text-[9px] leading-tight">
                      MÔN PHÁI<br />
                      <strong className="text-[10px]">PHẬT QUANG</strong><br />
                      QUYỀN &bull; ẤN
                    </div>
                  </div>
                </div>

                {/* Right: Signer Block */}
                <div className="text-center space-y-1">
                  <div className="text-[11px] text-slate-600 italic">
                    Núi Dinh, ngày {formatDateVN(certificate.issueDate)}
                  </div>
                  <div className="font-bold text-slate-900 uppercase">
                    {certificate.signerTitle || 'TRƯỞNG BAN CHUYÊN MÔN'}
                  </div>
                  <div className="h-14" />
                  <div className="font-bold text-slate-900 text-sm font-serif">
                    {certificate.signerName || 'Võ sư Thích Tâm Thiện'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
