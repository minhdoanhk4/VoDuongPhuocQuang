import React from 'react';
import { useApp, ToastMessage } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getToastConfig = (type: ToastMessage['type']) => {
  switch (type) {
    case 'success':
      return {
        defaultTitle: 'Thành công',
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/70',
        progressBar: 'bg-emerald-500',
        borderColor: 'border-emerald-200/80'
      };
    case 'warning':
      return {
        defaultTitle: 'Cảnh báo',
        icon: AlertTriangle,
        iconBg: 'bg-amber-50 text-amber-600 border-amber-200/70',
        progressBar: 'bg-amber-500',
        borderColor: 'border-amber-200/80'
      };
    case 'error':
      return {
        defaultTitle: 'Lỗi / Chú ý',
        icon: AlertOctagon,
        iconBg: 'bg-rose-50 text-rose-600 border-rose-200/70',
        progressBar: 'bg-rose-500',
        borderColor: 'border-rose-200/80'
      };
    case 'info':
    default:
      return {
        defaultTitle: 'Thông báo',
        icon: Info,
        iconBg: 'bg-blue-50 text-[#0072de] border-blue-200/70',
        progressBar: 'bg-[#0072de]',
        borderColor: 'border-blue-200/80'
      };
  }
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const config = getToastConfig(toast.type);
  const Icon = config.icon;
  const title = toast.title || config.defaultTitle;
  const durationSec = (toast.duration || 5000) / 1000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.12)] border ${config.borderColor} transition-shadow hover:shadow-md`}
    >
      <div className="px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-3">
        {/* Icon Badge nhỏ gọn, tinh tế */}
        <div
          className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shadow-2xs ${config.iconBg}`}
        >
          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">
              {title}
            </h4>
            <span className="hidden sm:inline-block text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
              5s
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 leading-snug font-medium break-words mt-0.5 line-clamp-2">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-700 active:scale-90 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
          title="Đóng thông báo"
          aria-label="Đóng"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Countdown Progress Bar thanh mảnh */}
      <div className="h-0.5 sm:h-1 w-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: durationSec, ease: 'linear' }}
          className={`h-full ${config.progressBar}`}
        />
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div
      className="fixed top-2.5 sm:top-4 inset-x-3.5 sm:inset-x-auto sm:right-4 z-[99999] flex flex-col gap-2 max-w-sm sm:w-full pointer-events-none"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
      role="region"
      aria-label="Thông báo đẩy hệ thống"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
