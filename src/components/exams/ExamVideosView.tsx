import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VideoSubmission, VideoExamResult } from '../../types';
import { getBeltConfig } from '../../utils/beltColors';
import { formatDateVN } from '../../utils/formatters';
import { VideoGradingModal } from './VideoGradingModal';
import { VideoSubmitModal } from './VideoSubmitModal';
import {
  Video,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  Building2,
  ExternalLink,
  Trash2,
  UserCheck,
  Scale
} from 'lucide-react';

interface ExamVideosViewProps {
  initialClubId?: string;
  onNavigateToCertificates?: () => void;
}

export const ExamVideosView: React.FC<ExamVideosViewProps> = ({
  initialClubId = 'ALL',
  onNavigateToCertificates
}) => {
  const { videos, clubs, students, deleteVideoSubmission } = useApp();

  const [selectedClubId, setSelectedClubId] = useState<string>(initialClubId);
  const [statusFilter, setStatusFilter] = useState<'ALL' | VideoExamResult>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [videoToGrade, setVideoToGrade] = useState<VideoSubmission | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Sync initialClubId prop
  React.useEffect(() => {
    if (initialClubId) setSelectedClubId(initialClubId);
  }, [initialClubId]);

  // Lọc danh sách video
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      if (selectedClubId !== 'ALL' && v.clubId !== selectedClubId) return false;
      if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = v.studentName.toLowerCase().includes(term);
        const matchContent = v.content.toLowerCase().includes(term);
        const matchJudge = v.reviewerName ? v.reviewerName.toLowerCase().includes(term) : false;
        const matchNote = v.judgeNote ? v.judgeNote.toLowerCase().includes(term) : false;
        return matchName || matchContent || matchJudge || matchNote;
      }
      return true;
    });
  }, [videos, selectedClubId, statusFilter, searchTerm]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const relevant = selectedClubId === 'ALL' ? videos : videos.filter(v => v.clubId === selectedClubId);
    return {
      total: relevant.length,
      passed: relevant.filter(v => v.status === 'PASS').length,
      pending: relevant.filter(v => v.status === 'PENDING').length,
      failed: relevant.filter(v => v.status === 'FAIL').length
    };
  }, [videos, selectedClubId]);

  const handleDelete = (v: VideoSubmission) => {
    if (window.confirm(`Xóa video bài thi của võ sinh ${v.studentName}?`)) {
      deleteVideoSubmission(v.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats - Samsung One UI Solid Minimalist Style */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0072de]">
                Hội Đồng Ban Giám Khảo
              </span>
              <span className="text-xs text-slate-500 font-medium">
                &bull; Quản lý Video Nộp Bài Thi &amp; Chấm Điểm Đạt / Không Đạt
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Video Bài Thi Thăng Đai &bull; Chấm Tuyển Từ Xa
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0072de] hover:bg-[#0060bd] text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nộp Video Bài Thi Mới</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tổng Video
              </span>
              <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0072de] flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Đã Chấm Đạt
              </span>
              <span className="text-2xl font-black text-emerald-900">{stats.passed}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#0072de] uppercase tracking-wider block">
                Chờ Chấm
              </span>
              <span className="text-2xl font-black text-[#0072de]">{stats.pending}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0072de] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                Cần Rèn Thêm
              </span>
              <span className="text-2xl font-black text-rose-900">{stats.failed}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar: Select Club & Status Tabs & Search */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Club Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold shrink-0 mr-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> CLB:
              </span>
              <button
                onClick={() => setSelectedClubId('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedClubId === 'ALL'
                    ? 'bg-[#0072de] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả 5 CLB
              </button>
              {clubs.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClubId(c.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer truncate max-w-[140px] ${
                    selectedClubId === c.id
                      ? 'bg-[#0072de] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={c.name}
                >
                  {c.name.replace('CLB ', '')}
                </button>
              ))}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0 font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'PENDING' ? 'bg-white text-[#0072de] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Chờ chấm ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter('PASS')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'PASS' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đạt ({stats.passed})
              </button>
              <button
                onClick={() => setStatusFilter('FAIL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'FAIL' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Chưa đạt ({stats.failed})
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm video theo tên võ sinh, bài quyền, giám khảo chấm, nhận xét..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0072de] bg-slate-50/50 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Video Submissions Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <Video className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="text-sm font-bold text-slate-600">Chưa có video bài thi nào trong bộ lọc này.</p>
          <p className="text-xs text-slate-400">
            Bấm &ldquo;Nộp Video Bài Thi Mới&rdquo; ở trên để gửi link video của võ sinh.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map(vid => {
            const student = students.find(s => s.id === vid.studentId);
            const club = clubs.find(c => c.id === vid.clubId);
            const targetBeltCfg = getBeltConfig(vid.targetBelt);

            return (
              <div
                key={vid.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-[#0072de]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 text-xs"
              >
                {/* Header: Student Name & Target Belt */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {vid.studentName}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {club?.name || 'CLB'}
                      </span>
                    </div>

                    {/* Result Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${
                        vid.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : vid.status === 'PENDING'
                            ? 'bg-blue-50 text-[#0072de] border-blue-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {vid.status === 'PASS'
                        ? '✅ ĐẠT'
                        : vid.status === 'PENDING'
                          ? '⏳ CHỜ CHẤM'
                          : '❌ CHƯA ĐẠT'}
                    </span>
                  </div>

                  {/* Target Belt & Content */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Đăng Ký Thi Lên:
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-2xs"
                        style={{ backgroundColor: targetBeltCfg.bgHex, color: targetBeltCfg.textHex }}
                      >
                        {targetBeltCfg.name} {vid.targetBeltLevel}
                      </span>
                    </div>
                    <div className="text-slate-900 font-bold text-xs truncate" title={vid.content}>
                      {vid.content}
                    </div>
                  </div>
                </div>

                {/* Judge's Note Box */}
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Ngày nộp: {formatDateVN(vid.submittedAt)}</span>
                    {vid.reviewerName && (
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#0072de]" />
                        <span>{vid.reviewerName}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 italic text-[11px] leading-relaxed line-clamp-2">
                    &ldquo;{vid.judgeNote || 'Chờ Giám khảo chấm điểm...'}&rdquo;
                  </p>
                </div>

                {/* Actions: Watch Video & Grade Video */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={vid.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-slate-700" />
                    <span>Xem Video</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setVideoToGrade(vid)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0072de] hover:bg-[#0060bd] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Chấm Điểm</span>
                    </button>
                    <button
                      onClick={() => handleDelete(vid)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <VideoGradingModal
        isOpen={!!videoToGrade}
        onClose={() => setVideoToGrade(null)}
        video={videoToGrade}
      />

      <VideoSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        defaultClubId={selectedClubId !== 'ALL' ? selectedClubId : undefined}
      />
    </div>
  );
};
