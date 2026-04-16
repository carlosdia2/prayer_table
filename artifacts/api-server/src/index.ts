import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] ?? "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  if (process.env.DATABASE_URL) {
    try {
      const { seedIfEmpty } = await import("./lib/seed");
      await seedIfEmpty();
    } catch (seedErr) {
      logger.error({ err: seedErr }, "Error en seed inicial");
    }
  }
});
