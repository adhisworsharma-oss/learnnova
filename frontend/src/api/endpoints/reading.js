import { get, post, put } from '../client.js'

export function startReading(bookId, options) {
  return post('/reading/start', { bookId }, options)
}

export function updateProgress(bookId, { currentPage, minutesRead } = {}, options) {
  return put(`/reading/${bookId}/progress`, { currentPage, minutesRead }, options)
}

export function completeBook(bookId, options) {
  return post(`/reading/${bookId}/complete`, undefined, options)
}

export function getCurrentlyReading(options) {
  return get('/reading/current', options)
}

export function getCompleted(options) {
  return get('/reading/completed', options)
}

export function getHistory(options) {
  return get('/reading/history', options)
}
