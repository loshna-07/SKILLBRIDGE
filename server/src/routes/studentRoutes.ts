import { Router } from 'express';
import {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  getStudentSkills,
  getStudentSkillGapAnalysis,
  getStudentApplications,
  withdrawApplication,
  getStudentPortfolio,
  addEducation,
  deleteEducation,
  getStudentCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
  addProject,
  deleteProject,
  addInternshipExperience,
  deleteInternshipExperience,
  addStudentSkill,
  updateStudentSkill,
  deleteStudentSkill,
  getStudentInterests,
  updateStudentInterests,
  getStudentPersonalizedRecommendations,
  getStudentRecommendedSkills,
  getStudentRecommendedCourses,
  getStudentRecommendedInternships,
  getStudentRecommendedJobs,
  getStudentSkillsToLearn,
  getStudentSkillGaps,
  getStudentRecommendedMentors,
  getStudentRecommendedCollaborations,
  getOpportunityMatchDetails,
  getStudentSkillProfileController,
  getStudentSkillMappingController,
  getStudentRecommendedIndustriesController,
  getStudentRecommendedJobRolesController,
  getStudentSkillAssessmentsController,
  addAchievement,
  deleteAchievement,
  addTraining,
  deleteTraining,
  updateResume,
  getPublicPortfolio,
} from '../controllers/studentController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public / shareable portfolio view
router.get('/portfolio/public/:id', getPublicPortfolio);

// Authenticated student routes
router.use(authenticateUser);

router.get('/dashboard', authorizeRoles('STUDENT'), getStudentDashboard);
router.get('/profile', authorizeRoles('STUDENT'), getStudentProfile);
router.put('/profile', authorizeRoles('STUDENT'), updateStudentProfile);

// Skills Management
router.get('/skills', authorizeRoles('STUDENT'), getStudentSkills);
router.post('/skills', authorizeRoles('STUDENT'), addStudentSkill);
router.put('/skills/:id', authorizeRoles('STUDENT'), updateStudentSkill);
router.delete('/skills/:id', authorizeRoles('STUDENT'), deleteStudentSkill);
router.get('/skill-gap', authorizeRoles('STUDENT'), getStudentSkillGapAnalysis);

// Career Interests & Personalization Management
router.get('/interests', authorizeRoles('STUDENT'), getStudentInterests);
router.put('/interests', authorizeRoles('STUDENT'), updateStudentInterests);
router.put('/career-interests', authorizeRoles('STUDENT'), updateStudentInterests);
router.post('/career-interests', authorizeRoles('STUDENT'), updateStudentInterests);


// Skill Assessment & Skill Mapping Routes
router.get('/skill-profile', authorizeRoles('STUDENT'), getStudentSkillProfileController);
router.get('/skill-mapping', authorizeRoles('STUDENT'), getStudentSkillMappingController);
router.get('/recommended-industries', authorizeRoles('STUDENT'), getStudentRecommendedIndustriesController);
router.get('/recommended-job-roles', authorizeRoles('STUDENT'), getStudentRecommendedJobRolesController);
router.get('/skill-assessment', authorizeRoles('STUDENT'), getStudentSkillAssessmentsController);

// Personalization & Recommendations
router.get('/recommendations', authorizeRoles('STUDENT'), getStudentPersonalizedRecommendations);
router.get('/recommended-skills', authorizeRoles('STUDENT'), getStudentRecommendedSkills);
router.get('/skills-to-learn', authorizeRoles('STUDENT'), getStudentSkillsToLearn);
router.get('/skill-gaps', authorizeRoles('STUDENT'), getStudentSkillGaps);
router.get('/recommended-courses', authorizeRoles('STUDENT'), getStudentRecommendedCourses);
router.get('/recommended-internships', authorizeRoles('STUDENT'), getStudentRecommendedInternships);
router.get('/recommended-jobs', authorizeRoles('STUDENT'), getStudentRecommendedJobs);
router.get('/recommended-mentors', authorizeRoles('STUDENT'), getStudentRecommendedMentors);
router.get('/recommended-collaborations', authorizeRoles('STUDENT'), getStudentRecommendedCollaborations);
router.get('/opportunities/:id/match-details', authorizeRoles('STUDENT'), getOpportunityMatchDetails);

// Certifications Management
router.get('/certifications', authorizeRoles('STUDENT'), getStudentCertifications);
router.post('/certifications', authorizeRoles('STUDENT'), addCertification);
router.put('/certifications/:id', authorizeRoles('STUDENT'), updateCertification);
router.delete('/certifications/:id', authorizeRoles('STUDENT'), deleteCertification);

router.get('/applications', authorizeRoles('STUDENT'), getStudentApplications);
router.post('/applications/:id/withdraw', authorizeRoles('STUDENT'), withdrawApplication);

// Digital Portfolio Management
router.get('/portfolio', authorizeRoles('STUDENT'), getStudentPortfolio);

// Education
router.post('/portfolio/education', authorizeRoles('STUDENT'), addEducation);
router.delete('/portfolio/education/:id', authorizeRoles('STUDENT'), deleteEducation);

// Certifications
router.post('/portfolio/certifications', authorizeRoles('STUDENT'), addCertification);
router.delete('/portfolio/certifications/:id', authorizeRoles('STUDENT'), deleteCertification);

// Projects
router.post('/portfolio/projects', authorizeRoles('STUDENT'), addProject);
router.delete('/portfolio/projects/:id', authorizeRoles('STUDENT'), deleteProject);

// Internships
router.post('/portfolio/internships', authorizeRoles('STUDENT'), addInternshipExperience);
router.delete('/portfolio/internships/:id', authorizeRoles('STUDENT'), deleteInternshipExperience);

// Skills
router.post('/portfolio/skills', authorizeRoles('STUDENT'), addStudentSkill);
router.delete('/portfolio/skills/:id', authorizeRoles('STUDENT'), deleteStudentSkill);

// Achievements
router.post('/portfolio/achievements', authorizeRoles('STUDENT'), addAchievement);
router.delete('/portfolio/achievements/:id', authorizeRoles('STUDENT'), deleteAchievement);

// Training
router.post('/portfolio/trainings', authorizeRoles('STUDENT'), addTraining);
router.delete('/portfolio/trainings/:id', authorizeRoles('STUDENT'), deleteTraining);

// Resume
router.put('/portfolio/resume', authorizeRoles('STUDENT'), updateResume);

export default router;
