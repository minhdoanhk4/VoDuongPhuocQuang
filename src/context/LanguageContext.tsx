import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UI_DICTIONARY } from './translations';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'pqq_preferred_language';

// Bảng tra cứu đảo ngược (Reverse lookup: English -> Vietnamese)
const REVERSE_DICTIONARY: Record<string, string> = {};
Object.entries(UI_DICTIONARY).forEach(([vi, en]) => {
  if (!REVERSE_DICTIONARY[en]) {
    REVERSE_DICTIONARY[en] = vi;
  }
});

// Phân tách từ điển thành:
// 1. Cụm từ dài (độ dài >= 4 ký tự): Thay thế greedy theo thứ tự độ dài giảm dần
// 2. Từ ngắn (độ dài < 4 ký tự: Nam, Nữ, Có, Đạt...): Cần kiểm tra ranh giới từ (word boundary)
const SORTED_VI_LONG_ENTRIES: [string, string][] = [];
const SORTED_VI_SHORT_ENTRIES: [string, string, RegExp][] = [];

Object.entries(UI_DICTIONARY)
  .sort((a, b) => b[0].length - a[0].length)
  .forEach(([vi, en]) => {
    if (vi.length >= 4) {
      SORTED_VI_LONG_ENTRIES.push([vi, en]);
    } else {
      // Escape ký tự regex đặc biệt và dùng regex kiểm tra ranh giới ký tự Unicode
      const escaped = vi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'gu');
      SORTED_VI_SHORT_ENTRIES.push([vi, en, regex]);
    }
  });

const SORTED_EN_LONG_ENTRIES: [string, string][] = [];
const SORTED_EN_SHORT_ENTRIES: [string, string, RegExp][] = [];

Object.entries(REVERSE_DICTIONARY)
  .sort((a, b) => b[0].length - a[0].length)
  .forEach(([en, vi]) => {
    if (en.length >= 4) {
      SORTED_EN_LONG_ENTRIES.push([en, vi]);
    } else {
      const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'gu');
      SORTED_EN_SHORT_ENTRIES.push([en, vi, regex]);
    }
  });

// Danh sách họ tên võ sinh mẫu mặc định để bảo vệ 100% không bị dịch
const DEFAULT_STUDENT_NAMES = [
  'Lê Hoàng Long',
  'Nguyễn Văn Duy',
  'Đặng Thanh Thảo',
  'Nguyễn Văn Khang',
  'Trần Minh Tuấn',
  'Lê Thị Mai Anh',
  'Hoàng Quốc Bảo',
  'Phạm Ngọc Linh',
  'Vũ Đình Trọng',
  'Đỗ Thành Nam',
  'Nguyễn Thị Kim Yến',
  'Bùi Hữu Phước',
  'Ngô Đình Khôi',
  'Nguyễn Tuệ Minh',
  'Phan Thảo Vy',
  'Trần Quang Dũng',
  'Vũ Thị Ngọc Ánh',
  'Trương Gia Bảo',
  'Lê Đức Trí',
  'Bùi Gia Huy',
  'Phạm Minh Hùng',
  'Hoàng Anh Tuấn',
  'Ngô Quốc Đạt'
];

/**
 * Lấy danh sách toàn bộ Tên Võ Sinh hiện có trong hệ thống (để bảo vệ thông tin cá nhân)
 */
function getProtectedStudentNames(): string[] {
  const namesSet = new Set<string>(DEFAULT_STUDENT_NAMES);
  try {
    const stored = localStorage.getItem('pqq_students_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((s: any) => {
          if (s && typeof s.fullName === 'string' && s.fullName.trim().length > 1) {
            namesSet.add(s.fullName.trim());
          }
        });
      }
    }
  } catch {
    // ignore
  }
  // Sắp xếp tên theo độ dài giảm dần (ưu tiên tên dài trước)
  return Array.from(namesSet).sort((a, b) => b.length - a.length);
}

/**
 * Dịch các mẫu chuỗi số động (Dynamic patterns: Tổng: 180 võ sinh, Năm 2026...)
 */
