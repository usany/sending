import { env } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";
import express from "express";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// GET all comments for a specific slug
app.get('/api/comments/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { results } = await env.instructions_db.prepare('SELECT * FROM comments WHERE slug = ? ORDER BY created_at DESC').bind(slug).all();

    res.json({ success: true, comments: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
});

// POST - Create a new comment
app.post("/api/comments/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required",
      });
    }

    // Basic email validation (simplified for tutorial purposes)
    // For production, consider using a validation library or more comprehensive checks
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    const created_at = new Date().toISOString();

    const result = await env.instructions_db.prepare(
      "INSERT INTO comments (slug, name, email, created_at) VALUES (?, ?, ?, ?)"
    )
      .bind(slug, name, email, created_at)
      .run();

    if (result.success) {
      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        id: result.meta.last_row_id,
      });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to create comment" });
    }
  } catch (error: any) {
    // Handle unique constraint violation
    // if (error.message?.includes("UNIQUE constraint failed")) {
    //   return res.status(409).json({
    //     success: false,
    //     error: "Comment already exists",
    //   });
    // }
    res.status(500).json({ success: false, error: "Failed to create comment" });
  }
});

// PUT - Update a comment
app.put("/api/comment/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required",
      });
    }

    // Basic email validation if provided (simplified for tutorial purposes)
    // For production, consider using a validation library or more comprehensive checks
    if (email && (!email.includes("@") || !email.includes("."))) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Build dynamic update query
    const values: any[] = [];

    values.push(name);
    
    values.push(email);
    
    const updated_at = new Date().toISOString();
    values.push(updated_at);
    values.push(slug);

    const result = await env.instructions_db.prepare(
      `UPDATE comments SET name = ?, email = ?, updated_at = ? WHERE slug = ?`
    )
      .bind(...values)
      .run();

    if (result.meta.changes === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    res.json({ success: true, message: "Comment updated successfully" });
  } catch (error: any) {
    // if (error.message?.includes("UNIQUE constraint failed")) {
    //   return res.status(409).json({
    //     success: false,
    //     error: "Email already exists",
    //   });
    // }
    res.status(500).json({ success: false, error: "Failed to update comment" });
  }
});

// DELETE - Delete a member
app.delete("/api/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await env.instructions_db.prepare("DELETE FROM comments WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete comment" });
  }
});

// Health check endpoint
app.get("/", (_, res) => {
  res.json({ message: "Express running on Cloudflare Workers!" });
});

app.listen(3000);
export default httpServerHandler({ port: 3000 });
