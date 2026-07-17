-- Raw SQL schema for persistent storage (optional)
-- Enable when migrating from in-memory to SQLite/Postgres

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  is_ocr INTEGER DEFAULT 0,
  uploaded_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analysis_results (
  id TEXT PRIMARY KEY,
  file_a_id TEXT NOT NULL,
  file_b_id TEXT NOT NULL,
  file_a_name TEXT NOT NULL,
  file_b_name TEXT NOT NULL,
  normal_score REAL NOT NULL,
  strict_score REAL NOT NULL,
  word_overlap REAL NOT NULL,
  matched_ranges TEXT DEFAULT '[]',
  course_name TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (file_a_id) REFERENCES files(id),
  FOREIGN KEY (file_b_id) REFERENCES files(id)
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  threshold REAL DEFAULT 0.7,
  course_exclusions TEXT DEFAULT '{}',
  updated_at TEXT DEFAULT (datetime('now'))
);
