"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
async function main() {
    await db_1.default.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE;');
    await db_1.default.$executeRawUnsafe('CREATE SCHEMA public;');
    console.log('Public schema dropped and recreated in PostgreSQL.');
    await db_1.default.$disconnect();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
