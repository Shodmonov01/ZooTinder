import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import type { DocumentItem } from '../types'
import { Avatar, EmptyState, Top } from '../ui'

export function Profile() {
  const { user, logout, refreshMe } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const nav = useNavigate()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [city, setCity] = useState(user?.city ?? '')
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    setDisplayName(user?.displayName ?? '')
    setCity(user?.city ?? '')
  }, [user])
  return (
    <>
      <div className="profile-hero">
        <Avatar name={user?.displayName} uri={user?.avatarUrl} size={86} />
        <h1 className="title">{user?.displayName || t('owner')}</h1>
        <p className="sub">{user?.city ?? 'Toshkent'} · {t('phoneOk')}</p>
      </div>
      <div className="pad" style={{ paddingTop: 0 }}>
        <label className="field"><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label>
        <label className="field" style={{ marginTop: 8 }}><input value={city} onChange={(e) => setCity(e.target.value)} /></label>
        <div className="row" style={{ margin: '12px 0' }}>
          <button className={`btn sm ${locale === 'ru' ? '' : 'ghost'}`} onClick={() => { setLocale('ru'); api('/me', { method: 'PATCH', body: JSON.stringify({ locale: 'ru' }) }) }}>RU</button>
          <button className={`btn sm ${locale === 'uz' ? '' : 'ghost'}`} onClick={() => { setLocale('uz'); api('/me', { method: 'PATCH', body: JSON.stringify({ locale: 'uz' }) }) }}>UZ</button>
        </div>
        <button className="btn" onClick={async () => {
          await api('/me', { method: 'PATCH', body: JSON.stringify({ displayName, city }) })
          await refreshMe()
          setSaved(true)
        }}>{saved ? t('saved') : t('save')}</button>
      </div>
      <div className="menu">
        <button onClick={() => nav('/app/notifications')}><span><b>{t('notifications')}</b></span>›</button>
        <button onClick={() => nav('/app/calendar')}><span><b>{t('calendar')}</b></span>›</button>
        {user?.role === 'ADMIN' || user?.role === 'MODERATOR' ? (
          <button onClick={() => nav('/app/admin')}><span><b>{t('admin')}</b></span>›</button>
        ) : null}
        <button onClick={logout}><span><b style={{ color: 'var(--coral-dark)' }}>{t('logout')}</b><span className="tiny">{user?.phone}</span></span></button>
        <button onClick={async () => {
          try { await api('/me', { method: 'DELETE' }) } catch { /* ignore */ }
          await logout()
          nav('/welcome')
        }}><span><b style={{ color: 'var(--coral-dark)' }}>{t('deleteAccount')}</b></span></button>
      </div>
    </>
  )
}

export function Notifications() {
  const { t } = useI18n()
  const [items, setItems] = useState<{ id: string; title: string; body: string }[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    api<{ id: string; title: string; body: string }[]>('/notifications')
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : t('error')))
  }, [t])
  return (
    <div className="pad">
      <Top title={t('notifications')} />
      {error ? <EmptyState title={error} /> : null}
      {items.length === 0 && !error ? <p className="sub">{t('noItems')}</p> : null}
      <div className="list" style={{ padding: 0 }}>
        {items.map((item) => (
          <div key={item.id} className="cell"><div><b>{item.title}</b><div className="tiny">{item.body}</div></div></div>
        ))}
      </div>
    </div>
  )
}

export function Admin() {
  const { t } = useI18n()
  const [dash, setDash] = useState<{ users: number; pets: number; matches: number; pendingVerifications: number } | null>(null)
  const [queue, setQueue] = useState<DocumentItem[]>([])
  const [error, setError] = useState('')
  async function load() {
    try {
      const [nextDash, nextQueue] = await Promise.all([
        api<{ users: number; pets: number; matches: number; pendingVerifications: number }>('/admin/dashboard'),
        api<DocumentItem[]>('/admin/verifications'),
      ])
      setDash(nextDash)
      setQueue(nextQueue)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    }
  }
  useEffect(() => { load() }, [])
  return (
    <div className="pad">
      <Top title={t('admin')} />
      {error ? <EmptyState title={error} /> : null}
      {dash ? <p className="sub">{dash.users} · {dash.pets} · match {dash.matches} · {dash.pendingVerifications}</p> : null}
      {queue.length === 0 && !error ? <p className="sub">{t('noItems')}</p> : null}
      {queue.map((item) => (
        <div key={item.id} className="cell" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div><b>{item.pet?.name} · {item.type}</b><div className="tiny">{item.status}</div></div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn sm" onClick={async () => { await api(`/admin/verifications/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'VERIFIED' }) }); await load() }}>{t('approve')}</button>
            <button className="btn sm ghost" onClick={async () => { await api(`/admin/verifications/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'REJECTED', reason: 'Недостаточно данных' }) }); await load() }}>{t('reject')}</button>
            <button className="btn sm ghost" onClick={async () => { await api(`/admin/verifications/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'RESUBMISSION_REQUESTED' }) }); await load() }}>{t('resubmit')}</button>
          </div>
        </div>
      ))}
    </div>
  )
}
