-- Add reply_to column to comments table for comment threading
ALTER TABLE comments ADD COLUMN reply_to INTEGER NULL;

-- Create index for better query performance on reply_to
CREATE INDEX idx_comments_reply_to ON comments(reply_to);
