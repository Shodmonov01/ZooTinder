import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useAuth } from './auth'
import { api } from './api'
import type { ChatItem, MatchItem, Message, Pet, Species } from './types'
import './styles.css'

export function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="desk">
      <div className="phone">{children}</div>
    </div>
  )
}

function Avatar({ uri, name, size = 44 }: { uri?: string | null; name?: string | null; size?: number }) {
  if (uri) return <img className="avatar" src={uri} alt="" width={size} height={size} style={{ width: size, height: size }} />
  return (
    <div className="avatar fallback" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {(name ?? '?').slice(0, 1)}
    </div>
  )
}

function Chip({ label, tone = 'lilac' }: { label: string; tone?: string }) {
  return <span className={`chip ${tone}`}>{label}</span>
}

function Photo({ src, alt, className }: { src?: string | null; alt?: string; className?: string }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) return <div className={`ph ${className ?? ''}`}>🐾</div>
  return <img className={className} src={src} alt={alt} onError={() => setBroken(true)} />
}

function Top({ title }: { title: string }) {
  const nav = useNavigate()
  return (
    <div className="h-row pad-plain">
      <button className="icon-btn" type="button" onClick={() => nav(-1)}>‹</button>
      <h1 className="title" style={{ fontSize: 22 }}>{title}</h1>
      <span style={{ width: 46 }} />
    </div>
  )
}

