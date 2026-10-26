/**
 * localMongo.js
 * Starts a local MongoDB instance using mongodb-memory-server with persistent
 * file-based storage so data survives server restarts.
 *
 * Usage: imported by server.js as a fallback when Atlas is unreachable.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '.local-mongo-data');

let mongodInstance = null;

/**
 * Start a local persistent MongoDB and return its connection URI.
 * Reuses the same data directory across restarts for persistence.
 */
export async function startLocalMongo() {
  if (mongodInstance) {
    return mongodInstance.getUri();
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log(`🗄️  Starting local MongoDB with data dir: ${DATA_DIR}`);

  mongodInstance = await MongoMemoryServer.create({
    instance: {
      dbPath: DATA_DIR,
      storageEngine: 'wiredTiger',
      dbName: 'skillswap'
    },
  });

  let uri = mongodInstance.getUri();
  if (!uri.includes('/skillswap')) {
    uri = uri.replace(/\/?$/, '/skillswap');
  }
  console.log(`✅ Local MongoDB started at: ${uri}`);
  return uri;
}

/**
 * Stop the local MongoDB instance gracefully.
 */
export async function stopLocalMongo() {
  if (mongodInstance) {
    await mongodInstance.stop();
    mongodInstance = null;
  }
}
