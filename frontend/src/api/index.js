export {
  ApiError,
  UNAUTHORIZED_EVENT,
  buildUrl,
  clearToken,
  getStoredUser,
  isAuthenticated,
  logout as clearSession,
  setStoredUser,
  setToken,
  getToken,
  request,
  get,
  post,
  put,
  del,
} from './client.js'

export { api, auth, books, bookmarks, chat, dashboard, favorites, health, reading, recommendations } from './endpoints/index.js'

export { useApiQuery, useApiMutation } from './hooks.js'
