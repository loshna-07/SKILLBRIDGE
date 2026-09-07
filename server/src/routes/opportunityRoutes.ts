import { Router } from 'express';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  applyToOpportunity,
  getOpportunityAssessment,
  submitOpportunityAssessment,
  getOpportunityApplicants,
  updateApplicationStatus,
  scheduleInterview,
} from '../controllers/opportunityController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Publicly viewable opportunities, or enriched if authenticated student
router.get('/', authenticateUser, getOpportunities);

// Industry management
router.get('/my/created', authenticateUser, authorizeRoles('INDUSTRY'), getMyOpportunities);
router.get('/my/applicants', authenticateUser, authorizeRoles('INDUSTRY'), getOpportunityApplicants);
router.post('/', authenticateUser, authorizeRoles('INDUSTRY'), createOpportunity);
router.put('/applications/:id/status', authenticateUser, authorizeRoles('INDUSTRY'), updateApplicationStatus);
router.patch('/applications/:id/status', authenticateUser, authorizeRoles('INDUSTRY'), updateApplicationStatus);
router.post('/applications/:id/interview', authenticateUser, authorizeRoles('INDUSTRY'), scheduleInterview);

// Single Opportunity & Assessment
router.get('/:id', authenticateUser, getOpportunityById);
router.put('/:id', authenticateUser, authorizeRoles('INDUSTRY'), updateOpportunity);
router.delete('/:id', authenticateUser, authorizeRoles('INDUSTRY'), deleteOpportunity);

// Opportunity-Specific Assessment endpoints
router.get('/:id/assessment', authenticateUser, getOpportunityAssessment);
router.post('/:id/assessment/submit', authenticateUser, authorizeRoles('STUDENT'), submitOpportunityAssessment);

// Direct apply (for opportunities without assessment)
router.post('/:id/apply', authenticateUser, authorizeRoles('STUDENT'), applyToOpportunity);

export default router;
