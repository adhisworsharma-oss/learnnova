import { get, post, put, setStoredUser, setToken } from '../client.js'

function persistSession({ token, user }) {
  setToken(token)
  setStoredUser(user)
  return { token, user }
}

export function register({ name, surname, email, password, dob, interests }, options) {
  return post('/auth/register', { name, surname, email, password, dob, interests }, options).then(persistSession)
}

export function login({ identifier, password }, options) {
  return post('/auth/login', { identifier, password }, options).then(persistSession)
}

export function me(options) {
  return get('/auth/me', options)
}

export function updateProfile(payload, options) {
  return put('/auth/profile', payload, options).then((data) => {
    setStoredUser(data.user)
    return data
  })
}

export function changePassword({ currentPassword, newPassword }, options) {
  return put('/auth/password', { currentPassword, newPassword }, options)
}

export function logout(options) {
  return post('/auth/logout', undefined, options)
}
