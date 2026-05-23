import { createIngestionWorker } from "./workers/ingestion.js";
import { createSyncWorker } from "./workers/sync.js";

const ingestionWorker = createIngestionWorker();
const syncWorker = createSyncWorker();

ingestionWorker.on("failed", (job, err) => {
  console.error(`[ingestion] job ${job?.id} failed:`, err.message);
});

syncWorker.on("failed", (job, err) => {
  console.error(`[sync] job ${job?.id} failed:`, err.message);
});

console.log("Workers started — ingestion + sync");

async function shutdown() {
  await ingestionWorker.close();
  await syncWorker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
