import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  getMyCreatedCourses,
  addModule,
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson,
  enrollInCourse,
  getMyEnrolledCourses,
  getCourseStudyRoom,
  toggleLessonProgress,
  requestCourseCertificate,
  getCourseParticipants,
  approveCourseCertificate,
  getCourseRecommendations,
} from '../controllers/courseController';
import { authenticateUser, optionalAuthenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// 1. Public / Authenticated Browse
router.get('/', optionalAuthenticateUser, getCourses);
router.get('/recommendations', authenticateUser, authorizeRoles('STUDENT'), getCourseRecommendations);
router.get('/my/enrolled', authenticateUser, authorizeRoles('STUDENT'), getMyEnrolledCourses);
router.get('/my-courses', authenticateUser, authorizeRoles('STUDENT'), getMyEnrolledCourses);
router.get(
  '/my/created',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  getMyCreatedCourses
);

// 2. Course Detail & Study Room
router.get('/:id', optionalAuthenticateUser, getCourseById);
router.get('/:id/study', authenticateUser, authorizeRoles('STUDENT'), getCourseStudyRoom);
router.get(
  '/:id/participants',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  getCourseParticipants
);

// 3. Provider Actions (Create, Update, Status, Delete)
router.post(
  '/',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  createCourse
);
router.put(
  '/:id',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  updateCourse
);
router.patch(
  '/:id/status',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  updateCourseStatus
);
router.delete(
  '/:id',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  deleteCourse
);

// 4. Curriculum Modules & Lessons
router.post(
  '/:id/modules',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  addModule
);
router.put(
  '/:id/modules/:moduleId',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  updateModule
);
router.delete(
  '/:id/modules/:moduleId',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  deleteModule
);

router.post(
  '/:id/modules/:moduleId/lessons',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  addLesson
);
router.put(
  '/:id/lessons/:lessonId',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  updateLesson
);
router.delete(
  '/:id/lessons/:lessonId',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  deleteLesson
);

// 5. Student Enrollment & Learning Actions
router.post(
  '/:id/enroll',
  authenticateUser,
  authorizeRoles('STUDENT'),
  enrollInCourse
);
router.post(
  '/:id/lessons/:lessonId/toggle',
  authenticateUser,
  authorizeRoles('STUDENT'),
  toggleLessonProgress
);
router.post(
  '/:id/certificate/request',
  authenticateUser,
  authorizeRoles('STUDENT'),
  requestCourseCertificate
);

// 6. Provider / Institution Certificate Approval
router.post(
  '/:id/certificates/:certId/approve',
  authenticateUser,
  authorizeRoles('ACADEMICIAN', 'INSTITUTION', 'INDUSTRY'),
  approveCourseCertificate
);

export default router;
