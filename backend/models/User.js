import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    surname: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 190 },
    passwordHash: { type: String, required: true, maxlength: 255 },
    membershipId: { type: String, required: true, unique: true, trim: true, maxlength: 24 },
    dob: { type: Date, default: null },
    profilePicture: { type: String, default: null, maxlength: 500 },
    interests: { type: [String], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
)

export default mongoose.model('User', userSchema)