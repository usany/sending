-- Make email field nullable in remote comments table
-- Current remote schema has email TEXT NOT NULL, need to change it to nullable
CREATE TABLE comments_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    author TEXT NOT NULL,
    email TEXT,  -- Making nullable
    content TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT '',
    reply_to INTEGER NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reply_to) REFERENCES comments(id) ON DELETE CASCADE
);

-- Copy data from old table to new table
INSERT INTO comments_temp (id, slug, author, email, content, password, reply_to, created_at, updated_at)
SELECT id, slug, author, email, content, password, reply_to, created_at, updated_at FROM comments;

-- Drop old table
DROP TABLE comments;

-- Rename temp table to original name
ALTER TABLE comments_temp RENAME TO comments;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
