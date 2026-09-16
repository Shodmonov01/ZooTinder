import { getItem, setItem, removeItem } from './storage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

type Tokens = { accessToken: string; refreshToken: string };

async function readTokens(): Promise<Tokens | null> {
  const raw = await getItem('bm_tokens');
  return raw ? (JSON.parse(raw) as Tokens) : null;
}

export async function saveTokens(tokens: Tokens) {
  await setItem('bm_tokens', JSON.stringify(tokens));
}

export async function clearTokens() {
  await removeItem('bm_tokens');
}

async function refreshTokens(refreshToken: string) {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    await clearTokens();
    throw new Error('SESSION_EXPIRED');
  }
  const data = (await response.json()) as Tokens;
  await saveTokens(data);
  return data;
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean; skipRefresh?: boolean } = {},
): Promise<T> {
  const { auth = true, skipRefresh, headers, ...rest } = options;
  const tokens = auth ? await readTokens() : null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      signal: rest.signal ?? controller.signal,
      headers: {
        ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        ...headers,
      },
    });

    if (response.status === 401 && auth && tokens && !skipRefresh) {
      const next = await refreshTokens(tokens.refreshToken);
      return api<T>(path, {
        ...options,
        skipRefresh: true,
        headers: {
          ...headers,
          Authorization: `Bearer ${next.accessToken}`,
        },
      });
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || 'Request failed') as Error & {
        code?: string;
        details?: unknown;
      };
      error.code = payload.code;
      error.details = payload.details;
      throw error;
    }
    return payload as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Сервер не отвечает. Запустите backend: npm run start:dev в папке backend');
    }
    if (err instanceof TypeError) {
      throw new Error('Нет связи с API. Запустите backend на http://localhost:4000');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export { API_URL };
