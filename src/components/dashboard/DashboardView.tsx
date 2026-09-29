import React from 'react';
import { useApp } from '../../context/AppContext';
import { BELT_ORDER, getBeltBadgeStyle, getBeltConfig } from '../../utils/beltColors';
import { formatDateVN } from '../../utils/formatters';
import { Users, Building2, Calendar, Award, ChevronRight, UserPlus, FilePlus, Sparkles, ArrowUpRight } from 'lucide-react';
import { ActiveTab } from '../layout/NavigationTabs';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddStudent: () => void;
  onOpenAddExam: () => void;
  onViewCertificate: (certId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddStudent,
  onOpenAddExam,
  onViewCertificate
}) => {
  const { students, clubs, exams, certificates, selectedClubFilter } = useApp();

  const filteredStudents = selectedClubFilter === 'ALL'
    ? students
    : students.filter(s => s.clubId === selectedClubFilter);

  // Thống kê võ sinh theo 5 cấp đai
  const beltStats = BELT_ORDER.map(belt => {
    const config = getBeltConfig(belt);
    const count = filteredStudents.filter(s => s.currentBelt === belt).length;
    const percentage = filteredStudents.length > 0
      ? Math.round((count / filteredStudents.length) * 100)
      : 0;
    return {
      belt,
      config,
      count,
      percentage
    };
  });

  const upcomingExams = exams.filter(e => e.status !== 'COMPLETED');
  const recentCertificates = certificates.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0072de] text-white p-6 sm:p-8 shadow-md shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-blue-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            Môn Phái Phật Quang Quyền &bull; Quản Trị Nội Bộ
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Võ Đạo Tu Tâm &bull; Thăng Đai Viên Minh
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100 font-light leading-relaxed">
            Hệ thống quản lý chuẩn hóa võ sinh, tổ chức chấm thi thăng đai các cấp và cấp phát văn bằng chứng nhận trang trọng theo truyền thống Môn phái.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0072de] font-bold text-xs shadow-sm hover:bg-blue-50 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#0072de]" />
              <span>Thêm Võ Sinh Mới</span>
            </button>
            <button
              onClick={onOpenAddExam}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Tạo Kỳ Thi Mới</span>
            </button>
            <button
              onClick={() => onNavigate('hierarchy')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <span>Xem Cây Phân Cấp Đai</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <Award className="w-72 h-72 text-white transform rotate-12 translate-x-12" />
        </div>
      </div>

      {/* Counter metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Võ Sinh</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{filteredStudents.length}</span>
            <span className="text-xs text-slate-500">người</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
            <span>Xem danh sách</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('clubs')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Câu Lạc Bộ</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{clubs.length}</span>
            <span className="text-xs text-slate-500">phân nhánh</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
            <span>Quản lý CLB</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('exams')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kỳ Thi Thăng Đai</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0072de] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{exams.length}</span>
            <span className="text-xs text-slate-500">đợt thi</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-[#0072de] font-medium">
            <span>Chấm thi & Phiếu điểm</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('certificates')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Văn Bằng Đã Cấp</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{certificates.length}</span>
            <span className="text-xs text-slate-500">chứng nhận</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-purple-600 font-medium">
            <span>Xem & Tải PDF</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* 5 Belt Ranks Hierarchy Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Phân Bố Cấp Đai Môn Phái (5 Bậc Đai)
            </h3>
            <p className="text-xs text-slate-500">
              Cơ cấu tỷ lệ võ sinh theo lộ trình: Lam Đai &rarr; Lục Đai &rarr; Hồng Đai &rarr; Hoàng Đai &rarr; Bạch Đai
            </p>
          </div>
          <button
            onClick={() => onNavigate('hierarchy')}
            className="text-xs font-bold text-[#0072de] hover:text-[#0060bd] flex items-center gap-1 cursor-pointer"
          >
            <span>Chi tiết cây phân cấp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {beltStats.map(({ belt, config, count, percentage }) => {
            const style = getBeltBadgeStyle(belt);
            return (
              <div
                key={belt}
                onClick={() => onNavigate('hierarchy')}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
              >
                {/* Belt color top strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: config.bgHex }}
                />

                <div className="flex items-center justify-between mb-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: config.bgHex, color: config.textHex }}
                  >
                    {config.name}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Bậc {config.order}</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{count}</span>
                  <span className="text-xs font-semibold text-slate-500">{percentage}%</span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: config.bgHex
                    }}
                  />
                </div>

                <p className="mt-2.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {config.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Upcoming Exams & Recent Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0072de]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Kỳ Thi Thăng Đai Gần Nhất</h3>
                  <p className="text-xs text-slate-500">Các đợt thi đang diễn ra hoặc sắp tổ chức</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="text-xs font-semibold text-[#0072de] hover:text-[#0060bd] cursor-pointer"
              >
                Tất cả ({exams.length})
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExams.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                  Chưa có kỳ thi sắp tới. Bạn có thể tạo đợt thi mới.
                </div>
              ) : (
                upcomingExams.map(exam => (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{exam.name}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-[#0072de] shrink-0">
                        {exam.sessionCode}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>Ngày thi: <strong className="text-slate-700">{formatDateVN(exam.examDate)}</strong></span>
                      <span>Địa điểm: <strong className="text-slate-700">{exam.location}</strong></span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-600 font-medium">
                        Thí sinh đăng ký: <strong>{exam.totalCandidates || 0}</strong>
                      </span>
                      <button
                        onClick={() => onNavigate('exams')}
                        className="text-xs font-bold text-[#0072de] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Chấm thi <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onOpenAddExam}
              className="w-full py-2.5 px-3 rounded-xl border border-blue-200 text-[#0072de] bg-blue-50 hover:bg-blue-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FilePlus className="w-4 h-4 text-[#0072de]" />
              <span>Đăng Ký Khóa Thi Thăng Đai Mới</span>
            </button>
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Văn Bằng Mới Cấp</h3>
                  <p className="text-xs text-slate-500">Giấy chứng nhận thăng đai đã phát hành</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('certificates')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800"
              >
                Tất cả ({certificates.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {recentCertificates.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                  Chưa có văn bằng nào được phát hành.
                </div>
              ) : (
                recentCertificates.map(cert => {
                  const student = students.find(s => s.id === cert.studentId);
                  const beltConfig = getBeltConfig(cert.beltConferred);
                  return (
                    <div
                      key={cert.id}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {student?.fullName || 'Võ sinh'}
                          </span>
                          {student?.dharmaName && (
                            <span className="text-[10px] text-[#0072de] font-medium px-1.5 py-0.5 rounded-full bg-blue-50">
                              PD: {student.dharmaName}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                          <span
                            className="font-bold text-[10px] px-1.5 py-0.2 rounded"
                            style={{ backgroundColor: beltConfig.bgHex, color: beltConfig.textHex }}
                          >
                            {beltConfig.name} Cấp {cert.beltLevel}
                          </span>
                          <span>Số: <strong className="text-slate-700">{cert.certNumber}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewCertificate(cert.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs shrink-0 flex items-center gap-1 transition-colors"
                      >
                        <span>Xem & In</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('certificates')}
              className="w-full py-2.5 px-3 rounded-xl border border-purple-200 text-purple-800 bg-purple-50 hover:bg-purple-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Award className="w-4 h-4 text-purple-600" />
              <span>Quản Lý & Xuất Toàn Bộ Văn Bằng PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
