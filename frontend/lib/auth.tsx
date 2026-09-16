import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearTokens, saveTokens } from './api';
import { getItem, setItem } from './storage';
import { User } from './types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  onboarded: boolean;
  markOnboarded: () => Promise<void>;
  requestOtp: (phone: string) => Promise<{ debugCode?: string; message: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      setOnboarded((await getItem('bm_onboarded')) === '1');
      try {
        const me = await api<User>('/me');
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      onboarded,
      markOnboarded: async () => {
        await setItem('bm_onboarded', '1');
        setOnboarded(true);
      },
      requestOtp: (phone) => api('/auth/otp/request', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ phone }),
      }),
      verifyOtp: async (phone, code) => {
        const data = await api<{ accessToken: string; refreshToken: string; user: User }>(
          '/auth/otp/verify',
          { method: 'POST', auth: false, body: JSON.stringify({ phone, code }) },
        );
        await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        setUser(data.user);
      },
      refreshMe: async () => {
        setUser(await api<User>('/me'));
      },
      logout: async () => {
        try {
          await api('/auth/logout-all', { method: 'POST' });
        } catch {
          // ignore network errors on logout
        }
        await clearTokens();
        setUser(null);
      },
    }),
    [user, loading, onboarded],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
