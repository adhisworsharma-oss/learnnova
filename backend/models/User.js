import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    surname: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 190 },
    passwordHash: { type: String, required: true, maxlength: 255 },
    membershipId: { type: String, required: true, unique: true, trim: true, maxlength: 24 },
    dob: { type: Date, default: null },
    profilePicture: { type: String, default: null, maxlength: 400000 },
    coverPhoto: { type: String, default: null, maxlength: 1200000 },
    bio: { type: String, default: '', trim: true, maxlength: 255 },
    location: { type: String, default: '', trim: true, maxlength: 80 },
    website: { type: String, default: '', trim: true, maxlength: 200 },
    studentId: { type: String, default: '', trim: true, maxlength: 30 },
    course: { type: String, default: '', trim: true, maxlength: 40 },
    semester: { type: String, default: '', trim: true, maxlength: 30 },
    department: { type: String, default: '', trim: true, maxlength: 120 },
    university: { type: String, default: '', trim: true, maxlength: 160 },
    phone: { type: String, default: '', trim: true, maxlength: 24 },
    interests: { type: [String], default: [] },
    followers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    following: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
)

export default mongoose.model('User', userSchema)
