import { post } from '../client.js'

export function sendMessage(messages, options) {
  return post('/chat', { messages }, { timeout: 30000, ...options })
}
