import { BeltRank, BELT_CONFIGS } from '../types';

export const BELT_ORDER: BeltRank[] = [
  'LAM_DAI',
  'LUC_DAI',
  'HONG_DAI',
  'HOANG_DAI',
  'BACH_DAI'
];

/**
 * Trả về thông tin đầy đủ của cấp đai
 */
export function getBeltConfig(belt: BeltRank) {
  return BELT_CONFIGS[belt] || BELT_CONFIGS.LAM_DAI;
}

/**
 * Trả về tên hiển thị kèm cấp/gạch (Ví dụ: Lam Đai cấp 2, Bạch Đai)
 */
export function formatBeltWithLevel(belt: BeltRank, level: number = 1): string {
  const config = getBeltConfig(belt);
  if (belt === 'BACH_DAI') {
    return level > 1 ? `Bạch Đai (Đẳng ${level})` : 'Bạch Đai';
  }
  return `${config.name} (Cấp ${level})`;
}

/**
 * Xác định cấp đai tiếp theo khi thi thăng đai
 */
export function getNextBeltRank(currentBelt: BeltRank, currentLevel: number = 1): { belt: BeltRank; level: number } {
  const currentConfig = getBeltConfig(currentBelt);
  
  // Nếu chưa đạt cấp tối đa của đai hiện tại -> Tăng lên 1 cấp
  if (currentLevel < currentConfig.maxLevels) {
    return {
      belt: currentBelt,
      level: currentLevel + 1
    };
  }
  
  // Nếu đã đạt cấp tối đa -> Thăng lên màu đai kế tiếp
  const currentIndex = BELT_ORDER.indexOf(currentBelt);
  if (currentIndex < BELT_ORDER.length - 1) {
    const nextBelt = BELT_ORDER[currentIndex + 1];
    return {
      belt: nextBelt,
      level: 1
    };
  }
  
  // Đã là Bạch Đai tối cao
  return {
    belt: 'BACH_DAI',
    level: Math.min(currentLevel + 1, 5)
  };
}

/**
 * Style huy hiệu (Badge) đai cho giao diện
 */
export function getBeltBadgeStyle(belt: BeltRank) {
  switch (belt) {
    case 'LAM_DAI':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        dot: 'bg-blue-600',
        gradient: 'from-blue-600 to-indigo-700',
        border: 'border-blue-500',
        accentColor: '#2563eb'
      };
    case 'LUC_DAI':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        dot: 'bg-emerald-600',
        gradient: 'from-emerald-600 to-teal-700',
        border: 'border-emerald-500',
        accentColor: '#059669'
      };
    case 'HONG_DAI':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
        dot: 'bg-rose-600',
        gradient: 'from-rose-600 to-red-700',
        border: 'border-rose-500',
        accentColor: '#e11d48'
      };
    case 'HOANG_DAI':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
        dot: 'bg-amber-500',
        gradient: 'from-amber-500 to-yellow-600',
        border: 'border-amber-500',
        accentColor: '#f59e0b'
      };
    case 'BACH_DAI':
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 shadow-xs',
        dot: 'bg-slate-400',
        gradient: 'from-slate-200 to-slate-400',
        border: 'border-slate-400',
        accentColor: '#64748b'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-500',
        gradient: 'from-slate-500 to-slate-700',
        border: 'border-slate-400',
        accentColor: '#64748b'
      };
  }
}
