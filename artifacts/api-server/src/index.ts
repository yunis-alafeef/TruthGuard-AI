import app from "./app";
import { logger } from "./lib/logger";
import { spawn } from "node:child_process";
import path from "node:path";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const mlService = process.env.ML_SERVICE_URL
  ? undefined
  : spawn(
      "python3",
      [
        "-m",
        "uvicorn",
        "services.ml_service.app:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8001",
      ],
      {
        cwd: path.resolve(process.cwd(), "../.."),
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

mlService?.stdout.on("data", (chunk: Buffer) => {
  logger.info({ service: "ml", message: chunk.toString().trim() });
});
mlService?.stderr.on("data", (chunk: Buffer) => {
  logger.warn({ service: "ml", message: chunk.toString().trim() });
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

const shutdown = () => {
  mlService?.kill("SIGTERM");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
