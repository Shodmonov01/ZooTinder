import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import type { BreedingEvent, DocumentItem, Pet, Species } from '../types'
import { Chip, EmptyState, Photo, Top } from '../ui'

export function Pets() {
  const nav = useNavigate()
  const { t } = useI18n()
  const [pets, setPets] = useState<Pet[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    api<Pet[]>('/pets').then(setPets).catch((err) => setError(err instanceof Error ? err.message : t('error')))
  }, [t])
  return (
    <>
      <div className="h-row pad-plain">
        <h1 className="title">{t('myPack')}</h1>
        <button className="btn sm" onClick={() => nav('/app/pets/new')}>{t('add')}</button>
      </div>
      {error ? <EmptyState title={error} /> : null}
      <div className="list">
        {pets.length === 0 && !error ? <p className="sub">{t('firstPet')}</p> : null}
        {pets.map((pet) => (
          <button key={pet.id} className="cell" onClick={() => nav(`/app/pet/${pet.id}`)}>
            <Photo src={pet.photos[0]?.url} alt="" />
            <div className="grow" style={{ textAlign: 'left' }}>
              <b>{pet.name}</b>
              <div className="tiny">{pet.breed?.nameRu}</div>
              <div className="chips" style={{ marginTop: 8 }}>
                <Chip label={pet.isPublished ? t('inSearch') : t('draft')} tone={pet.isPublished ? 'mint' : 'coral'} />
                <Chip label={`${pet.completeness}%`} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

export function NewPet() {
  const nav = useNavigate()
  const { t } = useI18n()
  const [species, setSpecies] = useState<Species[]>([])
  const [name, setName] = useState('')
  const [breedId, setBreedId] = useState('')
  const [sex, setSex] = useState<'MALE' | 'FEMALE'>('FEMALE')
  const [birthDate, setBirthDate] = useState('2023-01-01')
  const [city, setCity] = useState('Toshkent')
  const [bio, setBio] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const breeds = species[0]?.breeds ?? []
  useEffect(() => {
    api<Species[]>('/species', { auth: false }).then((data) => {
      setSpecies(data)
      setBreedId(data[0]?.breeds[0]?.id ?? '')
    })
  }, [])
  return (
    <div className="pad">
      <Top title={t('newPet')} />
      <label className="sub">{t('name')}</label>
      <label className="field"><input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="chips">
        {breeds.map((breed) => (
          <button key={breed.id} className={`chip ${breedId === breed.id ? 'coral' : 'lilac'}`} onClick={() => setBreedId(breed.id)}>{breed.nameRu}</button>
        ))}
      </div>
      <div className="row">
        <button className={`btn sm ${sex === 'FEMALE' ? '' : 'ghost'}`} onClick={() => setSex('FEMALE')}>{t('girl')}</button>
        <button className={`btn sm ${sex === 'MALE' ? '' : 'ghost'}`} onClick={() => setSex('MALE')}>{t('boy')}</button>
      </div>
      <label className="sub">{t('birth')}</label>
      <label className="field"><input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label>
      <label className="sub">{t('city')}</label>
      <label className="field"><input value={city} onChange={(e) => setCity(e.target.value)} /></label>
      <label className="field"><input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="bio" /></label>
      <label className="sub">{t('photo')}</label>
      <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      {error ? <div className="err">{error}</div> : null}
      <button className="btn" disabled={loading} onClick={async () => {
        try {
          setLoading(true)
          const pet = await api<Pet>('/pets', {
            method: 'POST',
            body: JSON.stringify({
              name,
              speciesId: species[0]?.id,
              breedId,
              sex,
              birthDate,
              city,
              bio,
              latitude: 41.2995,
              longitude: 69.2401,
            }),
          })
          if (photo) {
            const form = new FormData()
            form.append('file', photo)
            await api(`/pets/${pet.id}/photos`, { method: 'POST', body: form })
            await api(`/pets/${pet.id}`, { method: 'PATCH', body: JSON.stringify({ isPublished: true }) })
          }
          nav(`/app/pet/${pet.id}`)
        } catch (err) {
          setError(err instanceof Error ? err.message : t('error'))
        } finally {
          setLoading(false)
        }
      }}>{t('create')}</button>
    </div>
  )
}

export function PetDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const [pet, setPet] = useState<Pet | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => { if (id) api<Pet>(`/pets/${id}`).then(setPet).catch((err) => setError(err instanceof Error ? err.message : t('error'))) }, [id, t])
  if (error) return <EmptyState title={error} />
  if (!pet) return <div className="pad">{t('loading')}</div>
  const mine = pet.ownerId === user?.id
  const photo = pet.photos[photoIndex] ?? pet.photos[0]
  return (
    <div className="pet-page">
      <div className="pet-sky">
        <button className="back" onClick={() => nav(-1)}>‹</button>
        <Photo src={photo?.url} alt={pet.name} />
      </div>
      {pet.photos.length > 1 ? (
        <div className="gallery">
          {pet.photos.map((item, index) => (
            <button key={item.id} className={index === photoIndex ? 'on' : ''} onClick={() => setPhotoIndex(index)}>
              <Photo src={item.url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
      <div className="pet-sheet">
        <h1 className="title">{pet.name}</h1>
        <p className="sub">{pet.breed?.nameRu} · {pet.sex === 'FEMALE' ? t('girl') : t('boy')} · {Math.floor(pet.ageYears)}</p>
        <div className="chips">
          {pet.badges.healthVerified ? <Chip label={t('health')} tone="mint" /> : null}
          {pet.badges.pedigreeVerified ? <Chip label={t('pedigree')} /> : null}
          <Chip label={pet.city} tone="blue" />
        </div>
        <p>{pet.bio}</p>
        <p className="tiny">{t('relevance')}</p>
        {mine ? (
          <>
            <button className="btn ghost" onClick={() => nav(`/app/documents/${pet.id}`)}>{t('documents')}</button>
            <button className="btn ghost" onClick={() => nav('/app/calendar')}>{t('calendar')}</button>
            <button className="btn" onClick={async () => {
              const next = await api<Pet>(`/pets/${pet.id}`, { method: 'PATCH', body: JSON.stringify({ isPublished: !pet.isPublished }) })
              setPet(next)
            }}>{pet.isPublished ? t('inSearch') : t('publish')}</button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function Documents() {
  const { petId } = useParams()
  const { t } = useI18n()
  const [items, setItems] = useState<DocumentItem[]>([])
  const [type, setType] = useState('VACCINATION')
  const [error, setError] = useState('')
  async function load() {
    if (!petId) return
    try {
      setItems(await api<DocumentItem[]>(`/pets/${petId}/documents`))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    }
  }
  useEffect(() => { load() }, [petId])
  return (
    <div className="pad">
      <Top title={t('documents')} />
      {error ? <div className="err">{error}</div> : null}
      {items.length === 0 ? <p className="sub">{t('noItems')}</p> : null}
      {items.map((item) => (
        <div key={item.id} className="cell"><div><b>{item.type}</b><div className="tiny">{item.status}</div></div></div>
      ))}
      <select className="field" style={{ height: 48, padding: '0 12px' }} value={type} onChange={(e) => setType(e.target.value)}>
        {['VACCINATION', 'HEALTH_CERTIFICATE', 'PEDIGREE', 'DNA_TEST'].map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <input type="file" accept="image/*,.pdf" onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file || !petId) return
        const form = new FormData()
        form.append('file', file)
        form.append('type', type)
        form.append('issuer', 'Clinic')
        await api(`/pets/${petId}/documents`, { method: 'POST', body: form })
        await load()
      }} />
    </div>
  )
}

export function Calendar() {
  const { t } = useI18n()
  const [items, setItems] = useState<BreedingEvent[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    api<BreedingEvent[]>('/breeding-events')
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : t('error')))
  }, [t])
  return (
    <div className="pad">
      <Top title={t('calendar')} />
      {error ? <EmptyState title={error} /> : null}
      {items.length === 0 && !error ? <p className="sub">{t('noItems')}</p> : null}
      {items.map((item) => (
        <div key={item.id} className="cell">
          <div>
            <b>{item.eventType}</b>
            <div className="tiny">{item.partnerPet?.name} · {item.scheduledAt?.slice(0, 10) || item.completedAt?.slice(0, 10)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
