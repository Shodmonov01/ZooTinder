import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import { Guard } from '../ui'

export function Welcome() {
  const { markOnboarded } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const [heroOk, setHeroOk] = useState(true)
  return (
    <Guard>
      <div className="screen">
        <div className="hero-photo">
          {heroOk ? (
            <img
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&w=900"
              alt=""
              onError={() => setHeroOk(false)}
            />
          ) : (
            <div className="ph" style={{ height: '100%', fontSize: 88 }}>🐕</div>
          )}
          <div className="float-chip">🐾 Match</div>
        </div>
        <div className="sheet">
          <div className="kicker">BreedMatch</div>
          <h1 className="title">{t('welcomeTitle')}</h1>
          <p className="sub">{t('welcomeBody')}</p>
          <button className="btn" onClick={() => { markOnboarded(); nav('/login') }}>{t('start')}</button>
        </div>
      </div>
    </Guard>
  )
}

export function Login() {
  const [phone, setPhone] = useState('+998')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { requestOtp } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  return (
    <Guard>
      <div className="screen pad-plain" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="hello">{t('hello')} 👋</div>
        <h1 className="title">{t('loginTitle')}</h1>
        <p className="sub">{t('loginHint')}</p>
        <label className="field">
          <span>☎</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        {error ? <div className="err">{error}</div> : null}
        <button className="btn" disabled={loading} onClick={async () => {
          try {
            setLoading(true); setError('')
            await requestOtp(phone)
            nav(`/otp?phone=${encodeURIComponent(phone)}`)
          } catch (err) {
            setError(err instanceof Error ? err.message : t('error'))
          } finally { setLoading(false) }
        }}>{loading ? t('sending') : t('getCode')}</button>
        <p className="tiny" style={{ textAlign: 'center' }}>{t('demoLogin')}</p>
        <div className="demo">
          {['+998901111111', '+998902222222'].map((item) => (
            <button key={item} type="button" onClick={() => setPhone(item)}>{item}</button>
          ))}
        </div>
      </div>
    </Guard>
  )
}

export function Otp() {
  const phone = new URLSearchParams(useLocation().search).get('phone') || ''
  const [code, setCode] = useState('111111')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { verifyOtp } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  return (
    <Guard>
      <div className="screen pad-plain" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="kicker">{t('otpTitle')}</div>
        <h1 className="title">{t('otpTitle')}</h1>
        <p className="sub">{t('otpSent')} {phone}</p>
        <input className="otp-input" value={code} onChange={(e) => setCode(e.target.value)} />
        {error ? <div className="err">{error}</div> : null}
        <button className="btn" disabled={loading} onClick={async () => {
          try {
            setLoading(true)
            await verifyOtp(phone, code)
            nav('/app')
          } catch (err) {
            setError(err instanceof Error ? err.message : t('error'))
          } finally { setLoading(false) }
        }}>{loading ? t('checking') : t('enter')}</button>
      </div>
    </Guard>
  )
}
