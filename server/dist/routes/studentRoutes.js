"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Student only routes
router.use(authMiddleware_1.authenticateUser);
router.get('/dashboard', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentDashboard);
router.get('/profile', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentProfile);
router.put('/profile', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.updateStudentProfile);
router.get('/skills', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentSkills);
router.get('/applications', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentApplications);
router.post('/applications/:id/withdraw', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.withdrawApplication);
// Digital Portfolio
router.get('/portfolio', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentPortfolio);
router.post('/portfolio/education', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addEducation);
router.delete('/portfolio/education/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteEducation);
router.post('/portfolio/certifications', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addCertification);
router.delete('/portfolio/certifications/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteCertification);
router.post('/portfolio/projects', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addProject);
router.delete('/portfolio/projects/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteProject);
router.post('/portfolio/internships', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addInternshipExperience);
router.delete('/portfolio/internships/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteInternshipExperience);
exports.default = router;
