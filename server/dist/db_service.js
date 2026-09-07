"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgServer = void 0;
exports.startDatabase = startDatabase;
exports.stopDatabase = stopDatabase;
// @ts-ignore
const embedded_postgres_1 = __importDefault(require("embedded-postgres"));
const path_1 = __importDefault(require("path"));
const DB_DIR = path_1.default.join(__dirname, '../.pgdata');
const PORT = 5432;
const USER = 'postgres';
const PASSWORD = 'password';
const DB_NAME = 'skillbridge';
exports.pgServer = new embedded_postgres_1.default({
    port: PORT,
    databaseDir: DB_DIR,
    user: USER,
    password: PASSWORD,
    persistent: true,
});
async function startDatabase() {
    try {
        console.log('[PostgreSQL] Initialising cluster in', DB_DIR);
        await exports.pgServer.initialise();
    }
    catch (err) {
        // If already initialized, continue
        console.log('[PostgreSQL] Cluster already initialized or ready.');
    }
    try {
        console.log('[PostgreSQL] Starting PostgreSQL 18 engine on port 5432...');
        await exports.pgServer.start();
        console.log('[PostgreSQL] Server listening on localhost:5432.');
    }
    catch (err) {
        const errMsg = err?.message || String(err);
        if (errMsg.includes('already') || errMsg.includes('postmaster.pid')) {
            console.log('[PostgreSQL] Server is already running.');
        }
        else {
            console.warn('[PostgreSQL] Startup notice:', errMsg);
        }
    }
    try {
        await exports.pgServer.createDatabase(DB_NAME);
        console.log(`[PostgreSQL] Database "${DB_NAME}" is ready.`);
    }
    catch (err) {
        // Database already exists
    }
}
async function stopDatabase() {
    try {
        await exports.pgServer.stop();
        console.log('[PostgreSQL] Server stopped.');
    }
    catch (err) {
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