function TabBar() {
  const loc = useLocation()
  const items = [
    { to: '/app', icon: '🐾', label: 'Поиск', match: loc.pathname === '/app' },
    { to: '/app/matches', icon: loc.pathname.startsWith('/app/matches') ? '♥' : '♡', label: 'Match', match: loc.pathname.startsWith('/app/matches') },
    { to: '/app/pets', icon: '✦', label: 'Питомцы', match: loc.pathname.startsWith('/app/pets') },
    { to: '/app/profile', icon: '☺', label: 'Профиль', match: loc.pathname.startsWith('/app/profile') },
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

function Guard({ children }: { children: ReactNode }) {
  const { user, loading, onboarded } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="screen pad"><p className="sub">Загрузка…</p></div>
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

export function Welcome() {
  const { markOnboarded } = useAuth()
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
          <div className="float-chip">🐾 Match с проверкой здоровья</div>
        </div>
        <div className="sheet">
          <div className="kicker">BreedMatch</div>
          <h1 className="title">Найди пару для своего питомца</h1>
          <p className="sub">Карточки, взаимный Match и безопасный чат. Родословная и прививки — как бейджи доверия, не как диагноз.</p>
          <button className="btn" onClick={() => { markOnboarded(); nav('/login') }}>Начать</button>
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
  const nav = useNavigate()
  return (
    <Guard>
      <div className="screen pad-plain" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="hello">С возвращением 👋</div>
        <h1 className="title">Войди по номеру</h1>
        <p className="sub">Код придёт в SMS. В dev всегда 111111.</p>
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
            setError(err instanceof Error ? err.message : 'Ошибка')
          } finally { setLoading(false) }
        }}>{loading ? 'Отправляем…' : 'Получить код'}</button>
        <p className="tiny" style={{ textAlign: 'center' }}>Быстрый вход в демо</p>
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
  const nav = useNavigate()
  return (
    <Guard>
      <div className="screen pad-plain" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="kicker">Почти внутри</div>
        <h1 className="title">Код из SMS</h1>
        <p className="sub">Отправили на {phone}</p>
        <input className="otp-input" value={code} onChange={(e) => setCode(e.target.value)} />
        {error ? <div className="err">{error}</div> : null}
        <button className="btn" disabled={loading} onClick={async () => {
          try {
            setLoading(true)
            await verifyOtp(phone, code)
            nav('/app')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка')
          } finally { setLoading(false) }
        }}>{loading ? 'Проверяем…' : 'Войти'}</button>
      </div>
    </Guard>
  )
}

export function Discover() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [items, setItems] = useState<Pet[]>([])
  const [sourcePetId, setSourcePetId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [match, setMatch] = useState(false)
  const current = items[0]

  function load() {
    setError('')
    api<{ items: Pet[]; sourcePetId: string }>('/discover')
      .then((data) => { setItems(data.items); setSourcePetId(data.sourcePetId) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
  }

  useEffect(() => { load() }, [])

  async function swipe(action: 'LIKE' | 'PASS') {
    if (!current || !sourcePetId) return
    const result = await api<{ match: { id: string } | null }>('/likes', {
      method: 'POST',
      body: JSON.stringify({ sourcePetId, targetPetId: current.id, action }),
    })
    setItems((prev) => prev.slice(1))
    if (result.match) setMatch(true)
  }

  return (
    <>
      <div className="h-row pad-plain" style={{ paddingBottom: 8 }}>
        <div className="row">
          <Avatar name={user?.displayName} uri={user?.avatarUrl} size={46} />
          <div>
            <b>Привет, {user?.displayName || 'друг'}</b>
            <div className="tiny">Кто сегодня понравится?</div>
          </div>
        </div>
        <button className="icon-btn" onClick={() => nav('/app/filters')}>⚙</button>
      </div>
      {error ? (
        <div className="empty">
          <h2 className="title">{error}</h2>
          <button className="btn" onClick={() => nav('/app/pets')}>К питомцам</button>
        </div>
      ) : !current ? (
        <div className="empty">
          <h2 className="title">Пока тихо</h2>
          <p className="sub">Расширь радиус или зайди позже.</p>
          <button className="btn" onClick={load}>Обновить</button>
        </div>
      ) : (
        <div className="deck">
          <article className="card-pet" onClick={() => nav(`/app/pet/${current.id}`)}>
            <Photo src={current.photos[0]?.url} alt={current.name} />
            <div className="shade" />
            <div className="loc">📍 {current.distanceKm ?? '—'} км · {current.city}</div>
            <div className="card-meta">
              <h2>{current.name} <span style={{ fontWeight: 600, fontSize: 26 }}>{Math.floor(current.ageYears)}</span></h2>
              <p>{current.breed?.nameRu} · {current.sex === 'FEMALE' ? 'девочка' : 'мальчик'}</p>
              <div className="chips">
                {current.badges.healthVerified ? <Chip label="Health" tone="glass" /> : null}
                {current.badges.pedigreeVerified ? <Chip label="Pedigree" tone="glass" /> : null}
                {current.badges.dnaTested ? <Chip label="DNA" tone="glass" /> : null}
              </div>
            </div>
            <div className="actions">
              <button className="circle" onClick={(e) => { e.stopPropagation(); swipe('PASS') }}>✕</button>
              <button className="circle like" onClick={(e) => { e.stopPropagation(); swipe('LIKE') }}>♥</button>
            </div>
          </article>
        </div>
      )}
      {match ? (
        <div className="modal" onClick={() => setMatch(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48 }}>💞</div>
            <h2 className="title">Это взаимно!</h2>
            <p className="sub">Можно открыть чат и аккуратно обсудить вязку.</p>
            <button className="btn" onClick={() => nav('/app/matches')}>К чатам</button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function Matches() {
  const nav = useNavigate()
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [chats, setChats] = useState<ChatItem[]>([])
  useEffect(() => {
    Promise.all([api<MatchItem[]>('/matches'), api<ChatItem[]>('/chats')]).then(([m, c]) => {
      setMatches(m); setChats(c)
    })
  }, [])
  const list = chats.length ? chats : matches.map((item) => ({ id: item.chatId, otherPet: item.otherPet, lastMessage: null }))
  return (
    <>
      <h1 className="title" style={{ padding: '12px 20px 0' }}>Твои Match</h1>
      <div className="stories">
        {matches.map((item) => (
          <button key={item.id} className="story" onClick={() => nav(`/app/chat/${item.chatId}`)}>
            <Photo src={item.otherPet.photos[0]?.url} alt="" />
            <b>{item.otherPet.name}</b>
          </button>
        ))}
      </div>
      <div className="list">
        {list.length === 0 ? <p className="sub">Поставь взаимный Like — здесь появится чат</p> : null}
        {list.map((item) => (
          <button key={item.id} className="cell" onClick={() => nav(`/app/chat/${item.id}`)}>
            <Photo src={item.otherPet.photos[0]?.url} alt="" />
            <div className="grow" style={{ textAlign: 'left' }}>
              <b>{item.otherPet.name}</b>
              <div className="tiny">{item.lastMessage?.text || item.otherPet.breed?.nameRu}</div>
            </div>
            <span className="sub">›</span>
          </button>
        ))}
      </div>
    </>
  )
}

export function Pets() {
  const nav = useNavigate()
  const [pets, setPets] = useState<Pet[]>([])
  useEffect(() => { api<Pet[]>('/pets').then(setPets).catch(() => setPets([])) }, [])
  return (
    <>
      <div className="h-row pad-plain">
        <h1 className="title">Моя стая</h1>
        <button className="btn sm" onClick={() => nav('/app/pets/new')}>+ Добавить</button>
      </div>
      <div className="list">
        {pets.length === 0 ? <p className="sub">Добавь первого питомца — и Discover оживёт</p> : null}
        {pets.map((pet) => (
          <button key={pet.id} className="cell" onClick={() => nav(`/app/pet/${pet.id}`)}>
            <Photo src={pet.photos[0]?.url} alt="" />
            <div className="grow" style={{ textAlign: 'left' }}>
              <b>{pet.name}</b>
              <div className="tiny">{pet.breed?.nameRu}</div>
              <div className="chips" style={{ marginTop: 8 }}>
                <Chip label={pet.isPublished ? 'В поиске' : 'Черновик'} tone={pet.isPublished ? 'mint' : 'coral'} />
                <Chip label={`${pet.completeness}%`} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

export function Profile() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  return (
    <>
      <div className="profile-hero">
        <Avatar name={user?.displayName} uri={user?.avatarUrl} size={86} />
        <h1 className="title">{user?.displayName || 'Владелец'}</h1>
        <p className="sub">{user?.city ?? 'Toshkent'} · телефон подтверждён</p>
      </div>
      <div className="menu">
        <button onClick={() => nav('/app/notifications')}><span><b>Уведомления</b><span className="tiny">Match, сообщения, проверка</span></span>›</button>
        {user?.role === 'ADMIN' || user?.role === 'MODERATOR' ? (
          <button onClick={() => nav('/app/admin')}><span><b>Админка</b><span className="tiny">Очередь документов</span></span>›</button>
        ) : null}
        <button onClick={logout}><span><b style={{ color: 'var(--coral-dark)' }}>Выйти</b><span className="tiny">{user?.phone}</span></span></button>
      </div>
    </>
  )
}

export function PetDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [pet, setPet] = useState<Pet | null>(null)
  useEffect(() => { if (id) api<Pet>(`/pets/${id}`).then(setPet) }, [id])
  if (!pet) return <div className="pad">Загрузка…</div>
  const mine = pet.ownerId === user?.id
  return (
    <div className="pet-page">
      <div className="pet-sky">
        <button className="back" onClick={() => nav(-1)}>‹</button>
        <Photo src={pet.photos[0]?.url} alt={pet.name} />
      </div>
      <div className="pet-sheet">
        <h1 className="title">{pet.name}</h1>
        <p className="sub">{pet.breed?.nameRu} · {pet.sex === 'FEMALE' ? 'девочка' : 'мальчик'} · {Math.floor(pet.ageYears)} лет</p>
        <div className="chips">
          {pet.badges.healthVerified ? <Chip label="Health" tone="mint" /> : null}
          {pet.badges.pedigreeVerified ? <Chip label="Pedigree" /> : null}
          <Chip label={pet.city} tone="blue" />
        </div>
        <p>{pet.bio}</p>
        <p className="tiny">Данные о здоровье проверяет модератор. Это не ветеринарное заключение.</p>
        {mine ? <button className="btn ghost" onClick={() => nav(`/app/documents/${pet.id}`)}>Документы</button> : null}
      </div>
    </div>
  )
}

export function Chat() {
  const { id } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  useEffect(() => {
    if (!id) return
    api<Message[]>(`/chats/${id}/messages`).then(setMessages).catch(() => setMessages([]))
  }, [id])
  return (
    <div className="chat-page">
      <Top title="Чат" />
      <div className="bubbles">
        {messages.map((item) => (
          <div key={item.id} className={`bubble ${item.senderId === user?.id ? 'me' : 'them'}`}>{item.text}</div>
        ))}
      </div>
      <form className="composer" onSubmit={async (e: FormEvent) => {
        e.preventDefault()
        if (!text.trim() || !id) return
        await api(`/chats/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) })
        setText('')
        setMessages(await api<Message[]>(`/chats/${id}/messages`))
      }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Напиши сообщение" />
        <button className="send" type="submit">➤</button>
      </form>
    </div>
  )
}

export function NewPet() {
  const nav = useNavigate()
  const [species, setSpecies] = useState<Species[]>([])
  const [name, setName] = useState('')
  const [breedId, setBreedId] = useState('')
  const [sex, setSex] = useState<'MALE' | 'FEMALE'>('FEMALE')
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')
  const breeds = species[0]?.breeds ?? []
  useEffect(() => {
    api<Species[]>('/species', { auth: false }).then((data) => {
      setSpecies(data)
      setBreedId(data[0]?.breeds[0]?.id ?? '')
    })
  }, [])
  return (
    <div className="pad">
      <Top title="Новый питомец" />
      <label className="sub">Имя</label>
      <label className="field"><input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="chips">
        {breeds.map((breed) => (
          <button key={breed.id} className={`chip ${breedId === breed.id ? 'coral' : 'lilac'}`} onClick={() => setBreedId(breed.id)}>{breed.nameRu}</button>
        ))}
      </div>
      <div className="row">
        <button className={`btn sm ${sex === 'FEMALE' ? '' : 'ghost'}`} onClick={() => setSex('FEMALE')}>Девочка</button>
        <button className={`btn sm ${sex === 'MALE' ? '' : 'ghost'}`} onClick={() => setSex('MALE')}>Мальчик</button>
      </div>
      <label className="field"><input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Характер" /></label>
      {error ? <div className="err">{error}</div> : null}
      <button className="btn" onClick={async () => {
        try {
          const pet = await api<Pet>('/pets', {
            method: 'POST',
            body: JSON.stringify({
              name,
              speciesId: species[0]?.id,
              breedId,
              sex,
              birthDate: '2023-01-01',
              city: 'Toshkent',
              bio,
              latitude: 41.2995,
              longitude: 69.2401,
            }),
          })
          nav(`/app/pet/${pet.id}`)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Ошибка')
        }
      }}>Создать</button>
    </div>
  )
}

export function Filters() {
  const [pets, setPets] = useState<Pet[]>([])
  const [radiusKm, setRadiusKm] = useState(40)
  const [saved, setSaved] = useState(false)
  useEffect(() => { api<Pet[]>('/pets').then(setPets) }, [])
  const pet = pets[0]
  return (
    <div className="pad">
      <Top title={`Поиск для ${pet?.name ?? 'питомца'}`} />
      <p className="sub">Радиус вокруг тебя. Вид и пол — жёсткие фильтры.</p>
      <div className="chips">
        {[15, 40, 80].map((value) => (
          <button key={value} className={`btn sm ${radiusKm === value ? '' : 'ghost'}`} onClick={() => setRadiusKm(value)}>{value} км</button>
        ))}
      </div>
      <button className="btn" disabled={!pet} onClick={async () => {
        if (!pet) return
        await api(`/pets/${pet.id}/preferences`, { method: 'PATCH', body: JSON.stringify({ radiusKm }) })
        setSaved(true)
      }}>{saved ? 'Сохранено' : 'Сохранить'}</button>
    </div>
  )
}

export function Notifications() {
  const [items, setItems] = useState<{ id: string; title: string; body: string }[]>([])
  useEffect(() => { api<{ id: string; title: string; body: string }[]>('/notifications').then(setItems) }, [])
  return (
    <div className="pad">
      <Top title="Уведомления" />
      <div className="list" style={{ padding: 0 }}>
        {items.map((item) => (
          <div key={item.id} className="cell"><div><b>{item.title}</b><div className="tiny">{item.body}</div></div></div>
        ))}
      </div>
    </div>
  )
}

export function Documents() {
  const { petId } = useParams()
  const [items, setItems] = useState<{ id: string; type: string; status: string }[]>([])
  useEffect(() => { if (petId) api<{ id: string; type: string; status: string }[]>(`/pets/${petId}/documents`).then(setItems) }, [petId])
  return (
    <div className="pad">
      <Top title="Документы" />
      {items.map((item) => (
        <div key={item.id} className="cell"><div><b>{item.type}</b><div className="tiny">{item.status}</div></div></div>
      ))}
    </div>
  )
}

export function Admin() {
  const [dash, setDash] = useState<{ users: number; pets: number; matches: number; pendingVerifications: number } | null>(null)
  useEffect(() => { api<{ users: number; pets: number; matches: number; pendingVerifications: number }>('/admin/dashboard').then(setDash) }, [])
  return (
    <div className="pad">
      <Top title="Админка" />
      {dash ? <p className="sub">Пользователи {dash.users} · питомцы {dash.pets} · match {dash.matches} · на проверке {dash.pendingVerifications}</p> : null}
    </div>
  )
}
