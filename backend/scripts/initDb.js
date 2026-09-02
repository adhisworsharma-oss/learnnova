import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pool from '../config/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BOOKS = [
  { title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', page_count: 464, isbn: '9780132350884', rating: 4.7, level: 'Intermediate', description: 'A handbook of agile software craftsmanship covering naming, functions, comments, formatting and error handling.' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', category: 'Computer Science', page_count: 616, isbn: '9781449373320', rating: 4.8, level: 'Advanced', description: 'The big ideas behind reliable, scalable and maintainable data systems.' },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', category: 'Computer Science', page_count: 352, isbn: '9780135957059', rating: 4.6, level: 'Intermediate', description: 'Your journey to mastery with tips, tools and techniques for modern software development.' },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Computer Science', page_count: 176, isbn: '9780596517748', rating: 4.2, level: 'Beginner', description: 'A deep dive into the beautiful and expressive parts of JavaScript.' },
  { title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson & Gerald Jay Sussman', category: 'Computer Science', page_count: 657, isbn: '9780262510875', rating: 4.7, level: 'Advanced', description: 'The classic text that teaches the fundamental principles of computer programming.' },
  { title: 'The Art of Computer Programming, Vol 1', author: 'Donald E. Knuth', category: 'Computer Science', page_count: 672, isbn: '9780201896831', rating: 4.6, level: 'Advanced', description: 'Fundamental algorithms explored with unmatched rigor.' },
  { title: 'Python for Data Analysis', author: 'Wes McKinney', category: 'Data Science', page_count: 560, isbn: '9781098104030', rating: 4.5, level: 'Intermediate', description: 'Data wrangling with pandas, NumPy and IPython. The reference for data science in Python.' },
  { title: 'The Elements of Statistical Learning', author: 'Trevor Hastie & Robert Tibshirani', category: 'Data Science', page_count: 745, isbn: '9780387848570', rating: 4.5, level: 'Advanced', description: 'Data mining, inference and prediction — a cornerstone of modern statistics.' },
  { title: 'Hands-On Machine Learning with Scikit-Learn', author: 'Aurélien Géron', category: 'Data Science', page_count: 834, isbn: '9781098125974', rating: 4.7, level: 'Intermediate', description: 'Practical concepts and code for building intelligent systems with Python.' },
  { title: 'Data Science from Scratch', author: 'Joel Grus', category: 'Data Science', page_count: 384, isbn: '9781492041139', rating: 4.1, level: 'Beginner', description: 'First principles with Python — build the fundamentals of data science from the ground up.' },
  { title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', page_count: 368, isbn: '9780465050659', rating: 4.5, level: 'Beginner', description: 'Why design matters and how the best products are intuitive to use.' },
  { title: 'Don\'t Make Me Think', author: 'Steve Krug', category: 'Design', page_count: 216, isbn: '9780321965516', rating: 4.5, level: 'Beginner', description: 'A common sense approach to web usability.' },
  { title: 'Thinking with Type', author: 'Ellen Lupton', category: 'Design', page_count: 224, isbn: '9781568989693', rating: 4.3, level: 'Beginner', description: 'A critical guide for designers, writers, editors and students on typography.' },
  { title: 'The Lean Startup', author: 'Eric Ries', category: 'Business & Economics', page_count: 336, isbn: '9780307887894', rating: 4.3, level: 'Beginner', description: 'How constant innovation creates radically successful businesses.' },
  { title: 'Zero to One', author: 'Peter Thiel', category: 'Business & Economics', page_count: 224, isbn: '9780804139298', rating: 4.3, level: 'Beginner', description: 'Notes on startups, or how to build the future.' },
  { title: 'The Innovator\'s Dilemma', author: 'Clayton M. Christensen', category: 'Business & Economics', page_count: 288, isbn: '9781633691780', rating: 4.2, level: 'Intermediate', description: 'When new technologies cause great firms to fail.' },
  { title: 'Freakonomics', author: 'Steven D. Levitt & Stephen J. Dubner', category: 'Business & Economics', page_count: 336, isbn: '9780060731335', rating: 4.1, level: 'Beginner', description: 'A rogue economist explores the hidden side of everything.' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', page_count: 336, isbn: '9780061120084', rating: 4.4, level: 'Beginner', description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.' },
  { title: '1984', author: 'George Orwell', category: 'Literature', page_count: 328, isbn: '9780451524935', rating: 4.4, level: 'Beginner', description: 'The dystopian classic of a totalitarian government that watches every move.' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Literature', page_count: 180, isbn: '9780743273565', rating: 4.1, level: 'Beginner', description: 'The story of the fabulously wealthy Jay Gatsby and his passion for Daisy Buchanan.' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Literature', page_count: 279, isbn: '9780141439518', rating: 4.4, level: 'Beginner', description: 'Austen\'s witty classic of manners, love, and the pursuit of happiness.' },
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'History', page_count: 464, isbn: '9780062316110', rating: 4.5, level: 'Beginner', description: 'How a humble ape became the ruler of planet Earth.' },
  { title: 'A People\'s History of the United States', author: 'Howard Zinn', category: 'History', page_count: 729, isbn: '9780062397348', rating: 4.3, level: 'Intermediate', description: 'American history told from the perspective of those ignored in standard textbooks.' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', page_count: 518, isbn: '9780393354324', rating: 4.2, level: 'Intermediate', description: 'The fates of human societies examined through geography and environment.' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', page_count: 212, isbn: '9780553380163', rating: 4.4, level: 'Intermediate', description: 'From the big bang to black holes — the landmark exploration of the universe.' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', category: 'Science', page_count: 360, isbn: '9780198788607', rating: 4.3, level: 'Intermediate', description: 'A revolutionary look at evolution through the eyes of the gene.' },
  { title: 'Cosmos', author: 'Carl Sagan', category: 'Science', page_count: 396, isbn: '9780345539434', rating: 4.6, level: 'Beginner', description: 'The story of science and the cosmos — Thirteen linked chapters of wonder.' },
  { title: 'The Power of Habit', author: 'Charles Duhigg', category: 'Self-Development', page_count: 371, isbn: '9780812981605', rating: 4.3, level: 'Beginner', description: 'Why we do what we do in life and business, and how to change it.' },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', page_count: 320, isbn: '9780735211292', rating: 4.6, level: 'Beginner', description: 'An easy and proven way to build good habits and break bad ones.' },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Self-Development', page_count: 296, isbn: '9781455586691', rating: 4.4, level: 'Beginner', description: 'Rules for focused success in a distracted world.' },
]

async function init() {
  const conn = await pool.getConnection()
  try {
    console.log('Applying schema...')
    const schema = fs
      .readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
    const statements = schema.split(';').map((s) => s.trim()).filter(Boolean)
    for (const stmt of statements) {
      await conn.query(stmt)
    }

    console.log('Seeding books...')
    for (const book of BOOKS) {
      await conn.query(
        `INSERT IGNORE INTO books
          (title, author, cover, description, category, page_count, isbn, rating, language, level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'English', ?)`,
        [book.title, book.author, book.cover ?? null, book.description, book.category, book.page_count, book.isbn, book.rating, book.level]
      )
    }

    const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM books')
    console.log(`Done. ${count} books available.`)
  } finally {
    conn.release()
    await pool.end()
  }
}

init().catch((err) => {
  console.error('Database init failed:', err.message)
  process.exit(1)
})