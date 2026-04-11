import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Inquiry } from "./models/Inquiry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const origins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.length ? origins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "48kb" }));

let mongoReady = false;
const MONGODB_URI = process.env.MONGODB_URI || "";

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      mongoReady = true;
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
} else {
  console.warn("MONGODB_URI not set — inquiries will not be stored in the database.");
}

function buildMailer() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT) || 10000,
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 10000,
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT) || 10000,
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Portfolio server is running." });
});

app.get("/api", (_req, res) => {
  res.json({ ok: true, message: "Portfolio backend API is available.", endpoints: ["/api/health", "/api/contact"] });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoReady, emailConfigured: Boolean(buildMailer()) });
});

app.post("/api/contact", async (req, res) => {
  const transporter = buildMailer();
  if (!transporter) {
    return res.status(503).json({
      error:
        "Email is not configured on the server. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to server/.env (see env.example).",
    });
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Please enter your name." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (!message || message.length < 10) {
    return res.status(400).json({ error: "Please enter a message (at least 10 characters)." });
  }

  const toAddress = process.env.EMAIL_TO || process.env.SMTP_USER;
  const fromAddress = process.env.EMAIL_FROM || `Portfolio <${process.env.SMTP_USER}>`;

  let saved = false;
  if (mongoReady && MONGODB_URI) {
    try {
      await Inquiry.create({ name, email, message });
      saved = true;
    } catch (e) {
      console.error("Failed to save inquiry:", e.message);
    }
  }

  const text = [
    `New message from your portfolio contact form`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    ``,
    `Message:`,
    message,
    ``,
    saved ? "(Saved to database)" : mongoReady ? "(Not saved — validation error?)" : "(MongoDB not configured)",
  ].join("\n");

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: toAddress,
      replyTo: email,
      subject: `[Portfolio] Message from ${name}`,
      text,
    });
  } catch (e) {
    console.error("sendMail error:", e.message);
    return res.status(502).json({
      error: "Could not send email. Check SMTP settings and that your provider allows SMTP access.",
    });
  }

  res.json({ ok: true, saved });
});

const distPath = path.join(__dirname, "..", "client", "dist");
const distIndex = path.join(distPath, "index.html");
const serveStatic =
  process.env.NODE_ENV === "production" || String(process.env.SERVE_STATIC || "").toLowerCase() === "true";

if (serveStatic) {
  if (!fs.existsSync(distIndex)) {
    console.warn("Production/static mode enabled but client/dist is missing. Run: npm run build");
  } else {
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(distIndex);
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  if (serveStatic && fs.existsSync(distIndex)) {
    console.log("Serving React app from", distPath);
  } else {
    console.log("Dev API — use Vite on :5173 (`npm run dev` from repo root) or `npm run build` then SERVE_STATIC=true");
  }
});
