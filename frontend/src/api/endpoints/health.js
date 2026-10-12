import { get } from '../client.js'

export function health(options) {
  return get('/health', { ...options, auth: false })
}
