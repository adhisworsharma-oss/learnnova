import mongoose from 'mongoose'
import { connectDb } from '../config/db.js'
import User from '../models/User.js'

async function backfill() {
  await connectDb()
  try {
    const users = await User.find({ $or: [{ username: { $exists: false } }, { username: null }, { username: '' }] })
    let fixed = 0
    for (const user of users) {
      let slug = `${user.name}${user.surname}`.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) || 'reader'
      while (slug.length < 3) slug += Math.floor(Math.random() * 10)
      let username = slug
      for (let i = 0; i < 8; i += 1) {
        const taken = await User.exists({ username, _id: { $ne: user._id } })
        if (!taken) break
        username = `${slug}${Math.floor(1000 + Math.random() * 9000)}`
      }
      user.username = username
      await user.save()
      fixed += 1
      console.log(`  ${user.email} -> @${username}`)
    }
    console.log(`Done. ${fixed} user(s) updated.`)
  } finally {
    await mongoose.disconnect()
  }
}

backfill().catch((err) => {
  console.error('Backfill failed:', err.message)
  process.exit(1)
})
