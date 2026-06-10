// server/db.js

const Database = require('better-sqlite3');
const path = require('path');

// Create or connect to the database file
const db = new Database(path.join(__dirname, '../tasksy.db'));
console.log('Database path:', path.join(__dirname, '../tasksy.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

const initDb = () => {

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      username          TEXT    UNIQUE NOT NULL,
      email             TEXT    UNIQUE NOT NULL,
      password          TEXT    NOT NULL,
      verified          INTEGER DEFAULT 0,
      created_at        TEXT    DEFAULT (datetime('now'))
    )
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      title       TEXT    NOT NULL,
      description TEXT,
      priority    TEXT    DEFAULT 'medium',
      completed   INTEGER DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      token      TEXT    UNIQUE NOT NULL,
      type       TEXT    NOT NULL,
      expires_at TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Add verified column to existing users if it doesn't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists — safe to ignore
  }

  console.log('Database initialized successfully');
};

initDb();

module.exports = db;