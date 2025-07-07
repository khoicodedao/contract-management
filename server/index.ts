import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { log } from "./vite"; // ✅ log không gây lỗi, chỉ là hàm helper

export async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Middleware log request/response
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }
        log(logLine);
      }
    });

    next();
  });

  // Đăng ký route
  await registerRoutes(app);

  // Middleware bắt lỗi
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Phục vụ giao diện

  const { serveStatic } = await import("./vite.js"); // ✅ an toàn trong production
  serveStatic(app);

  // Chạy server
  const port = 5000;
  await new Promise<void>((resolve) => {
    server.listen(port, "0.0.0.0", async () => {
      log(`✅ Server running at http://localhost:${port}`);

      try {
        const { initializeDatabase } = await import("./database");
        await initializeDatabase();
      } catch (error) {
        console.log("Note: Could not initialize database:", error);
      }

      resolve();
    });
  });
}
