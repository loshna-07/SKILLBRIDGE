import { Router } from 'express';
import {
  getLearningPrograms,
  getLearningProgramById,
  createLearningProgram,
  updateLearningProgram,
  deleteLearningProgram,
  togglePublishProgram,
  getMyLearningPrograms,
  enrollInProgram,
  getMyEnrollments,
} from '../controllers/learningController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

// Publicly browseable / enriched for students
router.get('/', getLearningPrograms);

// User-specific lists (placed BEFORE generic /:id)
router.get('/my/created', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), getMyLearningPrograms);
router.get('/my/enrollments', authorizeRoles('STUDENT'), getMyEnrollments);

// Program creation
router.post('/', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), createLearningProgram);

// Single program actions
router.get('/:id', getLearningProgramById);
router.put('/:id', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), updateLearningProgram);
router.delete('/:id', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), deleteLearningProgram);
router.put('/:id/publish', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), togglePublishProgram);

// Student registration / enrollment
router.post('/:id/enroll', authorizeRoles('STUDENT'), enrollInProgram);

export default router;
