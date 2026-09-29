import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'vi' | 'en';

export interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation & Branding
  brand_title: {
    vi: 'Võ Đường Trí Vũ',
    en: 'Tri Vu Martial Arts'
  },
  brand_subtitle: {
    vi: 'Môn Phái Phật Quang Quyền',
    en: 'Phat Quang Quyen Discipline'
  },
  system_name: {
    vi: 'Phước Quang System',
    en: 'Phuoc Quang System'
  },
  system_tagline: {
    vi: 'Hệ Thống Quản Lý 5 CLB Môn Phái',
    en: '5-Club Martial Arts System'
  },
  home: {
    vi: 'Trang Chủ',
    en: 'Home'
  },
  back_to_home: {
    vi: 'Quay lại Trang Chủ',
    en: 'Back to Home'
  },

  // Sidebar Menu
  menu_title: {
    vi: 'Menu Hệ Thống',
    en: 'System Menu'
  },
  admin_card_title: {
    vi: 'Tài Khoản Quản Trị',
    en: 'Admin Profile'
  },
  admin_role_badge: {
    vi: 'Quản trị viên',
    en: 'Administrator'
  },
  admin_status_active: {
    vi: 'Đang hoạt động',
    en: 'Active now'
  },
  admin_organization: {
    vi: 'Môn Phái Phật Quang Quyền • 2026',
    en: 'Phat Quang Quyen Discipline • 2026'
  },
  language_section: {
    vi: 'Ngôn Ngữ',
    en: 'Language'
  },
  lang_vietnamese: {
    vi: 'Tiếng Việt',
    en: 'Vietnamese'
  },
  lang_english: {
    vi: 'Tiếng Anh (English)',
    en: 'English'
  },
  logout_button: {
    vi: 'Đăng xuất',
    en: 'Sign out'
  },
  logout_confirm: {
    vi: 'Bạn có chắc chắn muốn đăng xuất?',
    en: 'Are you sure you want to sign out?'
  },
  system_settings: {
    vi: 'Cài đặt hệ thống',
    en: 'System Settings'
  },

  // Search & General
  search_placeholder: {
    vi: 'Tìm kiếm võ sinh, hồ sơ...',
    en: 'Search students, records...'
  },
  total: {
    vi: 'Tổng:',
    en: 'Total:'
  },
  students: {
    vi: 'Võ sinh',
    en: 'Students'
  },
  close: {
    vi: 'Đóng',
    en: 'Close'
  },
  version: {
    vi: 'Phiên bản 1.0.1',
    en: 'Version 1.0.1'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'pqq_preferred_language';

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

  const t = useCallback(
    (key: string): string => {
      const item = translations[key];
      if (!item) return key;
      return item[language] || item.vi || key;
    },
    [language]
  );

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
