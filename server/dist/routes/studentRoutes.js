"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public / shareable portfolio view
router.get('/portfolio/public/:id', studentController_1.getPublicPortfolio);
// Authenticated student routes
router.use(authMiddleware_1.authenticateUser);
router.get('/dashboard', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentDashboard);
router.get('/profile', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentProfile);
router.put('/profile', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.updateStudentProfile);
// Skills Management
router.get('/skills', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentSkills);
router.post('/skills', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addStudentSkill);
router.put('/skills/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.updateStudentSkill);
router.delete('/skills/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteStudentSkill);
router.get('/skill-gap', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentSkillGapAnalysis);
// Career Interests & Personalization Management
router.get('/interests', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentInterests);
router.put('/interests', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.updateStudentInterests);
router.put('/career-interests', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.updateStudentInterests);
router.post('/career-interests', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.updateStudentInterests);
// Skill Assessment & Skill Mapping Routes
router.get('/skill-profile', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentSkillProfileController);
router.get('/skill-mapping', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentSkillMappingController);
router.get('/recommended-industries', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentRecommendedIndustriesController);
router.get('/recommended-job-roles', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentRecommendedJobRolesController);
router.get('/skill-assessment', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentSkillAssessmentsController);
// Personalization & Recommendations
router.get('/recommendations', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentPersonalizedRecommendations);
router.get('/recommended-skills', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentRecommendedSkills);
router.get('/skills-to-learn', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentSkillsToLearn);
router.get('/skill-gaps', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentSkillGaps);
router.get('/recommended-courses', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentRecommendedCourses);
router.get('/recommended-internships', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentRecommendedInternships);
router.get('/recommended-jobs', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentRecommendedJobs);
router.get('/recommended-mentors', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentRecommendedMentors);
router.get('/recommended-collaborations', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentRecommendedCollaborations);
router.get('/opportunities/:id/match-details', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getOpportunityMatchDetails);
// Certifications Management
router.get('/certifications', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentCertifications);
router.post('/certifications', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addCertification);
router.put('/certifications/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.updateCertification);
router.delete('/certifications/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteCertification);
router.get('/applications', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentApplications);
router.post('/applications/:id/withdraw', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.withdrawApplication);
// Digital Portfolio Management
router.get('/portfolio', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.getStudentPortfolio);
// Education
router.post('/portfolio/education', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addEducation);
router.delete('/portfolio/education/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteEducation);
// Certifications
router.post('/portfolio/certifications', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addCertification);
router.delete('/portfolio/certifications/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteCertification);
// Projects
router.post('/portfolio/projects', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addProject);
router.delete('/portfolio/projects/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteProject);
// Internships
router.post('/portfolio/internships', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addInternshipExperience);
router.delete('/portfolio/internships/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteInternshipExperience);
// Skills
router.post('/portfolio/skills', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addStudentSkill);
router.delete('/portfolio/skills/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteStudentSkill);
// Achievements
router.post('/portfolio/achievements', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addAchievement);
router.delete('/portfolio/achievements/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteAchievement);
// Training
router.post('/portfolio/trainings', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.addTraining);
router.delete('/portfolio/trainings/:id', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.deleteTraining);
// Resume
router.put('/portfolio/resume', (0, authMiddleware_1.authorizeRoles)('STUDENT'), studentController_1.updateResume);
exports.default = router;