function translateDynamicPatterns(text: string, toEn: boolean): string {
  if (toEn) {
    text = text.replace(/Tổng:\s*(\d+)/gi, 'Total: $1');
    text = text.replace(/(\d+)\s*Võ sinh/gi, '$1 Students');
    text = text.replace(/(\d+)\s*võ sinh/gi, '$1 students');
    text = text.replace(/(\d+)\s*người/gi, '$1 members');
    text = text.replace(/(\d+)\s*phân nhánh/gi, '$1 branches');
    text = text.replace(/(\d+)\s*đợt thi/gi, '$1 sessions');
    text = text.replace(/(\d+)\s*chứng nhận/gi, '$1 certificates');
    text = text.replace(/Năm\s*(\d{4})/gi, 'Year $1');
    text = text.replace(/Tháng\s*(\d{1,2})/gi, 'Month $1');
    text = text.replace(/Quý\s*(\d)/gi, 'Q$1');
    text = text.replace(/Bậc\s*(\d+)/gi, 'Level $1');
    text = text.replace(/Cấp\s*(\d+)/gi, 'Degree $1');
    text = text.replace(/Hạng Nhất/gi, '1st Place');
    text = text.replace(/Hạng Nhì/gi, '2nd Place');
    text = text.replace(/Hạng Ba/gi, '3rd Place');
    text = text.replace(/←\s*Quay lại Trang Chủ/gi, '← Back to Home');
    text = text.replace(/←\s*Về Trang Chủ/gi, '← Back to Home');
  } else {
    text = text.replace(/Total:\s*(\d+)/gi, 'Tổng: $1');
    text = text.replace(/(\d+)\s*Students/gi, '$1 Võ sinh');
    text = text.replace(/(\d+)\s*students/gi, '$1 võ sinh');
    text = text.replace(/(\d+)\s*members/gi, '$1 người');
    text = text.replace(/(\d+)\s*branches/gi, '$1 phân nhánh');
    text = text.replace(/(\d+)\s*sessions/gi, '$1 đợt thi');
    text = text.replace(/(\d+)\s*certificates/gi, '$1 chứng nhận');
    text = text.replace(/Year\s*(\d{4})/gi, 'Năm $1');
    text = text.replace(/Month\s*(\d{1,2})/gi, 'Tháng $1');
    text = text.replace(/Q\s*(\d)/gi, 'Quý $1');
    text = text.replace(/Level\s*(\d+)/gi, 'Bậc $1');
    text = text.replace(/Degree\s*(\d+)/gi, 'Cấp $1');
    text = text.replace(/1st Place/gi, 'Hạng Nhất');
    text = text.replace(/2nd Place/gi, 'Hạng Nhì');
    text = text.replace(/3rd Place/gi, 'Hạng Ba');
    text = text.replace(/←\s*Back to Home/gi, '← Quay lại Trang Chủ');
  }
  return text;
}

/**
 * Động cơ dịch toàn diện chuỗi Tiếng Việt sang Tiếng Anh
 * Bảo vệ 100% tên võ sinh không bị thay đổi
 */
export function translateToEnglish(text: string, protectedNames: string[] = []): string {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (trimmed.length < 2) return text;

  // Nếu chuỗi trùng khớp chính xác 100% với tên võ sinh -> Bỏ qua ngay lập tức
  if (protectedNames.includes(trimmed)) {
    return text;
  }

  // Khớp chính xác 100% từ điển UI
  if (UI_DICTIONARY[trimmed]) {
    return text.replace(trimmed, UI_DICTIONARY[trimmed]);
  }

  // Bước 1: Bảo vệ tên võ sinh xuất hiện trong câu (dùng Token tạm thời)
  const tokens: { placeholder: string; original: string }[] = [];
  let masked = text;
  protectedNames.forEach((name, idx) => {
    if (masked.includes(name)) {
      const placeholder = `__PQQ_PROTECTED_STUDENT_${idx}__`;
      tokens.push({ placeholder, original: name });
      masked = masked.split(name).join(placeholder);
    }
  });

  // Bước 2: Dịch các cụm từ dài (Greedy match: dài trước, ngắn sau)
  for (let i = 0; i < SORTED_VI_LONG_ENTRIES.length; i++) {
    const [vi, en] = SORTED_VI_LONG_ENTRIES[i];
    if (masked.includes(vi)) {
      masked = masked.split(vi).join(en);
    }
  }

  // Bước 3: Dịch các từ ngắn (Có word boundary để không ăn vào từ khác)
  for (let i = 0; i < SORTED_VI_SHORT_ENTRIES.length; i++) {
    const [, en, regex] = SORTED_VI_SHORT_ENTRIES[i];
    if (regex.test(masked)) {
      regex.lastIndex = 0;
      masked = masked.replace(regex, en);
    }
  }

  // Bước 4: Dịch các mẫu số động
  masked = translateDynamicPatterns(masked, true);

  // Bước 5: Khôi phục lại chính xác tên võ sinh từ Token
  tokens.forEach(({ placeholder, original }) => {
    masked = masked.split(placeholder).join(original);
  });

  return masked;
}

