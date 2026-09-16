import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import { useAuth } from './auth'
import { useI18n } from './i18n'
import { mediaUrl } from './api'

export function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="desk">
      <div className="phone">{children}</div>
    </div>
  )
}

export function Avatar({ uri, name, size = 44 }: { uri?: string | null; name?: string | null; size?: number }) {
  if (uri) return <img className="avatar" src={mediaUrl(uri)} alt="" width={size} height={size} style={{ width: size, height: size }} />
  return (
    <div className="avatar fallback" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {(name ?? '?').slice(0, 1)}
    </div>
  )
}

export function Chip({ label, tone = 'lilac' }: { label: string; tone?: string }) {
  return <span className={`chip ${tone}`}>{label}</span>
}

export function Photo({ src, alt, className }: { src?: string | null; alt?: string; className?: string }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) return <div className={`ph ${className ?? ''}`}>🐾</div>
  return <img className={className} src={mediaUrl(src)} alt={alt} onError={() => setBroken(true)} />
}

export function Top({ title }: { title: string }) {
  const nav = useNavigate()
  return (
    <div className="h-row pad-plain">
      <button className="icon-btn" type="button" onClick={() => nav(-1)}>‹</button>
      <h1 className="title" style={{ fontSize: 22 }}>{title}</h1>
      <span style={{ width: 46 }} />
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <h2 className="title">{title}</h2>
      {body ? <p className="sub">{body}</p> : null}
      {action}
    </div>
  )
}

function TabBar() {
  const loc = useLocation()
  const { t } = useI18n()
  const items = [
    { to: '/app', icon: '🐾', label: t('search'), match: loc.pathname === '/app' },
    { to: '/app/matches', icon: loc.pathname.startsWith('/app/matches') ? '♥' : '♡', label: t('match'), match: loc.pathname.startsWith('/app/matches') },
    { to: '/app/pets', icon: '✦', label: t('pets'), match: loc.pathname.startsWith('/app/pets') },
    { to: '/app/profile', icon: '☺', label: t('profile'), match: loc.pathname.startsWith('/app/profile') },
  ]
  return (
    <nav className="tabbar">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={`tab ${item.match ? 'on' : ''}`}>
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function Guard({ children }: { children: ReactNode }) {
  const { user, loading, onboarded } = useAuth()
  const { t } = useI18n()
  const loc = useLocation()
  if (loading) return <div className="screen pad"><p className="sub">{t('loading')}</p></div>
  if (!user && !onboarded && loc.pathname !== '/welcome') return <Navigate to="/welcome" replace />
  if (!user && loc.pathname !== '/login' && loc.pathname !== '/otp' && loc.pathname !== '/welcome') return <Navigate to="/login" replace />
  if (user && (loc.pathname === '/login' || loc.pathname === '/otp' || loc.pathname === '/welcome')) return <Navigate to="/app" replace />
  return children
}

export function AppLayout() {
  const loc = useLocation()
  const showTabs = ['/app', '/app/matches', '/app/pets', '/app/profile'].includes(loc.pathname)
  return (
    <Guard>
      <div className={`screen ${showTabs ? 'with-tabs' : ''}`}>
        <Outlet />
        {showTabs ? <TabBar /> : null}
      </div>
    </Guard>
  )
}
