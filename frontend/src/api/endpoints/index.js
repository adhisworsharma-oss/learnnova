import * as auth from './auth.js'
import * as books from './books.js'
import * as bookmarks from './bookmarks.js'
import * as chat from './chat.js'
import * as dashboard from './dashboard.js'
import * as favorites from './favorites.js'
import * as health from './health.js'
import * as reading from './reading.js'
import * as recommendations from './recommendations.js'

export { auth, books, bookmarks, chat, dashboard, favorites, health, reading, recommendations }

export const api = {
  auth,
  books,
  bookmarks,
  chat,
  dashboard,
  favorites,
  health,
  reading,
  recommendations,
}
