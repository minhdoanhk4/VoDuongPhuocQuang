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

// Tạo bảng tra cứu đảo ngược (Reverse lookup: English -> Vietnamese) để khôi phục nhanh
const REVERSE_DICTIONARY: Record<string, string> = {};
Object.entries(UI_DICTIONARY).forEach(([vi, en]) => {
  if (!REVERSE_DICTIONARY[en]) {
    REVERSE_DICTIONARY[en] = vi;
  }
});

// Chuyển đổi chuỗi có quy luật động (ví dụ: "Tổng: 180 Võ sinh" -> "Total: 180 Students")
function translateDynamicPatterns(text: string, toEn: boolean): string {
  if (toEn) {
    // "Tổng: 180 Võ sinh" -> "Total: 180 Students"
    text = text.replace(/Tổng:\s*(\d+)\s*Võ sinh/gi, 'Total: $1 Students');
    text = text.replace(/(\d+)\s*Võ sinh/gi, '$1 Students');
    text = text.replace(/(\d+)\s*võ sinh/gi, '$1 students');
    text = text.replace(/Năm\s*(\d{4})/gi, 'Year $1');
    text = text.replace(/Tháng\s*(\d{1,2})/gi, 'Month $1');
    text = text.replace(/←\s*Quay lại Trang Chủ/gi, '← Back to Home');
    text = text.replace(/←\s*Về Trang Chủ/gi, '← Back to Home');
  } else {
    text = text.replace(/Total:\s*(\d+)\s*Students/gi, 'Tổng: $1 Võ sinh');
    text = text.replace(/(\d+)\s*Students/gi, '$1 Võ sinh');
    text = text.replace(/(\d+)\s*students/gi, '$1 võ sinh');
    text = text.replace(/Year\s*(\d{4})/gi, 'Năm $1');
    text = text.replace(/Month\s*(\d{1,2})/gi, 'Tháng $1');
    text = text.replace(/←\s*Back to Home/gi, '← Quay lại Trang Chủ');
  }
  return text;
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

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const next = prev === 'vi' ? 'en' : 'vi';
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Hàm dịch trực tiếp (cho các component React)
  const t = useCallback(
    (text: string): string => {
      if (!text || typeof text !== 'string') return text;
      if (language === 'vi') return text;

      const trimmed = text.trim();
      if (UI_DICTIONARY[trimmed]) {
        return text.replace(trimmed, UI_DICTIONARY[trimmed]);
      }

      return translateDynamicPatterns(text, true);
    },
    [language]
  );

  // =========================================================================
  // BỘ DỊCH TOÀN DIỆN TỰ ĐỘNG CHO TOÀN BỘ DOM CỦA HỆ THỐNG (DOM TRANSLATOR)
  // Quét và dịch toàn bộ text nodes, placeholders, titles trên toàn bộ các trang và modal
  // Ngoại trừ các thông tin cá nhân như Tên Võ Sinh
  // =========================================================================
  useEffect(() => {
    // Các thẻ/khu vực KHÔNG quét dịch
    const shouldSkipElement = (el: Element | null): boolean => {
      if (!el) return true;
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT' || el.tagName === 'CODE') {
        return true;
      }
      // Bỏ qua nếu có thuộc tính đánh dấu không dịch hoặc khu vực chứa tên riêng
      if (el.getAttribute('data-no-translate') === 'true' || el.classList.contains('student-name')) {
        return true;
      }
      return false;
    };

    const translateTextNode = (node: Text) => {
      if (!node || !node.nodeValue) return;
      if (shouldSkipElement(node.parentElement)) return;

      const originalVal = node.nodeValue;
      const trimmed = originalVal.trim();
      if (trimmed.length < 2) return;

      if (language === 'en') {
        // Lưu trữ chuỗi tiếng Việt gốc nếu chưa lưu
        if (!(node as any).__origVn) {
          (node as any).__origVn = originalVal;
        }

        // 1. Khớp chính xác từ điển UI
        if (UI_DICTIONARY[trimmed]) {
          node.nodeValue = originalVal.replace(trimmed, UI_DICTIONARY[trimmed]);
          return;
        }

        // 2. Khớp các mẫu động (ví dụ: Tổng: 180 Võ sinh)
        const transformed = translateDynamicPatterns(originalVal, true);
        if (transformed !== originalVal) {
          node.nodeValue = transformed;
        }
      } else {
        // Khôi phục lại tiếng Việt
        if ((node as any).__origVn) {
          node.nodeValue = (node as any).__origVn;
        } else if (REVERSE_DICTIONARY[trimmed]) {
          node.nodeValue = originalVal.replace(trimmed, REVERSE_DICTIONARY[trimmed]);
        } else {
          const restored = translateDynamicPatterns(originalVal, false);
          if (restored !== originalVal) {
            node.nodeValue = restored;
          }
        }
      }
    };

    const translateAttributes = (el: Element) => {
      if (shouldSkipElement(el)) return;

      // 1. Thuộc tính placeholder của ô input
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        const ph = el.placeholder;
        if (ph && ph.trim().length > 1) {
          if (language === 'en') {
            if (!(el as any).__origPh) (el as any).__origPh = ph;
            const trimmed = ph.trim();
            if (UI_DICTIONARY[trimmed]) {
              el.placeholder = ph.replace(trimmed, UI_DICTIONARY[trimmed]);
            } else {
              el.placeholder = translateDynamicPatterns(ph, true);
            }
          } else {
            if ((el as any).__origPh) {
              el.placeholder = (el as any).__origPh;
            } else if (REVERSE_DICTIONARY[ph.trim()]) {
              el.placeholder = ph.replace(ph.trim(), REVERSE_DICTIONARY[ph.trim()]);
            }
          }
        }
      }

      // 2. Thuộc tính title của nút bấm/link
      if (el instanceof HTMLElement) {
        const title = el.title;
        if (title && title.trim().length > 1) {
          if (language === 'en') {
            if (!(el as any).__origTitle) (el as any).__origTitle = title;
            const trimmed = title.trim();
            if (UI_DICTIONARY[trimmed]) {
              el.title = title.replace(trimmed, UI_DICTIONARY[trimmed]);
            }
          } else {
            if ((el as any).__origTitle) {
              el.title = (el as any).__origTitle;
            } else if (REVERSE_DICTIONARY[title.trim()]) {
              el.title = title.replace(title.trim(), REVERSE_DICTIONARY[title.trim()]);
            }
          }
        }
      }
    };

    // Hàm đệ quy duyệt toàn bộ cây DOM
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

    // Tiến hành quét toàn bộ tài liệu ngay lập tức
    const appRoot = document.getElementById('root') || document.body;
    walkTree(appRoot);

    // Thiết lập MutationObserver để tự động dịch khi có modal mở ra, chuyển tab, render dữ liệu mới
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (language === 'en') {
      const observer = new MutationObserver(mutations => {
        for (const mut of mutations) {
          if (mut.type === 'childList') {
            mut.addedNodes.forEach(node => walkTree(node));
          } else if (mut.type === 'characterData') {
            translateTextNode(mut.target as Text);
          }
        }
      });

      observer.observe(appRoot, {
        childList: true,
        subtree: true,
        characterData: true
      });

      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [language]);

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
