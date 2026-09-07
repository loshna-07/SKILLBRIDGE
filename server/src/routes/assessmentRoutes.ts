import { Router } from 'express';
import {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  createAssessment,
  addQuestionToAssessment,
  getSkillCategories,
  createSkillCategory,
  createSkill,
  getSkills,
} from '../controllers/assessmentController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

router.get('/', getAssessments);
router.get('/categories', getSkillCategories);
router.get('/skills', getSkills);
router.get('/:id', getAssessmentById);
router.post('/:id/submit', authorizeRoles('STUDENT'), submitAssessment);

// Administrative / Academic / Institution creating assessments & skills
router.post('/', authorizeRoles('INSTITUTION', 'ACADEMICIAN'), createAssessment);
router.post('/:id/questions', authorizeRoles('INSTITUTION', 'ACADEMICIAN'), addQuestionToAssessment);
router.post('/categories', authorizeRoles('INSTITUTION', 'ACADEMICIAN'), createSkillCategory);
router.post('/skills', authorizeRoles('INSTITUTION', 'ACADEMICIAN'), createSkill);

export default router;
