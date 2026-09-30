import mongoose from 'mongoose'

const readingHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  action: {
    type: String,
    enum: ['viewed', 'opened', 'completed', 'bookmarked', 'favorited'],
    default: 'viewed',
  },
  viewedAt: { type: Date, default: Date.now },
})

readingHistorySchema.index({ user: 1, viewedAt: -1 })

export default mongoose.model('ReadingHistory', readingHistorySchema)