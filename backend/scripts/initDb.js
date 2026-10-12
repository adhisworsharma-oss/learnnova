import mongoose from 'mongoose'
import { connectDb } from '../config/db.js'
import Book from '../models/Book.js'

/* BCA Digital Library — course-aligned catalogue.
   `category` holds the subject so the library can group books by topic
   (Java, C Programming, DBMS, Operating Systems, ...). */
const BOOKS = [
  // ---------- Java ----------
  { title: 'Java: The Complete Reference', author: 'Herbert Schildt', category: 'Java', pageCount: 1248, isbn: '9781260440232', rating: 4.8, level: 'Intermediate', description: 'The definitive guide to Java — the language, the standard library and modern features through the latest Java SE release.' },
  { title: 'Head First Java', author: 'Kathy Sierra & Bert Bates', category: 'Java', pageCount: 752, isbn: '9781491910771', rating: 4.7, level: 'Beginner', description: 'A brain-friendly introduction that makes object-oriented Java click through visuals, puzzles and real projects.' },
  { title: 'Java: How to Program', author: 'Paul Deitel & Harvey Deitel', category: 'Java', pageCount: 1248, isbn: '9780134743356', rating: 4.5, level: 'Beginner', description: 'A comprehensive, example-driven introduction to Java and object-oriented application development.' },

  // ---------- C Programming ----------
  { title: 'Let Us C', author: 'Yashavant Kanetkar', category: 'C Programming', pageCount: 656, isbn: '9788183331630', rating: 4.6, level: 'Beginner', description: 'The classroom favourite for learning C from scratch, with clear explanations and plenty of solved programs.' },
  { title: 'Programming in ANSI C', author: 'E. Balagurusamy', category: 'C Programming', pageCount: 616, isbn: '9789352602209', rating: 4.5, level: 'Beginner', description: 'A structured, syllabus-friendly text introducing C fundamentals, arrays, pointers, structures and files.' },
  { title: 'The C Programming Language', author: 'Brian W. Kernighan & Dennis M. Ritchie', category: 'C Programming', pageCount: 288, isbn: '9780131103627', rating: 4.8, level: 'Advanced', description: 'The classic K&R text from the creators of C — concise, precise and timeless.' },

  // ---------- C++ ----------
  { title: 'C++ Primer', author: 'Stanley B. Lippman, José Lajoie & Barbara Moo', category: 'C++', pageCount: 976, isbn: '9780321714114', rating: 4.7, level: 'Intermediate', description: 'The go-to introduction to modern C++, progressing from fundamentals to generic and object-oriented programming.' },
  { title: 'Effective C++', author: 'Scott Meyers', category: 'C++', pageCount: 320, isbn: '9780321334879', rating: 4.7, level: 'Advanced', description: '55 specific ways to improve your programs and designs — essential reading for serious C++ developers.' },
  { title: 'The C++ Programming Language', author: 'Bjarne Stroustrup', category: 'C++', pageCount: 1376, isbn: '9780321563842', rating: 4.6, level: 'Advanced', description: 'The authoritative reference on C++ from its designer, covering the language and standard library in depth.' },

  // ---------- Python ----------
  { title: 'Python Crash Course', author: 'Eric Matthes', category: 'Python', pageCount: 544, isbn: '9781593279288', rating: 4.7, level: 'Beginner', description: 'A hands-on, project-based introduction to programming with Python for absolute beginners.' },
  { title: 'Automate the Boring Stuff with Python', author: 'Al Sweigart', category: 'Python', pageCount: 592, isbn: '9781593279929', rating: 4.7, level: 'Beginner', description: 'Practical programming for total beginners — write scripts to automate everyday tasks.' },
  { title: 'Python for Data Analysis', author: 'Wes McKinney', category: 'Python', pageCount: 579, isbn: '9781098104030', rating: 4.6, level: 'Intermediate', description: 'Data wrangling with pandas, NumPy and IPython — the reference for data work in Python.' },

  // ---------- DBMS ----------
  { title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry Korth & S. Sudarshan', category: 'DBMS', pageCount: 1376, isbn: '9780078022159', rating: 4.7, level: 'Intermediate', description: 'A rigorous yet accessible introduction to database design, SQL, transactions and modern data systems.' },
  { title: 'Fundamentals of Database Systems', author: 'Ramez Elmasri & Shamkant Navathe', category: 'DBMS', pageCount: 1272, isbn: '9780133970777', rating: 4.6, level: 'Intermediate', description: 'A complete foundation in database modelling, design, implementation and administration.' },

  // ---------- Operating Systems ----------
  { title: 'Operating System Concepts', author: 'Abraham Silberschatz, Peter Galvin & Greg Gagne', category: 'Operating Systems', pageCount: 944, isbn: '9781118063330', rating: 4.7, level: 'Intermediate', description: 'The classic "dinosaur book" — processes, concurrency, memory management, storage and protection.' },
  { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum & Herbert Bos', category: 'Operating Systems', pageCount: 1136, isbn: '9780133591620', rating: 4.6, level: 'Advanced', description: 'A comprehensive overview of operating system design, from processes and threads to distributed systems.' },

  // ---------- Computer Networks ----------
  { title: 'Computer Networking: A Top-Down Approach', author: 'James Kurose & Keith Ross', category: 'Computer Networks', pageCount: 864, isbn: '9780133594140', rating: 4.7, level: 'Intermediate', description: 'Learn networking by working from applications down to the physical layer — a student favourite.' },
  { title: 'Computer Networks', author: 'Andrew S. Tanenbaum & David Wetherall', category: 'Computer Networks', pageCount: 960, isbn: '9780132126953', rating: 4.6, level: 'Intermediate', description: 'A clear, structured tour of network architecture, protocols and the Internet.' },

  // ---------- Data Structures ----------
  { title: 'Data Structures Using C', author: 'Reema Thareja', category: 'Data Structures', pageCount: 656, isbn: '9780198099307', rating: 4.5, level: 'Beginner', description: 'A practical guide to implementing linked lists, stacks, queues, trees and graphs in C.' },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen, Charles Leiserson, Ronald Rivest & Clifford Stein', category: 'Data Structures', pageCount: 1312, isbn: '9780262046305', rating: 4.8, level: 'Advanced', description: 'The definitive reference on algorithms — design, analysis and implementation, thoroughly explained.' },

  // ---------- Software Engineering ----------
  { title: 'Software Engineering', author: 'Ian Sommerville', category: 'Software Engineering', pageCount: 816, isbn: '9780133943030', rating: 4.6, level: 'Intermediate', description: 'A balanced introduction to software processes, agile methods, architecture, testing and project management.' },
  { title: "Software Engineering: A Practitioner's Approach", author: 'Roger S. Pressman', category: 'Software Engineering', pageCount: 976, isbn: '9780078022128', rating: 4.5, level: 'Intermediate', description: 'A practitioner-focused guide to the full software development lifecycle and modern engineering practice.' },

  // ---------- Web Development ----------
  { title: 'HTML and CSS: Design and Build Websites', author: 'Jon Duckett', category: 'Web Development', pageCount: 512, isbn: '9781118008188', rating: 4.7, level: 'Beginner', description: 'A beautifully illustrated, beginner-friendly introduction to building websites with HTML and CSS.' },
  { title: 'Learning React', author: 'Alex Banks & Eve Porcello', category: 'Web Development', pageCount: 310, isbn: '9781492051725', rating: 4.5, level: 'Intermediate', description: 'Modern patterns for building web applications with React, hooks and functional programming.' },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Web Development', pageCount: 176, isbn: '9780596517748', rating: 4.3, level: 'Intermediate', description: 'A concise guide to the elegant, reliable features of JavaScript and how to use them well.' },

  // ---------- AI ----------
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', category: 'AI', pageCount: 1152, isbn: '9780134610993', rating: 4.7, level: 'Advanced', description: 'The leading textbook on AI — search, knowledge, learning, perception and the future of intelligent agents.' },

  // ---------- Machine Learning ----------
  { title: 'Machine Learning', author: 'Tom M. Mitchell', category: 'Machine Learning', pageCount: 432, isbn: '9780070428072', rating: 4.5, level: 'Advanced', description: 'A foundational text covering supervised learning, reinforcement learning, neural networks and theory.' },
  { title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', author: 'Aurélien Géron', category: 'Machine Learning', pageCount: 856, isbn: '9781098125974', rating: 4.8, level: 'Intermediate', description: 'Practical, code-first concepts and tools for building intelligent systems with Python.' },

  // ---------- Cyber Security ----------
  { title: 'Cyber Security: Understanding Cyber Crimes, Computer Forensics and Legal Perspectives', author: 'Nina Godbole & Sunit Belapure', category: 'Cyber Security', pageCount: 596, isbn: '9788126521791', rating: 4.4, level: 'Intermediate', description: 'A syllabus-oriented introduction to cyber crimes, security technologies, forensics and cyber law.' },
  { title: 'Computer Security: Principles and Practice', author: 'William Stallings & Lawrie Brown', category: 'Cyber Security', pageCount: 800, isbn: '9780134794105', rating: 4.5, level: 'Advanced', description: 'A comprehensive survey of computer and network security principles, technologies and practice.' },

  // ---------- Cloud Computing ----------
  { title: 'Cloud Computing: Concepts, Technology & Architecture', author: 'Thomas Erl, Ricardo Puttini & Zaigham Mahmood', category: 'Cloud Computing', pageCount: 528, isbn: '9780133387520', rating: 4.5, level: 'Intermediate', description: 'A vendor-neutral guide to cloud computing concepts, delivery models, virtualization and architecture.' },
  { title: 'Cloud Computing: A Hands-On Approach', author: 'Arshdeep Bahga & Vijay Madisetti', category: 'Cloud Computing', pageCount: 454, isbn: '9780984882417', rating: 4.4, level: 'Intermediate', description: 'A project-based introduction to cloud platforms, virtualization and scalable application design.' },
]

/* ISBNs of the previous general / self-help catalogue that the BCA
   Digital Library replaces. Books matching these are pruned on seed. */
const LEGACY_ISBNS = [
  '9780132350884', '9781449373320', '9780135957059', '9780262510875',
  '9780201896831', '9780387848570', '9781492041139', '9780465050659',
  '9780321965516', '9781568989693', '9780307887894', '9780804139298',
  '9781633691780', '9780060731335', '9780061120084', '9780451524935',
  '9780743273565', '9780141439518', '9780062316110', '9780062397348',
  '9780393354324', '9780553380163', '9780198788607', '9780345539434',
  '9780812981605', '9780735211292', '9781455586691',
]

async function init() {
  await connectDb()
  try {
    await Book.init()
    console.log('Building indexes...')

    console.log('Removing the previous general / self-help catalogue...')
    const removed = await Book.deleteMany({ isbn: { $in: LEGACY_ISBNS } })
    console.log(`Removed ${removed.deletedCount} legacy books.`)

    console.log('Seeding BCA course books...')
    for (const book of BOOKS) {
      await Book.updateOne(
        { isbn: book.isbn },
        { $set: { ...book, language: 'English' } },
        { upsert: true }
      )
    }

    const count = await Book.countDocuments()
    console.log(`Done. ${count} BCA books available.`)
  } finally {
    await mongoose.disconnect()
  }
}

init().catch((err) => {
  console.error('Database init failed:', err.message)
  process.exit(1)
})
