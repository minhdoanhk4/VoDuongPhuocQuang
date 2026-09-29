import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserRole } from '../types';

export const AUTH_STORAGE_KEY = 'pqq_auth_session_v2';
export const LEGACY_AUTH_STORAGE_KEY = 'pqq_auth_session_v1';
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 phút không thao tác

export interface AuthSessionData {
  isUnlocked: boolean;
  userRole: UserRole;
  userName: string;
  userClubId: string | null;
  loginTime: number;
  lastActiveTime: number;
}

interface AuthContextType {
  isUnlocked: boolean;
  userRole: UserRole;
  userName: string;
  userClubId: string | null;
  isSessionExpired: boolean;
  login: (role?: UserRole, name?: string, clubId?: string | null) => void;
  logout: (expired?: boolean) => void;
  setUserRole: (role: UserRole) => void;
  setUserClubId: (clubId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kiểm tra và lấy phiên đăng nhập hợp lệ ban đầu
const getInitialSession = (): AuthSessionData | null => {
  // Xóa bỏ key cũ vô hạn thời gian nếu còn lưu trong trình duyệt
  try {
    if (localStorage.getItem(LEGACY_AUTH_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore
  }

  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;

    const parsed: AuthSessionData = JSON.parse(saved);
    const now = Date.now();

    // Kiểm tra: nếu thời gian không hoạt động đã vượt quá 30 phút -> coi như hết hạn
    if (
      parsed &&
      parsed.isUnlocked &&
      typeof parsed.lastActiveTime === 'number' &&
      now - parsed.lastActiveTime < INACTIVITY_TIMEOUT_MS
    ) {
      return parsed;
    }

    // Đã quá 30 phút không hoạt động -> xóa phiên và yêu cầu login lại
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSession = getInitialSession();

  const [isUnlocked, setIsUnlocked] = useState<boolean>(Boolean(initialSession?.isUnlocked));
  const [userRole, setUserRole] = useState<UserRole>(initialSession?.userRole || 'ADMIN');
  const [userName, setUserName] = useState<string>(initialSession?.userName || 'Ban Thư Ký Quản Trị');
  const [userClubId, setUserClubId] = useState<string | null>(initialSession?.userClubId || null);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  // Quản lý mốc thời gian thao tác gần nhất bằng Ref để kiểm tra tức thì trong event listener
  const lastActiveTimeRef = useRef<number>(initialSession?.lastActiveTime || Date.now());
  const lastStorageSyncRef = useRef<number>(Date.now());

  const logout = useCallback((expired: boolean = false) => {
    setIsUnlocked(false);
    setIsSessionExpired(expired);
    lastActiveTimeRef.current = 0;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const login = (role: UserRole = 'ADMIN', name?: string, clubId: string | null = null) => {
    const defaultName =
      role === 'ADMIN'
        ? 'Ban Thư Ký Quản Trị'
        : role === 'COACH'
          ? 'Huấn Luyện Viên CLB'
          : 'Hội Đồng Giám Khảo';
    const finalName = name || defaultName;
    const now = Date.now();

    const sessionData: AuthSessionData = {
      isUnlocked: true,
      userRole: role,
      userName: finalName,
      userClubId: clubId,
      loginTime: now,
      lastActiveTime: now
    };

    lastActiveTimeRef.current = now;
    lastStorageSyncRef.current = now;

    setIsUnlocked(true);
    setUserRole(role);
    setUserName(finalName);
    setUserClubId(clubId);
    setIsSessionExpired(false);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.error('Không thể lưu phiên đăng nhập:', e);
    }
  };

  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      const existing = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          ...existing,
          userRole: role
        })
      );
    } catch {
      // ignore
    }
  };

  const handleSetUserClubId = (clubId: string | null) => {
    setUserClubId(clubId);
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      const existing = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          ...existing,
          userClubId: clubId
        })
      );
    } catch {
      // ignore
    }
  };

  // Lắng nghe thao tác người dùng: nếu không có thao tác gì trong 30 phút,
  // ngay khi người dùng thực hiện thao tác bất kỳ sau 30 phút đó, hệ thống sẽ chặn thao tác và bắt login lại.
  useEffect(() => {
    if (!isUnlocked) return;

    const checkAndHandleActivity = (e?: Event) => {
      const now = Date.now();
      const elapsed = now - lastActiveTimeRef.current;

      // Nếu đã quá 30 phút không có thao tác gì trên app
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        if (e) {
          // Chặn sự kiện click / bấm phím hiện tại để bảo mật
          e.preventDefault();
          e.stopPropagation();
        }
        logout(true);
        return;
      }

      // Người dùng vẫn đang hoạt động -> gia hạn mốc thời gian thao tác
      lastActiveTimeRef.current = now;

      // Ghi lại mốc thao tác vào storage (giới hạn tối đa 1 lần mỗi 15 giây)
      if (now - lastStorageSyncRef.current >= 15 * 1000) {
        lastStorageSyncRef.current = now;
        try {
          const saved = localStorage.getItem(AUTH_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            localStorage.setItem(
              AUTH_STORAGE_KEY,
              JSON.stringify({
                ...parsed,
                lastActiveTime: now
              })
            );
          }
        } catch {
          // ignore
        }
      }
    };

    // Bắt sự kiện ở Capture Phase (useCapture = true) để chặn trước khi tới component
    const userEvents = ['mousedown', 'keydown', 'touchstart', 'pointerdown', 'wheel'];
    userEvents.forEach(evt => {
      window.addEventListener(evt, checkAndHandleActivity, true);
    });

    // Khi người dùng quay lại tab/cửa sổ sau một thời gian
    const handleFocusOrVisible = () => {
      checkAndHandleActivity();
    };
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    // Timer chạy ngầm định kỳ kiểm tra mỗi 10 giây
    const intervalTimer = setInterval(() => {
      const now = Date.now();
      if (now - lastActiveTimeRef.current >= INACTIVITY_TIMEOUT_MS) {
        logout(true);
      }
    }, 10000);

    return () => {
      userEvents.forEach(evt => {
        window.removeEventListener(evt, checkAndHandleActivity, true);
      });
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      clearInterval(intervalTimer);
    };
  }, [isUnlocked, logout]);

  return (
    <AuthContext.Provider
      value={{
        isUnlocked,
        userRole,
        userName,
        userClubId,
        isSessionExpired,
        login,
        logout,
        setUserRole: handleSetUserRole,
        setUserClubId: handleSetUserClubId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
