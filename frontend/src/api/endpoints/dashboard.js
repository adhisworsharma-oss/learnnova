import { get } from '../client.js'

export function getStats(options) {
  return get('/dashboard/stats', options)
}
