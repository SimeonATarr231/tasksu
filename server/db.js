const initDb = () => {

  // Users table — added verified and verification fields
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

  // Tasks table — unchanged
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

  // Tokens table — stores verification and password reset tokens
  // type is either 'verification' or 'password_reset'
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

  // Add verified column to existing users table if it doesn't exist
  // This handles the case where the table already exists without the column
  try {
    db.exec(`ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists — safe to ignore this error
  }

  console.log('Database initialized successfully');
};