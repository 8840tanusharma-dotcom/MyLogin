import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to SQLite database file
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize schema
export function initDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      profile_image TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      last_login TEXT DEFAULT (datetime('now'))
    );
  `);

  // Create user_providers table for multi-provider account linking
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      email TEXT,
      profile_image TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(provider, provider_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ SQLite database initialized successfully at:', dbPath);
}

export default db;
