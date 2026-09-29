import { BeltRank, BELT_CONFIGS } from '../types';

export const BELT_ORDER: BeltRank[] = [
  'NAU_DAI',
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
  return BELT_CONFIGS[belt] || BELT_CONFIGS.NAU_DAI;
}

const BELT_ENGLISH_NAMES: Record<BeltRank, string> = {
  NAU_DAI: 'Brown Belt',
  LAM_DAI: 'Blue Belt',
  LUC_DAI: 'Green Belt',
  HONG_DAI: 'Red Belt',
  HOANG_DAI: 'Yellow Belt',
  BACH_DAI: 'White Belt'
};

/**
 * Trả về tên hiển thị kèm cấp/gạch (Ví dụ: Nâu Đai Cấp 0, Lam Đai cấp 2, Bạch Đai)
 * Tự động đồng bộ song ngữ Việt - Anh
 */
export function formatBeltWithLevel(belt: BeltRank, level: number = 1): string {
  const isEn = typeof window !== 'undefined' && localStorage.getItem('pqq_preferred_language') === 'en';
  if (isEn) {
    const enName = BELT_ENGLISH_NAMES[belt] || 'Belt';
    if (belt === 'NAU_DAI') {
      return level === 0 ? 'Brown Belt (Level 0)' : 'Brown Belt';
    }
    if (belt === 'BACH_DAI') {
      return level > 1 ? `White Belt (${level}th Dan)` : 'White Belt';
    }
    return `${enName} (Level ${level})`;
  }

  const config = getBeltConfig(belt);
  if (belt === 'NAU_DAI') {
    return level === 0 ? 'Nâu Đai (Cấp 0)' : 'Nâu Đai';
  }
  if (belt === 'BACH_DAI') {
    return level > 1 ? `Bạch Đai (Đẳng ${level})` : 'Bạch Đai';
  }
  return `${config.name} (Cấp ${level})`;
}

/**
 * Xác định cấp đai tiếp theo khi thi thăng đai
 */
export function getNextBeltRank(currentBelt: BeltRank, currentLevel: number = 1): { belt: BeltRank; level: number } {
  // Nếu là Nâu Đai (Cấp 0) -> thi lên Lam Đai Cấp 1
  if (currentBelt === 'NAU_DAI') {
    return {
      belt: 'LAM_DAI',
      level: 1
    };
  }

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
    case 'NAU_DAI':
      return {
        bg: 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200/80',
        dot: 'bg-[#78350f]',
        gradient: 'from-amber-800 to-amber-950',
        border: 'border-amber-900',
        accentColor: '#78350f'
      };
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
