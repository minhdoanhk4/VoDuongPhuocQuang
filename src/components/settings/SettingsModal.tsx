import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { googleSheetService } from '../../services/googleSheetService';
import { storageService } from '../../services/storageService';
import codeGsSource from '../../../google-apps-script/Code.gs?raw';
import {
  X,
  Cloud,
  Copy,
  Check,
  RefreshCw,
  Download,
  Upload,
  ExternalLink,
  Database,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Eye,
  EyeOff
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, syncToGoogleSheet, pullFromGoogleSheet, resetToSampleData, addToast } = useApp();

  const [scriptUrl, setScriptUrl] = useState(settings.googleSheetScriptUrl || '');
  const [secretToken, setSecretToken] = useState(settings.secretToken || 'PQQ_SECRET_2026');
  const [showSecretToken, setShowSecretToken] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ scriptUrl?: string; secretToken?: string }>({});

  const [isCopied, setIsCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'backup'>('connection');

  if (!isOpen) return null;

  const userSheetUrl = settings.googleSheetUrl || 'https://docs.google.com/spreadsheets/d/1GzC6WywESgThVzUQCfAcsbDsvYoeHjvIPpM6QUlO42s/edit?usp=sharing';

  const validateInputs = (): boolean => {
    const errs: { scriptUrl?: string; secretToken?: string } = {};
    if (!scriptUrl.trim()) {
      errs.scriptUrl = 'URL Web App không được để trống (bắt buộc)';
    } else if (!scriptUrl.trim().startsWith('https://script.google.com/')) {
      errs.scriptUrl = 'URL không đúng định dạng Google Apps Script (bắt đầu bằng https://script.google.com/...)';
    }

    if (!secretToken.trim()) {
      errs.secretToken = 'Mã bảo mật (Secret Token) không được để trống';
    }

    setValidationErrors(errs);
    if (Object.keys(errs).length > 0) {
      addToast('Vui lòng kiểm tra lại thông tin ô nhập liệu bắt buộc!', 'warning', 'Nhập liệu không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateInputs()) return;
    updateSettings({
      googleSheetScriptUrl: scriptUrl.trim(),
      secretToken: secretToken.trim()
    });
    addToast('Đã lưu cấu hình kết nối Google Sheet thành công!', 'success', 'Cài đặt hệ thống');
  };

  const handleTestConnection = async () => {
    if (!validateInputs()) return;

    setIsTesting(true);
    const res = await googleSheetService.testConnection(scriptUrl.trim(), secretToken.trim());
    setIsTesting(false);

    if (res.success) {
      updateSettings({
        googleSheetScriptUrl: scriptUrl.trim(),
        secretToken: secretToken.trim()
      });
      addToast('Kết nối Google Apps Script thành công! Hệ thống sẵn sàng đồng bộ 2 chiều.', 'success', 'Kết nối thành công');
    } else {
      addToast(res.error || 'Không thể kết nối. Vui lòng kiểm tra lại URL hoặc quyền Web App.', 'error', 'Lỗi kết nối');
    }
  };

  const handleCopyScript = () => {
    try {
      navigator.clipboard.writeText(codeGsSource);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
      addToast('Đã sao chép toàn bộ mã nguồn Code.gs vào bộ nhớ tạm!', 'success', 'Sao chép thành công');
    } catch {
      addToast('Không thể sao chép tự động, vui lòng mở file Code.gs', 'error', 'Lỗi bộ nhớ tạm');
    }
  };

  const handleExportBackup = () => {
    const dataStr = storageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PQQ_SaoLuu_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Đã tải tệp sao lưu dữ liệu JSON về máy an toàn!', 'success', 'Sao lưu thành công');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = storageService.importAllData(content);
        if (success) {
          window.location.reload();
        } else {
          addToast('Tệp sao lưu không hợp lệ hoặc cấu trúc dữ liệu bị sai lệch!', 'error', 'Lỗi phục hồi dữ liệu');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Samsung One UI Solid Blue */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0072de] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Cài Đặt Hệ Thống &amp; Sao Lưu Dữ Liệu</h3>
              <p className="text-xs text-blue-100 font-light">Hệ Thống Quản Trị PQSM &bull; Phật Quang Quyền</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50 text-xs font-bold text-slate-600 gap-4 sm:gap-6">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'connection'
                ? 'border-[#0072de] text-[#0072de]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Kết Nối Google Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-[#0072de] text-[#0072de]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Sao Lưu File JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* TAB 1: KẾT NỐI GOOGLE SHEET */}
          {activeTab === 'connection' && (
            <div className="space-y-4">
              {/* Linked Sheet Card */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/60 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#0072de] block">Trang Tính Google Sheet Của Bạn:</span>
                  <span className="text-[11px] font-mono text-slate-500 truncate block">
                    ID: 1GzC6WywESgThVzUQCfAcsbDsvYoeHjvIPpM6QUlO42s
                  </span>
                </div>
                <a
                  href={userSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
                >
                  <span>Mở Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* URL Web App */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    URL Ứng Dụng Web (Google Apps Script Web App URL)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">Bắt buộc</span>
                </div>
                <input
                  type="url"
                  value={scriptUrl}
                  onChange={e => {
                    setScriptUrl(e.target.value);
                    if (validationErrors.scriptUrl) {
                      setValidationErrors(prev => ({ ...prev, scriptUrl: undefined }));
                    }
                  }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 transition-colors ${
                    validationErrors.scriptUrl
                      ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/20 focus:border-[#0072de]'
                  } placeholder:text-slate-400`}
                />
                {validationErrors.scriptUrl && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                    <span>&bull;</span> {validationErrors.scriptUrl}
                  </p>
                )}
              </div>

              {/* Secret Token */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Mã Bí Mật Bảo Mật (Secret Token)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">Bắt buộc</span>
                </div>
                <div className="relative">
                  <input
                    type={showSecretToken ? 'text' : 'password'}
                    value={secretToken}
                    onChange={e => {
                      setSecretToken(e.target.value);
                      if (validationErrors.secretToken) {
                        setValidationErrors(prev => ({ ...prev, secretToken: undefined }));
                      }
                    }}
                    placeholder="PQQ_SECRET_2026"
                    className={`w-full pl-3.5 pr-10 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.secretToken
                        ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/20 focus:border-[#0072de]'
                    } tracking-wider`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretToken(!showSecretToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                    title={showSecretToken ? 'Ẩn mã bí mật' : 'Hiện mã bí mật'}
                  >
                    {showSecretToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {validationErrors.secretToken && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                    <span>&bull;</span> {validationErrors.secretToken}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-2xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-70 active:scale-98"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm Tra & Lưu'}</span>
                </button>

                <button
                  type="button"
                  onClick={syncToGoogleSheet}
                  className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0072de]" />
                  <span>Đẩy Lên Sheet (Sync)</span>
                </button>

                <button
                  type="button"
                  onClick={pullFromGoogleSheet}
                  className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tải Về Từ Sheet (Pull)</span>
                </button>
              </div>

              {/* Hướng dẫn cài đặt tinh giản (Collapsible 3 bước) */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-[#0072de] py-2 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileCode2 className="w-4 h-4 text-[#0072de]" />
                    <span>Hướng dẫn cài đặt Google Apps Script (3 bước)</span>
                  </span>
                  {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showGuide && (
                  <div className="mt-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5 text-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-800">Mã nguồn đồng bộ:</span>
                      <button
                        onClick={handleCopyScript}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Đã chép!' : 'Sao chép Code.gs'}</span>
                      </button>
                    </div>

                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed text-[11.5px]">
                      <li>
                        Vào Google Sheet &rarr; chọn <strong>Tiện ích mở rộng &gt; Apps Script</strong>.
                      </li>
                      <li>
                        Xóa nội dung cũ trong <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">Code.gs</code>, dán mã vừa sao chép vào rồi bấm <strong>Lưu (Ctrl+S)</strong>.
                      </li>
                      <li>
                        Bấm <strong>Triển khai (Deploy) &gt; Tùy chọn triển khai mới</strong> &rarr; Chọn <strong>Ứng dụng web</strong> (Quyền truy cập: <em>Bất kỳ ai</em>) &rarr; Sao chép link URL dán vào ô phía trên.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SAO LƯU DỮ LIỆU FILE JSON */}
          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Sao Lưu &amp; Khôi Phục File Cục Bộ</h4>
                  <p className="text-slate-500 text-[11.5px] mt-0.5 leading-relaxed">
                    Tải toàn bộ dữ liệu (CLB, võ sinh, kỳ thi, văn bằng) về máy tính để lưu trữ dự phòng ngoại tuyến.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="px-4 py-2 rounded-2xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải File Sao Lưu (.json)</span>
                  </button>

                  <label className="px-4 py-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#0072de]" />
                    <span>Nạp Lại Từ File (.json)</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-rose-900">Đặt Lại Dữ Liệu Mẫu PQQ</h4>
                  <p className="text-rose-700 text-[11px] mt-0.5">
                    Khôi phục lại danh sách 5 CLB chuẩn và các võ sinh mẫu của Môn phái.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn đặt lại dữ liệu mẫu gốc?')) {
                      resetToSampleData();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Nạp Dữ Liệu Mẫu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">PQSM Storage &bull; 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
