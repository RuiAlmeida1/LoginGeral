CREATE TABLE preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  favorites TEXT NOT NULL DEFAULT '[]',
  updated_at INTEGER NOT NULL
);
