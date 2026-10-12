import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 600 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
)

const profilePostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '', trim: true, maxlength: 2000 },
    image: { type: String, default: null, maxlength: 900000 },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
)

export default mongoose.model('ProfilePost', profilePostSchema)
