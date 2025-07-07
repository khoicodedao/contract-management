import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// ✅ Thay thế __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Giữ nguyên hàm log
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  log(`📦 Looking for static files in ${distPath}`);

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `❌ Could not find the build directory: ${distPath}, did you run "vite build"?`
    );
  }

  app.use(express.static(distPath));
  log("✅ Static files are being served.");

  app.use("*", (req, res) => {
    log(`📄 [Static] Serving index.html for ${req.originalUrl}`);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
