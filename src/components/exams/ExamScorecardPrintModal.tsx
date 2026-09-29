import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamSheet } from '../../types';
import { getBeltConfig } from '../../utils/beltColors';
import { formatDateVN, getResultBadge } from '../../utils/formatters';
import { pdfService } from '../../services/pdfService';
import { X, Download, Printer, Award } from 'lucide-react';

interface ExamScorecardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  examSheet: ExamSheet | null;
}

export const ExamScorecardPrintModal: React.FC<ExamScorecardPrintModalProps> = ({
  isOpen,
  onClose,
  examSheet
}) => {
  const { students, exams, clubs } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !examSheet) return null;

  const student = students.find(s => s.id === examSheet.studentId);
  const exam = exams.find(e => e.id === examSheet.examId);
  const club = student ? clubs.find(c => c.id === student.clubId) : null;
  const currentBeltCfg = student ? getBeltConfig(student.currentBelt) : null;
  const targetBeltCfg = getBeltConfig(examSheet.targetBelt);
  const resultBadge = getResultBadge(examSheet.result);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const filename = `Phieu_Thi_${student?.code || 'PQQ'}_${exam?.sessionCode || ''}.pdf`;
    await pdfService.exportElementToPdf('exam-scorecard-printable-area', filename, 'portrait');
    setIsExporting(false);
  };

  const handlePrint = () => {
    pdfService.printElement('exam-scorecard-printable-area');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Controls Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">Xem & Xuất Phiếu Dự Thi / Bảng Điểm</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In nhanh</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Đang tạo PDF...' : 'Tải File PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Scorecard Content (A4 Portrait format) */}
        <div className="p-6 max-h-[80vh] overflow-y-auto bg-slate-50 flex justify-center">
          <div
            id="exam-scorecard-printable-area"
            className="w-full max-w-[210mm] bg-white p-8 sm:p-10 shadow-md border border-slate-300 text-slate-900 font-sans"
            style={{ minHeight: '270mm' }}
          >
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <div className="text-xs uppercase tracking-widest font-black text-amber-800">
                MÔN PHÁI PHẬT QUANG QUYỀN
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                HỘI ĐỒNG BAN CHUYÊN MÔN &bull; BAN GIẢNG HUẤN
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mt-3">
                PHIẾU DỰ THI & CHẤM ĐIỂM THĂNG ĐAI
              </h1>
              <p className="text-xs font-medium text-slate-600 mt-1">
                {exam?.name} &bull; Mã: <strong className="font-mono">{exam?.sessionCode}</strong>
              </p>
            </div>

            {/* Candidate & Exam Metadata */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-500">Họ và tên thí sinh:</span>{' '}
                  <strong className="text-sm font-black text-slate-900">{student?.fullName}</strong>
                </div>
                {student?.dharmaName && (
                  <div>
                    <span className="text-slate-500">Pháp danh:</span>{' '}
                    <strong className="text-amber-800 font-bold">{student.dharmaName}</strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Mã võ sinh:</span>{' '}
                  <strong className="font-mono">{student?.code}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Ngày sinh:</span>{' '}
                  <span>{formatDateVN(student?.dob)}</span> &bull; Giới tính: <strong>{student?.gender}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Câu lạc bộ:</span>{' '}
                  <strong className="text-slate-800">{club?.name}</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <div>
                  <span className="text-slate-500">Ngày thi:</span>{' '}
                  <strong>{formatDateVN(exam?.examDate)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Địa điểm:</span>{' '}
                  <span>{exam?.location}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 text-[11px] block">Cấp đai hiện tại:</span>
                  <span className="font-bold text-slate-700">
                    {currentBeltCfg?.name} - Cấp {student?.currentBeltLevel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">ĐĂNG KÝ THI LÊN:</span>
                  <span
                    className="inline-block px-3 py-0.5 rounded-full text-xs font-black text-white shadow-2xs mt-0.5"
                    style={{ backgroundColor: targetBeltCfg.bgHex, color: targetBeltCfg.textHex }}
                  >
                    {targetBeltCfg.name} - Cấp {examSheet.targetBeltLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Scorecard Table */}
            <div className="mt-6">
              <table className="w-full border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-center font-bold">
                    <th className="border border-slate-400 py-2 px-2 w-10">STT</th>
                    <th className="border border-slate-400 py-2 px-3 text-left">Nội Dung Kiểm Tra Thăng Đai</th>
                    <th className="border border-slate-400 py-2 px-2 w-24">Thang Điểm</th>
                    <th className="border border-slate-400 py-2 px-2 w-28">Điểm Đạt Được</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-400 py-2.5 text-center font-bold">1</td>
                    <td className="border border-slate-400 py-2.5 px-3">
                      <strong>Căn bản quyền pháp & Tấn pháp</strong>
                      <p className="text-[10px] text-slate-500">Độ chuẩn xác các thế tấn, thủ pháp, cước pháp căn bản</p>
                    </td>
                    <td className="border border-slate-400 py-2.5 text-center">10.0</td>
                    <td className="border border-slate-400 py-2.5 text-center font-black text-sm">
                      {(examSheet.scoreCanBan ?? 0) > 0 ? (examSheet.scoreCanBan ?? 0).toFixed(1) : '---'}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-slate-400 py-2.5 text-center font-bold">2</td>
                    <td className="border border-slate-400 py-2.5 px-3">
                      <strong>Bài quyền quy định</strong>
                      <p className="text-[10px] text-slate-500">Nhịp điệu, thần thái, độ liên kết và lực đạo bài quyền</p>
                    </td>
                    <td className="border border-slate-400 py-2.5 text-center">10.0</td>
                    <td className="border border-slate-400 py-2.5 text-center font-black text-sm">
                      {(examSheet.scoreBaiQuyen ?? 0) > 0 ? (examSheet.scoreBaiQuyen ?? 0).toFixed(1) : '---'}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-slate-400 py-2.5 text-center font-bold">3</td>
                    <td className="border border-slate-400 py-2.5 px-3">
                      <strong>Binh khí (Đoản côn, Kiếm, Đao...)</strong>
                      <p className="text-[10px] text-slate-500">Kỹ thuật sử dụng binh khí theo cấp đai quy định</p>
                    </td>
                    <td className="border border-slate-400 py-2.5 text-center">10.0</td>
                    <td className="border border-slate-400 py-2.5 text-center font-black text-sm">
                      {(examSheet.scoreBinhKhi ?? 0) > 0 ? (examSheet.scoreBinhKhi ?? 0).toFixed(1) : '---'}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-slate-400 py-2.5 text-center font-bold">4</td>
                    <td className="border border-slate-400 py-2.5 px-3">
                      <strong>Thể lực & Công phá</strong>
                      <p className="text-[10px] text-slate-500">Hít đất, nhảy tấn, độ dẻo dai và sức bền cơ thể</p>
                    </td>
                    <td className="border border-slate-400 py-2.5 text-center">10.0</td>
                    <td className="border border-slate-400 py-2.5 text-center font-black text-sm">
                      {(examSheet.scoreTheLuc ?? 0) > 0 ? (examSheet.scoreTheLuc ?? 0).toFixed(1) : '---'}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-slate-400 py-2.5 text-center font-bold">5</td>
                    <td className="border border-slate-400 py-2.5 px-3">
                      <strong>Song đấu & Phân thế đối kháng</strong>
                      <p className="text-[10px] text-slate-500">Khả năng tự vệ, cản gạt, phản xạ đòn và tinh thần thượng võ</p>
                    </td>
                    <td className="border border-slate-400 py-2.5 text-center">10.0</td>
                    <td className="border border-slate-400 py-2.5 text-center font-black text-sm">
                      {(examSheet.scoreDoiKhang ?? 0) > 0 ? (examSheet.scoreDoiKhang ?? 0).toFixed(1) : '---'}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-slate-400 py-2.5 text-center font-bold">6</td>
                    <td className="border border-slate-400 py-2.5 px-3">
                      <strong>Lý thuyết võ đạo & Tinh thần phụng sự</strong>
                      <p className="text-[10px] text-slate-500">Hiểu biết về tôn chỉ Phật Quang Quyền, đạo nghĩa môn phái</p>
                    </td>
                    <td className="border border-slate-400 py-2.5 text-center">10.0</td>
                    <td className="border border-slate-400 py-2.5 text-center font-black text-sm">
                      {(examSheet.scoreLyThuyet ?? 0) > 0 ? (examSheet.scoreLyThuyet ?? 0).toFixed(1) : '---'}
                    </td>
                  </tr>

                  {/* Summary Rows */}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className="border border-slate-400 py-2 px-3 text-right">
                      TỔNG ĐIỂM (Thang 60):
                    </td>
                    <td colSpan={2} className="border border-slate-400 py-2 px-3 text-center text-sm font-black">
                      {(examSheet.totalScore ?? 0) > 0 ? (examSheet.totalScore ?? 0).toFixed(1) : '---'} / 60
                    </td>
                  </tr>

                  <tr className="bg-amber-50 font-black">
                    <td colSpan={2} className="border border-slate-400 py-2.5 px-3 text-right text-amber-900">
                      ĐIỂM TRUNG BÌNH (Thang 10):
                    </td>
                    <td colSpan={2} className="border border-slate-400 py-2.5 px-3 text-center text-base text-amber-900">
                      {(examSheet.averageScore ?? 0) > 0 ? `${(examSheet.averageScore ?? 0).toFixed(1)} / 10` : '---'}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="border border-slate-400 py-2.5 px-3 text-right font-black uppercase">
                      KẾT LUẬN HỘI ĐỒNG:
                    </td>
                    <td colSpan={2} className="border border-slate-400 py-2.5 px-3 text-center font-black text-sm">
                      <span className={`px-3 py-1 rounded-md border inline-block ${resultBadge.className}`}>
                        {resultBadge.label}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {examSheet.notes && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <strong>Nhận xét:</strong> {examSheet.notes}
              </div>
            )}

            {/* Signature Block */}
            <div className="mt-10 grid grid-cols-2 text-center text-xs">
              <div>
                <div className="font-bold text-slate-800 uppercase">GIÁM KHẢO CHẤM ĐIỂM</div>
                <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</div>
                <div className="h-20" />
                <div className="font-bold text-slate-800">
                  {examSheet.examiners || 'Hội đồng Giám khảo'}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-800 uppercase">TRƯỞNG BAN CHUYÊN MÔN</div>
                <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký duyệt và đóng dấu)</div>
                <div className="h-20" />
                <div className="font-bold text-slate-800">
                  Võ sư Thích Tâm Thiện
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
