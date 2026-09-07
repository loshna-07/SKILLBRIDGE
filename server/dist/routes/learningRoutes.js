"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const learningController_1 = require("../controllers/learningController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateUser);
// Publicly browseable / enriched for students
router.get('/', learningController_1.getLearningPrograms);
// User-specific lists (placed BEFORE generic /:id)
router.get('/my/created', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), learningController_1.getMyLearningPrograms);
router.get('/my/enrollments', (0, authMiddleware_1.authorizeRoles)('STUDENT'), learningController_1.getMyEnrollments);
// Program creation
router.post('/', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), learningController_1.createLearningProgram);
// Single program actions
router.get('/:id', learningController_1.getLearningProgramById);
router.put('/:id', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), learningController_1.updateLearningProgram);
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), learningController_1.deleteLearningProgram);
router.put('/:id/publish', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), learningController_1.togglePublishProgram);
// Student registration / enrollment
router.post('/:id/enroll', (0, authMiddleware_1.authorizeRoles)('STUDENT'), learningController_1.enrollInProgram);
exports.default = router;