/**
 * Động cơ dịch ngược Tiếng Anh về Tiếng Việt
 */
export function translateToVietnamese(text: string): string {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (trimmed.length < 2) return text;

  if (REVERSE_DICTIONARY[trimmed]) {
    return text.replace(trimmed, REVERSE_DICTIONARY[trimmed]);
  }

  let result = text;
  for (let i = 0; i < SORTED_EN_LONG_ENTRIES.length; i++) {
    const [en, vi] = SORTED_EN_LONG_ENTRIES[i];
    if (result.includes(en)) {
      result = result.split(en).join(vi);
    }
  }

  for (let i = 0; i < SORTED_EN_SHORT_ENTRIES.length; i++) {
    const [, vi, regex] = SORTED_EN_SHORT_ENTRIES[i];
    if (regex.test(result)) {
      regex.lastIndex = 0;
      result = result.replace(regex, vi);
    }
  }

  result = translateDynamicPatterns(result, false);
  return result;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'vi';
  });

  const observerRef = useRef<MutationObserver | null>(null);
  const isTranslatingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const protectedNamesRef = useRef<string[]>([]);

  // Cập nhật danh sách tên võ sinh được bảo vệ
  const updateProtectedNames = useCallback(() => {
    protectedNamesRef.current = getProtectedStudentNames();
  }, []);

  // Thiết lập ngôn ngữ kèm phát sự kiện đồng bộ toàn hệ thống
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.setAttribute('lang', lang);
      window.dispatchEvent(new CustomEvent('pqq_language_changed', { detail: lang }));
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const next = prev === 'vi' ? 'en' : 'vi';
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
        document.documentElement.setAttribute('lang', next);
        window.dispatchEvent(new CustomEvent('pqq_language_changed', { detail: next }));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Lắng nghe sự kiện đồng bộ ngôn ngữ giữa các tab và giữa Web/Mobile
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && (e.newValue === 'vi' || e.newValue === 'en')) {
        setLanguageState(e.newValue);
      }
    };
    const handleCustomChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'vi' || detail === 'en') {
        setLanguageState(detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pqq_language_changed', handleCustomChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pqq_language_changed', handleCustomChange);
    };
  }, []);

  // Hàm dịch trực tiếp (cho các component React)
  const t = useCallback(
    (text: string): string => {
      if (!text || typeof text !== 'string') return text;

      // Hỗ trợ key-based (VD: 'menu_title')
      if (language === 'en') {
        if (UI_DICTIONARY[text]) return UI_DICTIONARY[text];
        return translateToEnglish(text, protectedNamesRef.current);
      } else {
        // Tiếng Việt
        if (text === 'menu_title') return 'Menu Hệ Thống';
        if (text === 'close') return 'Đóng';
        if (text === 'admin_card_title') return 'Tài Khoản Quản Trị';
        if (text === 'admin_role_badge') return 'Quản trị viên';
        if (text === 'admin_status_active') return 'Đang hoạt động';
        if (text === 'language_section') return 'Chuyển Đổi Ngôn Ngữ';
        if (text === 'lang_vietnamese') return 'Tiếng Việt';
        if (text === 'lang_english') return 'English';
        if (text === 'logout_button') return 'Đăng xuất';
        if (text === 'version') return 'Phiên bản 1.0.1';
        if (text === 'total') return 'Tổng:';
        if (text === 'students') return 'Võ sinh';

        if (REVERSE_DICTIONARY[text]) return REVERSE_DICTIONARY[text];
        return text;
      }
    },
    [language]
  );

  // =========================================================================
  // BỘ DỊCH TOÀN DIỆN TỰ ĐỘNG CHO TOÀN BỘ DOM CỦA HỆ THỐNG (DOM TRANSLATOR)
  // Quét và dịch toàn bộ text nodes, placeholders, titles trên toàn bộ các trang và modal
  // Ngoại trừ các thông tin cá nhân như Tên Võ Sinh
  // =========================================================================
  useEffect(() => {
    updateProtectedNames();

    // Bỏ qua các phần tử đặc biệt
    const shouldSkipElement = (el: Element | null): boolean => {
      if (!el) return true;
      const tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE') {
        return true;
      }
      if (
        el.getAttribute('data-no-translate') === 'true' ||
        el.getAttribute('data-student-name') === 'true' ||
        el.classList.contains('student-name')
      ) {
        return true;
      }
      return false;
    };

    const translateTextNode = (node: Text) => {
      if (!node || !node.nodeValue) return;
      if (shouldSkipElement(node.parentElement)) return;

      const currentVal = node.nodeValue;
      const trimmed = currentVal.trim();
      if (trimmed.length < 2) return;

      // Kiểm tra xem node có chứa tên võ sinh được bảo vệ không
      if (protectedNamesRef.current.includes(trimmed)) {
        return;
      }

      if (language === 'en') {
        // Lưu trữ chuỗi tiếng Việt gốc nếu chưa lưu
        if (!(node as any).__origVn) {
          (node as any).__origVn = currentVal;
        }
        const translated = translateToEnglish(currentVal, protectedNamesRef.current);
        if (translated !== currentVal) {
          node.nodeValue = translated;
        }
      } else {
        // Khôi phục lại tiếng Việt
        if ((node as any).__origVn) {
          node.nodeValue = (node as any).__origVn;
        } else {
          const restored = translateToVietnamese(currentVal);
          if (restored !== currentVal) {
            node.nodeValue = restored;
          }
        }
      }
    };

    const translateAttributes = (el: Element) => {
      if (shouldSkipElement(el)) return;

      // 1. Placeholder
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const ph = el.placeholder;
        if (ph && ph.trim().length > 1) {
          if (language === 'en') {
            if (!(el as any).__origPh) (el as any).__origPh = ph;
            el.placeholder = translateToEnglish(ph, protectedNamesRef.current);
          } else {
            if ((el as any).__origPh) {
              el.placeholder = (el as any).__origPh;
            } else {
              el.placeholder = translateToVietnamese(ph);
            }
          }
        }
      }

      // 2. Title attribute
      if (el instanceof HTMLElement) {
        const title = el.title;
        if (title && title.trim().length > 1) {
          if (language === 'en') {
            if (!(el as any).__origTitle) (el as any).__origTitle = title;
            el.title = translateToEnglish(title, protectedNamesRef.current);
          } else {
            if ((el as any).__origTitle) {
              el.title = (el as any).__origTitle;
            } else {
              el.title = translateToVietnamese(title);
            }
          }
        }
      }
    };

    // Hàm đệ quy duyệt cây DOM
    const walkTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root as Text);
        return;
      }

      if (root.nodeType === Node.ELEMENT_NODE) {
        const el = root as Element;
        if (shouldSkipElement(el)) return;
        translateAttributes(el);

        let child = el.firstChild;
        while (child) {
          walkTree(child);
          child = child.nextSibling;
        }
      }
    };

    const performTranslation = () => {
      if (isTranslatingRef.current) return;
      isTranslatingRef.current = true;
      try {
        const appRoot = document.getElementById('root') || document.body;
        walkTree(appRoot);
      } finally {
        isTranslatingRef.current = false;
      }
    };

    // Tiến hành quét dịch ngay lập tức
    performTranslation();

    // Thiết lập MutationObserver để tự động dịch khi có modal mở ra, chuyển tab, render dữ liệu mới
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const observer = new MutationObserver(mutations => {
      if (isTranslatingRef.current) return;

      // Throttle lại bằng requestAnimationFrame để mượt mà không bị giật lag
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        isTranslatingRef.current = true;
        try {
          for (const mut of mutations) {
            if (mut.type === 'childList') {
              mut.addedNodes.forEach(node => walkTree(node));
            } else if (mut.type === 'characterData') {
              translateTextNode(mut.target as Text);
            }
          }
        } finally {
          isTranslatingRef.current = false;
        }
      });
    });

    const appRoot = document.getElementById('root') || document.body;
    observer.observe(appRoot, {
      childList: true,
      subtree: true,
      characterData: true
    });

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [language, updateProtectedNames]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
