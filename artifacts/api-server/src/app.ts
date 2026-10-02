import express, { type Express } from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { pinoHttp } from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aliases for health checks
app.get(["/healthz", "/health", "/api/health"], (_req, res) => {
  res.json({
    status: "ok",
    service: "TruthGuard AI",
    version: "3.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Primary API routes
app.use("/api", router);

// Production Static Web UI Serving
const candidatePaths = [
  path.resolve(__dirname, "../public"),
  path.resolve(__dirname, "../../public"),
  path.resolve(__dirname, "../../../artifacts/truthguard-ai/dist/public"),
  path.resolve(process.cwd(), "public"),
  path.resolve(process.cwd(), "artifacts/api-server/public"),
  path.resolve(process.cwd(), "artifacts/truthguard-ai/dist/public")
];

const staticDir = candidatePaths.find((p) => fs.existsSync(p));

if (staticDir) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
