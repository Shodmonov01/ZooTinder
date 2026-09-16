const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

type Tokens = { accessToken: string; refreshToken: string }

function readTokens(): Tokens | null {
  const raw = localStorage.getItem('bm_tokens')
  return raw ? (JSON.parse(raw) as Tokens) : null
}

export function saveTokens(tokens: Tokens) {
  localStorage.setItem('bm_tokens', JSON.stringify(tokens))
}

export function clearTokens() {
  localStorage.removeItem('bm_tokens')
}

async function refreshTokens(refreshToken: string) {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) {
    clearTokens()
    throw new Error('SESSION_EXPIRED')
  }
  const data = (await response.json()) as Tokens
  saveTokens(data)
  return data
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean; skipRefresh?: boolean } = {},
): Promise<T> {
  const { auth = true, skipRefresh, headers, ...rest } = options
  const tokens = auth ? readTokens() : null
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      signal: rest.signal ?? controller.signal,
      headers: {
        ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        ...headers,
      },
    })
    if (response.status === 401 && auth && tokens && !skipRefresh) {
      const next = await refreshTokens(tokens.refreshToken)
      return api<T>(path, {
        ...options,
        skipRefresh: true,
        headers: { ...headers, Authorization: `Bearer ${next.accessToken}` },
      })
    }
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload.message || 'Ошибка запроса')
    }
    return payload as T
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Сервер не отвечает. Запустите backend.')
    }
    if (err instanceof TypeError) {
      throw new Error('Нет связи с API на http://localhost:4000')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
