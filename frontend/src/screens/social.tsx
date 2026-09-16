import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import type { BreedingRequest, ChatItem, MatchItem, Message } from '../types'
import { EmptyState, Photo, Top } from '../ui'

export function Matches() {
  const nav = useNavigate()
  const { t } = useI18n()
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [chats, setChats] = useState<ChatItem[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([api<MatchItem[]>('/matches'), api<ChatItem[]>('/chats')])
      .then(([m, c]) => { setMatches(m); setChats(c) })
      .catch((err) => setError(err instanceof Error ? err.message : t('error')))
  }, [t])
  const list = chats.length ? chats : matches.map((item) => ({ id: item.chatId, matchId: item.id, otherPet: item.otherPet, lastMessage: null }))
  return (
    <>
      <h1 className="title" style={{ padding: '12px 20px 0' }}>{t('yourMatches')}</h1>
      {error ? <EmptyState title={error} /> : null}
      <div className="stories">
        {matches.map((item) => (
          <button key={item.id} className="story" onClick={() => nav(`/app/chat/${item.chatId}`)}>
            <Photo src={item.otherPet.photos[0]?.url} alt="" />
            <b>{item.otherPet.name}</b>
          </button>
        ))}
      </div>
      <div className="list">
        {list.length === 0 && !error ? <p className="sub">{t('noMatches')}</p> : null}
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

export function Chat() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [chat, setChat] = useState<ChatItem | null>(null)
  const [requests, setRequests] = useState<BreedingRequest[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  async function load() {
    if (!id) return
    try {
      const [nextMessages, chats, nextRequests] = await Promise.all([
        api<Message[]>(`/chats/${id}/messages`),
        api<ChatItem[]>('/chats'),
        api<BreedingRequest[]>('/breeding-requests'),
      ])
      setMessages(nextMessages)
      const found = chats.find((item) => item.id === id) ?? null
      setChat(found)
      setRequests(nextRequests.filter((item) => item.matchId === found?.matchId))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 4000)
    return () => clearInterval(timer)
  }, [id])

  const mineRequest = requests[0]

  return (
    <div className="chat-page">
      <Top title={chat?.otherPet.name || t('chat')} />
      {error ? <div className="err" style={{ padding: '0 16px' }}>{error}</div> : null}
      <div className="row" style={{ padding: '0 16px 8px', gap: 8 }}>
        <button className="btn sm ghost" onClick={async () => {
          if (!chat) return
          await api('/reports', { method: 'POST', body: JSON.stringify({ targetType: 'CHAT', targetId: chat.id, reason: 'abuse' }) })
        }}>{t('report')}</button>
        <button className="btn sm ghost" onClick={async () => {
          if (!chat?.otherPet.ownerId) return
          await api('/blocks', { method: 'POST', body: JSON.stringify({ blockedId: chat.otherPet.ownerId }) })
          nav('/app/matches')
        }}>{t('block')}</button>
      </div>
      {chat?.matchId ? (
        <div className="pad-plain" style={{ paddingTop: 0 }}>
          {mineRequest ? (
            <div className="cell"><div><b>{t('breedAsk')}</b><div className="tiny">{mineRequest.status}</div></div></div>
          ) : (
            <>
              <label className="field"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('breedAsk')} /></label>
              <button className="btn sm" style={{ marginTop: 8 }} onClick={async () => {
                const matches = await api<{ id: string; chatId: string; myPet: { id: string } }[]>('/matches')
                const match = matches.find((item) => item.chatId === id)
                if (!match) return
                await api('/breeding-requests', {
                  method: 'POST',
                  body: JSON.stringify({ matchId: match.id, senderPetId: match.myPet.id, note, proposedAt: new Date().toISOString() }),
                })
                await load()
              }}>{t('sendRequest')}</button>
            </>
          )}
          {mineRequest && mineRequest.receiverPet.ownerId === user?.id && mineRequest.status === 'SENT' ? (
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn sm" onClick={async () => { await api(`/breeding-requests/${mineRequest.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'ACCEPTED' }) }); await load() }}>{t('accept')}</button>
              <button className="btn sm ghost" onClick={async () => { await api(`/breeding-requests/${mineRequest.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'DECLINED' }) }); await load() }}>{t('decline')}</button>
            </div>
          ) : null}
          {mineRequest && mineRequest.status === 'ACCEPTED' ? (
            <button className="btn sm" style={{ marginTop: 8 }} onClick={async () => { await api(`/breeding-requests/${mineRequest.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'SCHEDULED', proposedAt: new Date().toISOString() }) }); await load() }}>{t('schedule')}</button>
          ) : null}
          {mineRequest && mineRequest.status === 'SCHEDULED' ? (
            <button className="btn sm" style={{ marginTop: 8 }} onClick={async () => { await api(`/breeding-requests/${mineRequest.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED' }) }); await load() }}>{t('complete')}</button>
          ) : null}
        </div>
      ) : null}
      <div className="bubbles">
        {messages.length === 0 ? <p className="sub">{t('emptyChat')}</p> : null}
        {messages.map((item) => (
          <div key={item.id} className={`bubble ${item.senderId === user?.id ? 'me' : 'them'}`}>{item.text}</div>
        ))}
      </div>
      <form className="composer" onSubmit={async (e: FormEvent) => {
        e.preventDefault()
        if (!text.trim() || !id) return
        await api(`/chats/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) })
        setText('')
        await load()
      }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('emptyChat')} />
        <button className="send" type="submit">➤</button>
      </form>
    </div>
  )
}
