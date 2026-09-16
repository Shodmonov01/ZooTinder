import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, clearTokens, saveTokens } from './api'
import type { User } from './types'

type AuthValue = {
  user: User | null
  loading: boolean
  onboarded: boolean
  markOnboarded: () => void
  requestOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, code: string) => Promise<void>
  refreshMe: () => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboarded, setOnboarded] = useState(localStorage.getItem('bm_onboarded') === '1')

  async function refreshMe() {
    const me = await api<User>('/me')
    setUser(me)
  }

  useEffect(() => {
    api<User>('/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      onboarded,
      markOnboarded: () => {
        localStorage.setItem('bm_onboarded', '1')
        setOnboarded(true)
      },
      requestOtp: async (phone) => {
        await api('/auth/otp/request', { method: 'POST', auth: false, body: JSON.stringify({ phone }) })
      },
      verifyOtp: async (phone, code) => {
        const data = await api<{ accessToken: string; refreshToken: string; user: User }>(
          '/auth/otp/verify',
          { method: 'POST', auth: false, body: JSON.stringify({ phone, code }) },
        )
        saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
        setUser(data.user)
      },
      refreshMe,
      logout: async () => {
        try {
          await api('/auth/logout-all', { method: 'POST' })
        } catch {
          /* ignore */
        }
        clearTokens()
        setUser(null)
      },
    }),
    [user, loading, onboarded],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}
