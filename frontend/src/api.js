const TOKEN_KEY = 'learnova_token'

const BASE_URL = String(import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '')

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
