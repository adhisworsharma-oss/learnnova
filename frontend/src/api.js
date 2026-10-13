const TOKEN_KEY = 'learnova_token'

// Every backend route is mounted under /api (see backend/server.js). Accept the
// deployed origin (e.g. https://learnnova-6kaq.onrender.com) or a base that
// already ends in /api, and always resolve to a URL that targets /api.
function resolveBaseUrl() {
  const raw = String(import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
  if (!raw) return '/api'
  return /\/api$/.test(raw) ? raw : `${raw}/api`
}

const BASE_URL = resolveBaseUrl()

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
  if (body) config.body = JSON.stringify(body)

  const url = /^https?:\/\//i.test(path) ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, config)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}
