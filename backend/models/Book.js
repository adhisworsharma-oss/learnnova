import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 255 },
  author: { type: String, required: true, trim: true, maxlength: 255 },
  cover: { type: String, default: null, maxlength: 500 },
  description: { type: String, default: null },
  category: { type: String, default: null, maxlength: 100 },
  pageCount: { type: Number, required: true, default: 0, min: 0 },
  isbn: { type: String, default: null, unique: true, sparse: true, trim: true, maxlength: 40 },
  rating: { type: Number, default: null, min: 0, max: 5 },
  language: { type: String, default: 'English', maxlength: 50 },
  level: { type: String, default: null, maxlength: 50 },
  addedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Book', bookSchema)