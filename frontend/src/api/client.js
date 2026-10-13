const TOKEN_KEY = 'learnova_token'
const USER_KEY = 'learnova_user'

// Every backend route is mounted under /api (see backend/server.js). Accept the
// deployed origin (e.g. https://learnnova-6kaq.onrender.com) or a base that
// already ends in /api, and always resolve to a URL that targets /api.
function resolveBaseUrl() {
  const raw = String(import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
  if (!raw) return '/api'
  return /\/api$/.test(raw) ? raw : `${raw}/api`
}

const BASE_URL = resolveBaseUrl()
const DEFAULT_TIMEOUT = 20000

export const UNAUTHORIZED_EVENT = 'learnova:unauthorized'

export class ApiError extends Error {
  constructor(message, { status = 0, details = null, path = '', cause = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.path = path
    if (cause) this.cause = cause
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isValidation() {
    return this.status === 422
  }
}

/* ---------- session storage ---------- */

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else clearToken()
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function logout({ notifyServer = false } = {}) {
  clearToken()
  setStoredUser(null)
  if (notifyServer) request('/auth/logout', { method: 'POST' }).catch(() => {})
}

/* ---------- url + response helpers ---------- */

export function buildUrl(path, query) {
  // Absolute URLs pass straight through, so any third-party API can be called
  // with the same helper as our own endpoints.
  const base = /^https?:\/\//i.test(path) ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }

  const qs = search.toString()
  return `${base}${qs ? `?${qs}` : ''}`
}

async function readBody(res) {
  if (res.status === 204 || res.status === 205) return null
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function timeoutSignal(timeout, external) {
  const controller = new AbortController()
  const timer = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null
  if (external) {
    if (external.aborted) controller.abort()
    else external.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return { signal: controller.signal, done: () => timer && clearTimeout(timer) }
}

/* ---------- core request ---------- */

export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    query,
    headers = {},
    auth = true,
    timeout = DEFAULT_TIMEOUT,
    signal: externalSignal,
  } = options

  const url = buildUrl(path, query)
  const token = auth ? getToken() : null
  const { signal, done } = timeoutSignal(timeout, externalSignal)

  const config = {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    signal,
  }
  if (body !== undefined) config.body = JSON.stringify(body)

  let res
  try {
    res = await fetch(url, config)
  } catch (err) {
    const aborted = err.name === 'AbortError'
    throw new ApiError(aborted ? 'The request timed out. Please try again.' : 'Cannot reach the server.', {
      status: 0,
      path,
      cause: err,
    })
  } finally {
    done()
  }

  const data = await readBody(res)

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && data.message) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${res.status}.`

    if (res.status === 401 && token) {
      clearToken()
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    }

    throw new ApiError(message, {
      status: res.status,
      details: data && typeof data === 'object' ? data.details ?? null : null,
      path,
    })
  }

  return data
}

export function get(path, options) {
  return request(path, { ...options, method: 'GET' })
}

export function post(path, body, options) {
  return request(path, { ...options, method: 'POST', body })
}

export function put(path, body, options) {
  return request(path, { ...options, method: 'PUT', body })
}

export function del(path, options) {
  return request(path, { ...options, method: 'DELETE' })
}

/* Ad-hoc escape hatch: api('/books', { query: { limit: 20 } }) */
export function api(path, options = {}) {
  return request(path, options)
}
