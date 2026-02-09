-- Add password field to comments table for deletion protection
ALTER TABLE comments ADD COLUMN password TEXT NOT NULL DEFAULT '';

-- Update existing comments to have empty passwords (they won't be deletable without password)
UPDATE comments SET password = '' WHERE password IS NULL;
