"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
async function main() {
    console.log('Updating all assessment records to 75% passing score...');
    const result = await db_1.default.assessment.updateMany({
        data: {
            passingScore: 75.0,
        },
    });
    console.log(`Updated ${result.count} assessments to passingScore: 75.0`);
}
main()
    .catch(console.error)
    .finally(() => db_1.default.$disconnect());
