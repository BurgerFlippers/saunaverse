import { syncHarviaData } from './src/server/syncWorker';
syncHarviaData();

// Keep the process alive for continuous syncing (e.g., every 30 seconds)
setInterval(() => {
  syncHarviaData();
}, 30 * 1000); // 30 seconds