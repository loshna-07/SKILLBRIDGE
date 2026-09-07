// @ts-ignore
import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

const DB_DIR = path.join(__dirname, '../.pgdata');
const PORT = 5432;
const USER = 'postgres';
const PASSWORD = 'password';
const DB_NAME = 'skillbridge';

export const pgServer: any = new EmbeddedPostgres({
  port: PORT,
  databaseDir: DB_DIR,
  user: USER,
  password: PASSWORD,
  persistent: true,
});

export async function startDatabase(): Promise<void> {
  try {
    console.log('[PostgreSQL] Initialising cluster in', DB_DIR);
    await pgServer.initialise();
  } catch (err: any) {
    // If already initialized, continue
    console.log('[PostgreSQL] Cluster already initialized or ready.');
  }

  try {
    console.log('[PostgreSQL] Starting PostgreSQL 18 engine on port 5432...');
    await pgServer.start();
    console.log('[PostgreSQL] Server listening on localhost:5432.');
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('already') || errMsg.includes('postmaster.pid')) {
      console.log('[PostgreSQL] Server is already running.');
    } else {
      console.warn('[PostgreSQL] Startup notice:', errMsg);
    }
  }

  try {
    await pgServer.createDatabase(DB_NAME);
    console.log(`[PostgreSQL] Database "${DB_NAME}" is ready.`);
  } catch (err: any) {
    // Database already exists
  }
}

export async function stopDatabase(): Promise<void> {
  try {
    await pgServer.stop();
    console.log('[PostgreSQL] Server stopped.');
  } catch (err: any) {
    console.error('[PostgreSQL] Error stopping server:', err.message);
  }
}

// Standalone runner
if (require.main === module) {
  startDatabase().then(() => {
    console.log('[PostgreSQL] Service active. Keep this process running.');
  }).catch((err) => {
    console.error('[PostgreSQL] Failed to start:', err);
    process.exit(1);
  });
}
