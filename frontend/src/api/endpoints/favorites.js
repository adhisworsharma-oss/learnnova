import { del, get, post } from '../client.js'

export function getFavorites(options) {
  return get('/favorites', options)
}

export function addFavorite(bookId, options) {
  return post(`/favorites/${bookId}`, undefined, options)
}

export function removeFavorite(bookId, options) {
  return del(`/favorites/${bookId}`, options)
}

export function toggleFavorite(bookId, isFavorite, options) {
  return isFavorite ? removeFavorite(bookId, options) : addFavorite(bookId, options)
}
