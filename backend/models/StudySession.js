import mongoose from 'mongoose'

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  state: { type: String, enum: ['active', 'ended'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  durationMs: { type: Number, default: 0, min: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } })

studySessionSchema.index({ user: 1, state: 1 })

export default mongoose.model('StudySession', studySessionSchema)