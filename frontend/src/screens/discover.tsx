import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { api } from '../api'
import { useI18n } from '../i18n'
import type { Pet, SearchPreference, Sex, Species } from '../types'
import { Avatar, Chip, EmptyState, Photo, Top } from '../ui'

export function Discover() {
  const { user } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const [pets, setPets] = useState<Pet[]>([])
  const [sourcePetId, setSourcePetId] = useState<string | null>(null)
  const [items, setItems] = useState<Pet[]>([])
  const [error, setError] = useState('')
  const [match, setMatch] = useState(false)
  const [busy, setBusy] = useState(false)
  const [dx, setDx] = useState(0)
  const startX = useRef<number | null>(null)
  const current = items[0]

  async function load(petId?: string) {
    setError('')
    try {
      const mine = await api<Pet[]>('/pets')
      setPets(mine)
      const chosen = petId || sourcePetId || mine[0]?.id
      if (chosen) setSourcePetId(chosen)
      const data = await api<{ items: Pet[]; sourcePetId: string }>(`/discover${chosen ? `?petId=${chosen}` : ''}`)
      setItems(data.items)
      setSourcePetId(data.sourcePetId)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    }
  }

  useEffect(() => { load() }, [])

  async function swipe(action: 'LIKE' | 'PASS') {
    if (!current || !sourcePetId || busy) return
    setBusy(true)
    try {
      const result = await api<{ match: { id: string } | null }>('/likes', {
        method: 'POST',
        body: JSON.stringify({ sourcePetId, targetPetId: current.id, action }),
      })
      setItems((prev) => prev.slice(1))
      setDx(0)
      if (result.match) setMatch(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="h-row pad-plain" style={{ paddingBottom: 8 }}>
        <div className="row">
          <Avatar name={user?.displayName} uri={user?.avatarUrl} size={46} />
          <div>
            <b>{t('hi')}, {user?.displayName || 'друг'}</b>
            <div className="tiny">{t('lookingToday')}</div>
          </div>
        </div>
        <button className="icon-btn" onClick={() => nav('/app/filters')}>⚙</button>
      </div>
      {pets.length > 1 ? (
        <div className="chips" style={{ padding: '0 18px 8px' }}>
          {pets.map((pet) => (
            <button key={pet.id} className={`chip ${sourcePetId === pet.id ? 'coral' : 'lilac'}`} onClick={() => load(pet.id)}>
              {pet.name}
            </button>
          ))}
        </div>
      ) : null}
      {error ? (
        <EmptyState title={error} action={<button className="btn" onClick={() => nav('/app/pets')}>{t('toPets')}</button>} />
      ) : !current ? (
        <EmptyState title={t('quiet')} body={t('quietBody')} action={<button className="btn" onClick={() => load()}>{t('refresh')}</button>} />
      ) : (
        <div className="deck">
          <article
            className={`card-pet ${busy ? 'busy' : ''}`}
            style={{ transform: `translateX(${dx}px) rotate(${dx / 18}deg)` }}
            onPointerDown={(e) => { startX.current = e.clientX }}
            onPointerMove={(e) => { if (startX.current !== null) setDx(e.clientX - startX.current) }}
            onPointerUp={() => {
              if (dx > 90) swipe('LIKE')
              else if (dx < -90) swipe('PASS')
              else setDx(0)
              startX.current = null
            }}
            onPointerLeave={() => { if (startX.current !== null) { setDx(0); startX.current = null } }}
          >
            <Photo src={current.photos[0]?.url} alt={current.name} />
            <div className="shade" />
            <div className="loc">📍 {current.distanceKm ?? '—'} км · {current.city}</div>
            <div className="card-meta" onClick={() => nav(`/app/pet/${current.id}`)}>
              <h2>{current.name} <span style={{ fontWeight: 600, fontSize: 26 }}>{Math.floor(current.ageYears)}</span></h2>
              <p>{current.breed?.nameRu} · {current.sex === 'FEMALE' ? t('girl') : t('boy')}</p>
              {current.score !== undefined ? <p className="tiny">{t('relevance')} · {Math.round(current.score * 100)}%</p> : null}
              <div className="chips">
                {current.badges.healthVerified ? <Chip label={t('health')} tone="glass" /> : null}
                {current.badges.pedigreeVerified ? <Chip label={t('pedigree')} tone="glass" /> : null}
                {current.badges.dnaTested ? <Chip label={t('dna')} tone="glass" /> : null}
              </div>
            </div>
            <div className="actions">
              <button className="circle" disabled={busy} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); swipe('PASS') }}>✕</button>
              <button className="circle like" disabled={busy} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); swipe('LIKE') }}>♥</button>
            </div>
          </article>
        </div>
      )}
      {match ? (
        <div className="modal" onClick={() => setMatch(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48 }}>💞</div>
            <h2 className="title">{t('itsMatch')}</h2>
            <p className="sub">{t('matchBody')}</p>
            <button className="btn" onClick={() => nav('/app/matches')}>{t('toChats')}</button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function Filters() {
  const { t } = useI18n()
  const nav = useNavigate()
  const [pets, setPets] = useState<Pet[]>([])
  const [species, setSpecies] = useState<Species[]>([])
  const [petId, setPetId] = useState('')
  const [radiusKm, setRadiusKm] = useState(40)
  const [sex, setSex] = useState<Sex | ''>('')
  const [breedId, setBreedId] = useState('')
  const [health, setHealth] = useState(false)
  const [pedigree, setPedigree] = useState(false)
  const [verified, setVerified] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const pet = pets.find((item) => item.id === petId) ?? pets[0]
  const breeds = species[0]?.breeds ?? []

  useEffect(() => {
    Promise.all([api<Pet[]>('/pets'), api<Species[]>('/species', { auth: false })])
      .then(([nextPets, nextSpecies]) => {
        setPets(nextPets)
        setSpecies(nextSpecies)
        const first = nextPets[0]
        if (first) {
          setPetId(first.id)
          const pref = first.searchPreference as SearchPreference | undefined
          if (pref) {
            setRadiusKm(pref.radiusKm ?? 40)
            setSex(pref.sex ?? '')
            setBreedId(pref.breedIds?.[0] ?? '')
            setHealth(Boolean(pref.healthVerified))
            setPedigree(Boolean(pref.pedigreeVerified))
            setVerified(Boolean(pref.verifiedOnly))
          }
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : t('error')))
  }, [t])

  return (
    <div className="pad">
      <Top title={`${t('filters')} ${pet?.name ?? ''}`} />
      <p className="sub">{t('radius')}</p>
      {error ? <div className="err">{error}</div> : null}
      {pets.length > 1 ? (
        <div className="chips">
          {pets.map((item) => (
            <button key={item.id} className={`chip ${petId === item.id ? 'coral' : 'lilac'}`} onClick={() => setPetId(item.id)}>{item.name}</button>
          ))}
        </div>
      ) : null}
      <div className="chips">
        {[15, 40, 80].map((value) => (
          <button key={value} className={`btn sm ${radiusKm === value ? '' : 'ghost'}`} onClick={() => setRadiusKm(value)}>{value} км</button>
        ))}
      </div>
      <div className="row">
        <button className={`btn sm ${sex === 'FEMALE' ? '' : 'ghost'}`} onClick={() => setSex('FEMALE')}>{t('girl')}</button>
        <button className={`btn sm ${sex === 'MALE' ? '' : 'ghost'}`} onClick={() => setSex('MALE')}>{t('boy')}</button>
      </div>
      <div className="chips">
        {breeds.map((breed) => (
          <button key={breed.id} className={`chip ${breedId === breed.id ? 'coral' : 'lilac'}`} onClick={() => setBreedId(breed.id)}>{breed.nameRu}</button>
        ))}
      </div>
      <label className="toggle"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> Verified only</label>
      <label className="toggle"><input type="checkbox" checked={health} onChange={(e) => setHealth(e.target.checked)} /> {t('health')}</label>
      <label className="toggle"><input type="checkbox" checked={pedigree} onChange={(e) => setPedigree(e.target.checked)} /> {t('pedigree')}</label>
      <button className="btn" disabled={!pet} onClick={async () => {
        if (!pet) return
        await api(`/pets/${pet.id}/preferences`, {
          method: 'PATCH',
          body: JSON.stringify({
            radiusKm,
            sex: sex || undefined,
            breedIds: breedId ? [breedId] : [],
            verifiedOnly: verified,
            healthVerified: health,
            pedigreeVerified: pedigree,
          }),
        })
        setSaved(true)
        nav('/app')
      }}>{saved ? t('saved') : t('save')}</button>
    </div>
  )
}
