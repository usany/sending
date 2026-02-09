-- Comments schema for Azure SQL Database
-- Run this migration on remake.database.windows.net

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[comments]') AND type in (N'U'))
BEGIN
    CREATE TABLE comments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        slug NVARCHAR(255) NOT NULL,
        author NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        password NVARCHAR(255) NOT NULL DEFAULT '',
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );

    -- Create indexes for better performance
    CREATE INDEX idx_comments_slug ON comments(slug);
    CREATE INDEX idx_comments_created_at ON comments(created_at);
END
