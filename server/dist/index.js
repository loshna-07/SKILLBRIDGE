"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const opportunityRoutes_1 = __importDefault(require("./routes/opportunityRoutes"));
const assessmentRoutes_1 = __importDefault(require("./routes/assessmentRoutes"));
const learningRoutes_1 = __importDefault(require("./routes/learningRoutes"));
const academicianRoutes_1 = __importDefault(require("./routes/academicianRoutes"));
const institutionRoutes_1 = __importDefault(require("./routes/institutionRoutes"));
const collaborationRoutes_1 = __importDefault(require("./routes/collaborationRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'SkillBridge API', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/student', studentRoutes_1.default);
app.use('/api/opportunities', opportunityRoutes_1.default);
app.use('/api/assessments', assessmentRoutes_1.default);
app.use('/api/learning', learningRoutes_1.default);
app.use('/api/academician', academicianRoutes_1.default);
app.use('/api/institution', institutionRoutes_1.default);
app.use('/api/collaboration', collaborationRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
// Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`SkillBridge Backend Running on port ${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
});
