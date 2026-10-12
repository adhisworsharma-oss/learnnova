import { get } from '../client.js'

export function getRecommendations({ limit } = {}, options) {
  return get('/recommendations', { ...options, query: { limit } })
}
