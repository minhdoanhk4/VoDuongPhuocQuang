import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, isSessionExpired } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        localStorage.setItem('pqq_last_route', '#/');
        window.location.hash = '#/';
      } catch {
        // ignore
      }
      login('ADMIN', 'Admin');
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="h-screen max-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 bg-[#f2f4f8] overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Main Login Card - Samsung One UI Solid Squircle (Zero Liquid Glass) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[400px] bg-white rounded-[32px] px-8 py-9 sm:px-10 sm:py-10 shadow-xl border border-slate-200/90 flex flex-col items-center text-center"
      >
        {/* Title */}
        <h1 className="text-[28px] sm:text-[32px] font-black tracking-wider text-[#0072de] uppercase mb-6 leading-none">
          LOGIN
        </h1>

        {/* Circular Logo of Phật Quang Quyền */}
        <div className="mb-6 cursor-pointer">
          <img
            src="/pqq-logo.png"
            alt="Võ Cổ Truyền Việt Nam - Phật Quang Quyền"
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-sm transition-transform duration-150 hover:scale-102"
          />
        </div>

        {/* Welcome Text */}
        <h2 className="text-xl sm:text-[22px] tracking-tight mb-1 text-slate-800">
          <span className="font-bold text-[#0072de]">Welcome</span>
          <span className="font-normal text-slate-700"> to </span>
          <span className="font-bold text-[#0072de]">Phước Quang</span>
        </h2>

        {/* System Management Subtitle */}
        <p className="text-slate-800 font-semibold text-base sm:text-[17px] mb-6">
          System Management
        </p>

        {/* Thông báo phiên đã hết hạn nếu có */}
        {isSessionExpired && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-6 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</span>
          </motion.div>
        )}

        {/* Main Login Button - Samsung One UI Pill Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-48 py-3 bg-[#0072de] hover:bg-[#0060bd] active:scale-95 text-white font-bold text-base sm:text-[17px] rounded-2xl shadow-md shadow-blue-500/20 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Login</span>
          )}
        </button>

        {/* Bottom subtle copyright / info */}
        <p className="mt-7 text-[11px] text-slate-400 font-medium">
          @Vo Duong Tri Vu Phuoc Quang 2026
        </p>
      </motion.div>
    </div>
  );
};

export default LoginView;
