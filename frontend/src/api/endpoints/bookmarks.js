import { del, get, post } from '../client.js'

export function getBookmarks(options) {
  return get('/bookmarks', options)
}

export function addBookmark(bookId, options) {
  return post(`/bookmarks/${bookId}`, undefined, options)
}

export function removeBookmark(bookId, options) {
  return del(`/bookmarks/${bookId}`, options)
}

export function toggleBookmark(bookId, isBookmarked, options) {
  return isBookmarked ? removeBookmark(bookId, options) : addBookmark(bookId, options)
}
