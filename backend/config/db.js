import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const DB_HOST = process.env.DB_HOST || '127.0.0.1'
const DB_PORT = Number(process.env.DB_PORT) || 27017
const DB_NAME = process.env.DB_NAME || 'learnova'
const userInfo = process.env.DB_USER
  ? `${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@`
  : ''

const uri =
  process.env.DB_URI || `mongodb://${userInfo}${DB_HOST}:${DB_PORT}/${DB_NAME}`

export function connectDb() {
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  })
}

export default mongoose