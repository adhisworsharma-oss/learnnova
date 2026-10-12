import { get, post, request } from '../client.js'

export function listBooks({ q, category, level, sort, order, page, limit } = {}, options) {
  return get('/books', { ...options, query: { q, category, level, sort, order, page, limit } })
}

export function getBook(id, options) {
  return get(`/books/${id}`, options)
}

export function listCategories(options) {
  return get('/books/categories', options)
}

export function createBook(payload, options) {
  return post('/books', payload, options)
}

/* ---------- demo calls ---------- */

// GET /api/books/demo - our own backend, no auth, no database.
export function getDemoBooks(options) {
  return get('/books/demo', options)
}

// A third-party API, to show that absolute URLs work through the same client.
export function searchOpenLibrary(q, { limit = 10, ...options } = {}) {
  return request('https://openlibrary.org/search.json', { ...options, query: { q, limit } })
}
