import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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
app.use(express.json({ limit: "16kb" }));

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Portfolio server is running." });
});

app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    message: "Portfolio backend API is available.",
    endpoints: ["/api/health"],
    note: "Contact form uses EmailJS from the React app (no /api/contact).",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
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
