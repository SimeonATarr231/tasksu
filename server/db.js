const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../TasksU.db"));

db.pragma("journal_mode = WAL");

const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT    UNIQUE NOT NULL,
      email      TEXT    UNIQUE NOT NULL,
      password   TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      title       TEXT    NOT NULL,
      description TEXT,
      priority    TEXT    DEFAULT 'medium',
      completed   INTEGER DEFAULT 0,
      due_date    TEXT,
      created_at  TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Add due_date column to existing tasks if it doesn't exist
  try {
    db.exec(`ALTER TABLE tasks ADD COLUMN due_date TEXT`);
  } catch (e) {
    // Column already exists — safe to ignore
  }

  try {
    db.exec(`ALTER TABLE tasks ADD COLUMN category TEXT`);
  } catch (e) {
    // Clumn already exist - safe to ignore
  }

  console.log("Database initialized successfully");
};

initDb();

module.exports = db;
