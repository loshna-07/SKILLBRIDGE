"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// 1. Public / Authenticated Browse
router.get('/', authMiddleware_1.optionalAuthenticateUser, courseController_1.getCourses);
router.get('/recommendations', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), courseController_1.getCourseRecommendations);
router.get('/my/enrolled', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), courseController_1.getMyEnrolledCourses);
router.get('/my-courses', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), courseController_1.getMyEnrolledCourses);
router.get('/my/created', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.getMyCreatedCourses);
// 2. Course Detail & Study Room
router.get('/:id', authMiddleware_1.optionalAuthenticateUser, courseController_1.getCourseById);
router.get('/:id/study', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), courseController_1.getCourseStudyRoom);
router.get('/:id/participants', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.getCourseParticipants);
// 3. Provider Actions (Create, Update, Status, Delete)
router.post('/', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.createCourse);
router.put('/:id', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.updateCourse);
router.patch('/:id/status', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.updateCourseStatus);
router.delete('/:id', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.deleteCourse);
// 4. Curriculum Modules & Lessons
router.post('/:id/modules', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.addModule);
router.put('/:id/modules/:moduleId', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.updateModule);
router.delete('/:id/modules/:moduleId', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.deleteModule);
router.post('/:id/modules/:moduleId/lessons', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.addLesson);
router.put('/:id/lessons/:lessonId', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.updateLesson);
router.delete('/:id/lessons/:lessonId', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.deleteLesson);
// 5. Student Enrollment & Learning Actions
router.post('/:id/enroll', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), courseController_1.enrollInCourse);
router.post('/:id/lessons/:lessonId/toggle', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), courseController_1.toggleLessonProgress);
router.post('/:id/certificate/request', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), courseController_1.requestCourseCertificate);
// 6. Provider / Institution Certificate Approval
router.post('/:id/certificates/:certId/approve', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'), courseController_1.approveCourseCertificate);
exports.default = router;
