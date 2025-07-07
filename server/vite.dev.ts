import { createServer as createViteServer, createLogger } from "vite";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { Express } from "express";
import type { Server } from "http";
import viteConfig from "../vite.config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupVite(app: Express, server: Server) {
  const viteLogger = createLogger();

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: viteLogger,
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const templatePath = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(templatePath, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
