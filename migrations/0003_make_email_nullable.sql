-- Make email field explicitly nullable in comments table
-- SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table
CREATE TABLE comments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    author TEXT NOT NULL,
    email TEXT,  -- Already nullable, but ensuring it's explicit
    content TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO comments_new (id, slug, author, email, content, password, created_at, updated_at)
SELECT id, slug, author, email, content, password, created_at, updated_at FROM comments;

-- Drop old table
DROP TABLE comments;

-- Rename new table to original name
ALTER TABLE comments_new RENAME TO comments;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
