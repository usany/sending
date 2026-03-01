import { env } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import {
  EmailRequestSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  VerifyPasswordSchema,
  DeleteCommentSchema
} from './types/schema';
const createTransporter = async () => {
  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    env.CLIENTID,
    env.CLIENTSECRET,
    "https://developers.google.com/oauthplayground",
  );
  oauth2Client.setCredentials({
    refresh_token: env.REFRESHTOKEN,
  });
  const { token: accessToken } = await oauth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: env.USER,
      accessToken: accessToken as string,
      clientId: env.CLIENTID,
      clientSecret: env.CLIENTSECRET,
      refreshToken: env.REFRESHTOKEN,
    },
  });

  return transporter;
};
const sendEmail = async (emailOptions: nodemailer.SendMailOptions) => {
  try {
    const emailTransporter = await createTransporter();
    const res = await emailTransporter.sendMail(emailOptions);
    console.log("sending");
    return res;
  } catch (error) {
    console.log(error);
  }
};

const getCommentById = async (id: string) => {
  return await env.instructions_db
    .prepare("SELECT * FROM comments WHERE id = ?")
    .bind(id)
    .first();
};

const app = express();
const corsOptions = {
  // origin: '*',
  // origin: 'http://localhost:5173',
  // origin: 'https://usany.github.io',
  // origin: 'https://usany-github-io.vercel.app',
  // origin: 'https://khusan.co.kr',
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://usany.github.io",
    "https://usany-github-io.vercel.app",
    "https://khusan.co.kr",
    "https://begin.khusan.co.kr",
    "https://maps.khusan.co.kr",
    "https://unify-beige.vercel.app",
  ],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Middleware to parse JSON bodies
app.use(express.json());
app.post("/mail", async (req, res) => {
  try {
    const reqMethod = req.method;
    const reqURL = req.url;
    console.log(`${reqMethod} ${reqURL}`);
    
    // Validate request body with Zod schema
    const validationResult = EmailRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: validationResult.error.issues
      });
    }
    
    const { to, number, language } = validationResult.data;
    const subject =
      language === "ko"
        ? "환영합니다 쿠우산입니다! 가입 번호입니다."
        : "Welcome to KHUSAN! Here is the verification number.";
    const text =
      language === "ko"
        ? `환영합니다. 번호는 ${number}입니다. 문의사항은 메일로 보내주세요.`
        : `Welcome. The number is ${number}. Kindly send any inquiries to this email.`;
    if (reqMethod === "POST" && reqURL === "/mail") {
      console.log("sending");
      await sendEmail({
        subject: subject,
        text: text,
        to: to,
        from: env.USER,
      });
    }
    res.send(JSON.stringify({ res: "sending" }));
  } catch (error) {
    console.log(error);
    res.send(JSON.stringify({ res: "error" }));
  }
});
// GET all comments for a specific slug
app.get("/api/comments/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { results } = await env.instructions_db
      .prepare("SELECT * FROM comments WHERE slug = ? ORDER BY created_at DESC")
      .bind(slug)
      .all();

    res.json({ success: true, comments: results });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch comments" });
  }
});

// POST - Create a new comment
app.post("/api/comments/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Validate request body with Zod schema
    const validationResult = CreateCommentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid comment data",
        details: validationResult.error.issues
      });
    }
    
    const { author, content, password } = validationResult.data;

    const created_at = new Date().toISOString();

    const result = await env.instructions_db
      .prepare(
        "INSERT INTO comments (slug, author, content, password, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(slug, author, content, password, created_at)
      .run();

    if (result.success) {
      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        id: result.meta.last_row_id,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to create comment" });
  }
});

// PUT - Update a comment
app.put("/api/comments/:slug", async (req, res) => {
  try {
    // Validate request body with Zod schema
    // const validationResult = UpdateCommentSchema.safeParse(req.body);
    // if (!validationResult.success) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Invalid update data",
    //     details: validationResult.error.issues
    //   });
    // }
    
    const { id, content, password } = req.body;
    console.log(req.body);

    // First, get the comment to verify the password
    const comment = await getCommentById(id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    // Check if password matches
    if (comment.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }

    // Build dynamic update query
    const values: any[] = [];

    values.push(content);

    const updated_at = new Date().toISOString();
    values.push(updated_at);
    values.push(id);

    await env.instructions_db
      .prepare(`UPDATE comments SET content = ?, updated_at = ? WHERE id = ?`)
      .bind(...values)
      .run();

    res.json({ success: true, message: "Comment updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to update comment" });
  }
});

// POST - Verify password for a comment
app.post("/api/comments/:commentId/verify-password", async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Validate request body with Zod schema
    const validationResult = VerifyPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid password data",
        details: validationResult.error.issues
      });
    }
    
    const { password } = validationResult.data;

    // Get the comment to verify the password
    const comment = await getCommentById(commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    // Check if password matches
    if (comment.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }

    // Password is correct
    res.json({ success: true, message: "Password verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Password verification failed" });
  }
});

// DELETE - Delete a comment
app.delete("/api/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body with Zod schema
    const validationResult = DeleteCommentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid password data",
        details: validationResult.error.issues
      });
    }
    
    const { password } = validationResult.data;

    const comment = await getCommentById(id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    if (comment.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }

    await env.instructions_db
      .prepare("DELETE FROM comments WHERE id = ?")
      .bind(id)
      .run();

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
