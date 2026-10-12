#!/usr/bin/env node
import { existsSync, copyFileSync, readFileSync, writeFileSync, chmodSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env')
const examplePath = join(root, '.env.docker.example')

function isTty() {
  return process.stdin.isTTY && process.stdout.isTTY
}

if (!existsSync(envPath)) {
  copyFileSync(examplePath, envPath)
  console.log('Created .env from .env.docker.example')
} else {
  console.log('.env already exists - keeping your values')
}

const rl = createInterface({ input: process.stdin, output: process.stdout })
const env = readFileSync(envPath, 'utf8')
const currentKey = env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1]?.trim() ?? ''

let apiKey = currentKey
if (isTty()) {
  const answer = (
    await rl.question(
      currentKey && currentKey !== 'your_gemini_api_key_here'
        ? `Gemini API key [${currentKey.slice(0, 8)}... kept, press Enter to keep]: `
        : 'Gemini API key (from https://aistudio.google.com/apikey): '
    )
  ).trim()
  if (answer) apiKey = answer
} else if (!process.env.GEMINI_API_KEY) {
  apiKey = process.argv[2] || currentKey
}

const PLACEHOLDERS = new Set(['', 'replace-with-a-long-random-secret', 'your_gemini_api_key_here'])

function readEnvValue(text, name) {
  const match = text.match(new RegExp(`^${name}=(.*)$`, 'm'))
  return match?.[1]?.trim() ?? ''
}

const existingSecret = readEnvValue(env, 'JWT_SECRET')
const secret =
  (process.env.JWT_SECRET && !PLACEHOLDERS.has(process.env.JWT_SECRET) ? process.env.JWT_SECRET : null) ||
  (PLACEHOLDERS.has(existingSecret) ? randomBytes(48).toString('hex') : existingSecret)

let next = env
  .replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${apiKey || 'your_gemini_api_key_here'}`)
  .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`)

writeFileSync(envPath, next, 'utf8')
try {
  chmodSync(envPath, 0o600)
} catch {
  // chmod is a no-op on Windows; harmless.
}
rl.close()

const missing = !apiKey || apiKey === 'your_gemini_api_key_here'
console.log(missing ? '\nNo key entered yet - Nova will start disabled.' : '\n.env ready.')
console.log('Start the stack with:  docker compose up --build')
if (missing) {
  console.log('\nNot sure you have a key? Create one at https://aistudio.google.com/apikey')
}
