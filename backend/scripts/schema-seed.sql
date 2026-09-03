-- Learnova schema (MySQL 8.x)

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  surname VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  membership_id VARCHAR(24) NOT NULL,
  dob DATE NULL DEFAULT NULL,
  profile_picture VARCHAR(500) NULL DEFAULT NULL,
  interests JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_membership (membership_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS books (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover VARCHAR(500) NULL DEFAULT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL,
  page_count INT UNSIGNED NOT NULL DEFAULT 0,
  isbn VARCHAR(40) NULL,
  rating DECIMAL(3,1) NULL DEFAULT NULL,
  language VARCHAR(50) NULL DEFAULT 'English',
  level VARCHAR(50) NULL,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_books_isbn (isbn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reading_progress (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  current_page INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('reading','completed','paused') NOT NULL DEFAULT 'reading',
  reading_time_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  last_position VARCHAR(255) NULL DEFAULT NULL,
  last_read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_progress_user_book (user_id, book_id),
  KEY idx_progress_status (user_id, status),
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reading_history (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  action ENUM('viewed','opened','completed','bookmarked','favorited') NOT NULL DEFAULT 'viewed',
  viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_history_user_time (user_id, viewed_at),
  CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookmarks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookmark_user_book (user_id, book_id),
  CONSTRAINT fk_bookmark_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmark_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorite_user_book (user_id, book_id),
  CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed 30 books
INSERT IGNORE INTO books (title, author, cover, description, category, page_count, isbn, rating, language, level) VALUES
('Clean Code', 'Robert C. Martin', NULL, 'A handbook of agile software craftsmanship covering naming, functions, comments, formatting and error handling.', 'Computer Science', 464, '9780132350884', 4.7, 'English', 'Intermediate'),
('Designing Data-Intensive Applications', 'Martin Kleppmann', NULL, 'The big ideas behind reliable, scalable and maintainable data systems.', 'Computer Science', 616, '9781449373320', 4.8, 'English', 'Advanced'),
('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', NULL, 'Your journey to mastery with tips, tools and techniques for modern software development.', 'Computer Science', 352, '9780135957059', 4.6, 'English', 'Intermediate'),
('JavaScript: The Good Parts', 'Douglas Crockford', NULL, 'A deep dive into the beautiful and expressive parts of JavaScript.', 'Computer Science', 176, '9780596517748', 4.2, 'English', 'Beginner'),
('Structure and Interpretation of Computer Programs', 'Harold Abelson & Gerald Jay Sussman', NULL, 'The classic text that teaches the fundamental principles of computer programming.', 'Computer Science', 657, '9780262510875', 4.7, 'English', 'Advanced'),
('The Art of Computer Programming, Vol 1', 'Donald E. Knuth', NULL, 'Fundamental algorithms explored with unmatched rigor.', 'Computer Science', 672, '9780201896831', 4.6, 'English', 'Advanced'),
('Python for Data Analysis', 'Wes McKinney', NULL, 'Data wrangling with pandas, NumPy and IPython. The reference for data science in Python.', 'Data Science', 560, '9781098104030', 4.5, 'English', 'Intermediate'),
('The Elements of Statistical Learning', 'Trevor Hastie & Robert Tibshirani', NULL, 'Data mining, inference and prediction — a cornerstone of modern statistics.', 'Data Science', 745, '9780387848570', 4.5, 'English', 'Advanced'),
('Hands-On Machine Learning with Scikit-Learn', 'Aurélien Géron', NULL, 'Practical concepts and code for building intelligent systems with Python.', 'Data Science', 834, '9781098125974', 4.7, 'English', 'Intermediate'),
('Data Science from Scratch', 'Joel Grus', NULL, 'First principles with Python — build the fundamentals of data science from the ground up.', 'Data Science', 384, '9781492041139', 4.1, 'English', 'Beginner'),
('The Design of Everyday Things', 'Don Norman', NULL, 'Why design matters and how the best products are intuitive to use.', 'Design', 368, '9780465050659', 4.5, 'English', 'Beginner'),
('Don''t Make Me Think', 'Steve Krug', NULL, 'A common sense approach to web usability.', 'Design', 216, '9780321965516', 4.5, 'English', 'Beginner'),
('Thinking with Type', 'Ellen Lupton', NULL, 'A critical guide for designers, writers, editors and students on typography.', 'Design', 224, '9781568989693', 4.3, 'English', 'Beginner'),
('The Lean Startup', 'Eric Ries', NULL, 'How constant innovation creates radically successful businesses.', 'Business & Economics', 336, '9780307887894', 4.3, 'English', 'Beginner'),
('Zero to One', 'Peter Thiel', NULL, 'Notes on startups, or how to build the future.', 'Business & Economics', 224, '9780804139298', 4.3, 'English', 'Beginner'),
('The Innovator''s Dilemma', 'Clayton M. Christensen', NULL, 'When new technologies cause great firms to fail.', 'Business & Economics', 288, '9781633691780', 4.2, 'English', 'Intermediate'),
('Freakonomics', 'Steven D. Levitt & Stephen J. Dubner', NULL, 'A rogue economist explores the hidden side of everything.', 'Business & Economics', 336, '9780060731335', 4.1, 'English', 'Beginner'),
('To Kill a Mockingbird', 'Harper Lee', NULL, 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.', 'Literature', 336, '9780061120084', 4.4, 'English', 'Beginner'),
('1984', 'George Orwell', NULL, 'The dystopian classic of a totalitarian government that watches every move.', 'Literature', 328, '9780451524935', 4.4, 'English', 'Beginner'),
('The Great Gatsby', 'F. Scott Fitzgerald', NULL, 'The story of the fabulously wealthy Jay Gatsby and his passion for Daisy Buchanan.', 'Literature', 180, '9780743273565', 4.1, 'English', 'Beginner'),
('Pride and Prejudice', 'Jane Austen', NULL, 'Austen''s witty classic of manners, love, and the pursuit of happiness.', 'Literature', 279, '9780141439518', 4.4, 'English', 'Beginner'),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', NULL, 'How a humble ape became the ruler of planet Earth.', 'History', 464, '9780062316110', 4.5, 'English', 'Beginner'),
('A People''s History of the United States', 'Howard Zinn', NULL, 'American history told from the perspective of those ignored in standard textbooks.', 'History', 729, '9780062397348', 4.3, 'English', 'Intermediate'),
('Guns, Germs, and Steel', 'Jared Diamond', NULL, 'The fates of human societies examined through geography and environment.', 'History', 518, '9780393354324', 4.2, 'English', 'Intermediate'),
('A Brief History of Time', 'Stephen Hawking', NULL, 'From the big bang to black holes — the landmark exploration of the universe.', 'Science', 212, '9780553380163', 4.4, 'English', 'Intermediate'),
('The Selfish Gene', 'Richard Dawkins', NULL, 'A revolutionary look at evolution through the eyes of the gene.', 'Science', 360, '9780198788607', 4.3, 'English', 'Intermediate'),
('Cosmos', 'Carl Sagan', NULL, 'The story of science and the cosmos — Thirteen linked chapters of wonder.', 'Science', 396, '9780345539434', 4.6, 'English', 'Beginner'),
('The Power of Habit', 'Charles Duhigg', NULL, 'Why we do what we do in life and business, and how to change it.', 'Self-Development', 371, '9780812981605', 4.3, 'English', 'Beginner'),
('Atomic Habits', 'James Clear', NULL, 'An easy and proven way to build good habits and break bad ones.', 'Self-Development', 320, '9780735211292', 4.6, 'English', 'Beginner'),
('Deep Work', 'Cal Newport', NULL, 'Rules for focused success in a distracted world.', 'Self-Development', 296, '9781455586691', 4.4, 'English', 'Beginner');
