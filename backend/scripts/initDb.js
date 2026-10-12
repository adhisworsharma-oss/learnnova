import mongoose from 'mongoose'
import { connectDb } from '../config/db.js'
import Book from '../models/Book.js'

const BOOKS = [
  { title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', pageCount: 464, isbn: '9780132350884', rating: 4.7, level: 'Intermediate', description: 'A handbook of agile software craftsmanship covering naming, functions, comments, formatting and error handling.' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', category: 'Computer Science', pageCount: 616, isbn: '9781449373320', rating: 4.8, level: 'Advanced', description: 'The big ideas behind reliable, scalable and maintainable data systems.' },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', category: 'Computer Science', pageCount: 352, isbn: '9780135957059', rating: 4.6, level: 'Intermediate', description: 'Your journey to mastery with tips, tools and techniques for modern software development.' },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Computer Science', pageCount: 176, isbn: '9780596517748', rating: 4.2, level: 'Beginner', description: 'A deep dive into the beautiful and expressive parts of JavaScript.' },
  { title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson & Gerald Jay Sussman', category: 'Computer Science', pageCount: 657, isbn: '9780262510875', rating: 4.7, level: 'Advanced', description: 'The classic text that teaches the fundamental principles of computer programming.' },
  { title: 'The Art of Computer Programming, Vol 1', author: 'Donald E. Knuth', category: 'Computer Science', pageCount: 672, isbn: '9780201896831', rating: 4.6, level: 'Advanced', description: 'Fundamental algorithms explored with unmatched rigor.' },
  { title: 'Python for Data Analysis', author: 'Wes McKinney', category: 'Data Science', pageCount: 560, isbn: '9781098104030', rating: 4.5, level: 'Intermediate', description: 'Data wrangling with pandas, NumPy and IPython. The reference for data science in Python.' },
  { title: 'The Elements of Statistical Learning', author: 'Trevor Hastie & Robert Tibshirani', category: 'Data Science', pageCount: 745, isbn: '9780387848570', rating: 4.5, level: 'Advanced', description: 'Data mining, inference and prediction — a cornerstone of modern statistics.' },
  { title: 'Hands-On Machine Learning with Scikit-Learn', author: 'Aurélien Géron', category: 'Data Science', pageCount: 834, isbn: '9781098125974', rating: 4.7, level: 'Intermediate', description: 'Practical concepts and code for building intelligent systems with Python.' },
  { title: 'Data Science from Scratch', author: 'Joel Grus', category: 'Data Science', pageCount: 384, isbn: '9781492041139', rating: 4.1, level: 'Beginner', description: 'First principles with Python — build the fundamentals of data science from the ground up.' },
  { title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', pageCount: 368, isbn: '9780465050659', rating: 4.5, level: 'Beginner', description: 'Why design matters and how the best products are intuitive to use.' },
  { title: 'Don\'t Make Me Think', author: 'Steve Krug', category: 'Design', pageCount: 216, isbn: '9780321965516', rating: 4.5, level: 'Beginner', description: 'A common sense approach to web usability.' },
  { title: 'Thinking with Type', author: 'Ellen Lupton', category: 'Design', pageCount: 224, isbn: '9781568989693', rating: 4.3, level: 'Beginner', description: 'A critical guide for designers, writers, editors and students on typography.' },
  { title: 'The Lean Startup', author: 'Eric Ries', category: 'Business & Economics', pageCount: 336, isbn: '9780307887894', rating: 4.3, level: 'Beginner', description: 'How constant innovation creates radically successful businesses.' },
  { title: 'Zero to One', author: 'Peter Thiel', category: 'Business & Economics', pageCount: 224, isbn: '9780804139298', rating: 4.3, level: 'Beginner', description: 'Notes on startups, or how to build the future.' },
  { title: 'The Innovator\'s Dilemma', author: 'Clayton M. Christensen', category: 'Business & Economics', pageCount: 288, isbn: '9781633691780', rating: 4.2, level: 'Intermediate', description: 'When new technologies cause great firms to fail.' },
  { title: 'Freakonomics', author: 'Steven D. Levitt & Stephen J. Dubner', category: 'Business & Economics', pageCount: 336, isbn: '9780060731335', rating: 4.1, level: 'Beginner', description: 'A rogue economist explores the hidden side of everything.' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', pageCount: 336, isbn: '9780061120084', rating: 4.4, level: 'Beginner', description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.' },
  { title: '1984', author: 'George Orwell', category: 'Literature', pageCount: 328, isbn: '9780451524935', rating: 4.4, level: 'Beginner', description: 'The dystopian classic of a totalitarian government that watches every move.' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Literature', pageCount: 180, isbn: '9780743273565', rating: 4.1, level: 'Beginner', description: 'The story of the fabulously wealthy Jay Gatsby and his passion for Daisy Buchanan.' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Literature', pageCount: 279, isbn: '9780141439518', rating: 4.4, level: 'Beginner', description: 'Austen\'s witty classic of manners, love, and the pursuit of happiness.' },
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'History', pageCount: 464, isbn: '9780062316110', rating: 4.5, level: 'Beginner', description: 'How a humble ape became the ruler of planet Earth.' },
  { title: 'A People\'s History of the United States', author: 'Howard Zinn', category: 'History', pageCount: 729, isbn: '9780062397348', rating: 4.3, level: 'Intermediate', description: 'American history told from the perspective of those ignored in standard textbooks.' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', pageCount: 518, isbn: '9780393354324', rating: 4.2, level: 'Intermediate', description: 'The fates of human societies examined through geography and environment.' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', pageCount: 212, isbn: '9780553380163', rating: 4.4, level: 'Intermediate', description: 'From the big bang to black holes — the landmark exploration of the universe.' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', category: 'Science', pageCount: 360, isbn: '9780198788607', rating: 4.3, level: 'Intermediate', description: 'A revolutionary look at evolution through the eyes of the gene.' },
  { title: 'Cosmos', author: 'Carl Sagan', category: 'Science', pageCount: 396, isbn: '9780345539434', rating: 4.6, level: 'Beginner', description: 'The story of science and the cosmos — Thirteen linked chapters of wonder.' },
  { title: 'The Power of Habit', author: 'Charles Duhigg', category: 'Self-Development', pageCount: 371, isbn: '9780812981605', rating: 4.3, level: 'Beginner', description: 'Why we do what we do in life and business, and how to change it.' },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', pageCount: 320, isbn: '9780735211292', rating: 4.6, level: 'Beginner', description: 'An easy and proven way to build good habits and break bad ones.' },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Self-Development', pageCount: 296, isbn: '9781455586691', rating: 4.4, level: 'Beginner', description: 'Rules for focused success in a distracted world.' },
]

async function init() {
  await connectDb()
  try {
    await Book.init()
    console.log('Building indexes...')

    console.log('Seeding books...')
    for (const book of BOOKS) {
      await Book.updateOne(
        { isbn: book.isbn },
        { $setOnInsert: { ...book, language: 'English' } },
        { upsert: true }
      )
    }

    const count = await Book.countDocuments()
    console.log(`Done. ${count} books available.`)
  } finally {
    await mongoose.disconnect()
  }
}

init().catch((err) => {
  console.error('Database init failed:', err.message)
  process.exit(1)
})