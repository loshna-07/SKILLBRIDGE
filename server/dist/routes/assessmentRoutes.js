"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessmentController_1 = require("../controllers/assessmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateUser);
router.get('/', assessmentController_1.getAssessments);
router.get('/categories', assessmentController_1.getSkillCategories);
router.get('/skills', assessmentController_1.getSkills);
router.get('/:id', assessmentController_1.getAssessmentById);
router.post('/:id/submit', (0, authMiddleware_1.authorizeRoles)('STUDENT'), assessmentController_1.submitAssessment);
// Administrative / Academic / Institution creating assessments & skills
router.post('/', (0, authMiddleware_1.authorizeRoles)('INSTITUTION', 'ACADEMICIAN'), assessmentController_1.createAssessment);
router.post('/:id/questions', (0, authMiddleware_1.authorizeRoles)('INSTITUTION', 'ACADEMICIAN'), assessmentController_1.addQuestionToAssessment);
router.post('/categories', (0, authMiddleware_1.authorizeRoles)('INSTITUTION', 'ACADEMICIAN'), assessmentController_1.createSkillCategory);
router.post('/skills', (0, authMiddleware_1.authorizeRoles)('INSTITUTION', 'ACADEMICIAN'), assessmentController_1.createSkill);
exports.default = router;
