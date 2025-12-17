import { syncHarviaData, syncPolarData } from "../server/syncWorker";
syncHarviaData();
syncPolarData();

// Keep the process alive for continuous syncing (e.g., every 30 seconds)
setInterval(() => {
  syncHarviaData();
  syncPolarData();
}, 30 * 1000); // 30 seconds
