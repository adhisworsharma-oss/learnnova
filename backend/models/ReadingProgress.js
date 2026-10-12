import mongoose from 'mongoose'

const readingProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  currentPage: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['reading', 'completed', 'paused'],
    default: 'reading',
  },
  readingTimeMinutes: { type: Number, default: 0, min: 0 },
  lastPosition: { type: String, default: null, maxlength: 255 },
  lastReadAt: { type: Date, default: Date.now },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
})

readingProgressSchema.index({ user: 1, book: 1 }, { unique: true })
readingProgressSchema.index({ user: 1, status: 1 })

export default mongoose.model('ReadingProgress', readingProgressSchema)