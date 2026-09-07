import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleLayout } from './components/layout/RoleLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentAssessments } from './pages/student/StudentAssessments';
import { StudentSkillMapping } from './pages/student/StudentSkillMapping';
import { StudentSkills } from './pages/student/StudentSkills';
import { StudentCertifications } from './pages/student/StudentCertifications';
import { StudentInternships } from './pages/student/StudentInternships';
import { StudentJobs } from './pages/student/StudentJobs';
import { StudentLearning } from './pages/student/StudentLearning';
import { StudentApplications } from './pages/student/StudentApplications';
import { StudentPortfolio } from './pages/student/StudentPortfolio';
import { StudentCollaboration } from './pages/student/StudentCollaboration';
import { StudentCourseCatalog } from './pages/student/StudentCourseCatalog';
import { StudentCourseDetail } from './pages/student/StudentCourseDetail';
import { StudentMyCourses } from './pages/student/StudentMyCourses';
import { StudentCourseStudyRoom } from './pages/student/StudentCourseStudyRoom';

// Industry Pages
import { IndustryDashboard } from './pages/industry/IndustryDashboard';
import { IndustryProfile } from './pages/industry/IndustryProfile';
import { IndustryOpportunities } from './pages/industry/IndustryOpportunities';
import { CreateOpportunity } from './pages/industry/CreateOpportunity';
import { IndustryApplicants } from './pages/industry/IndustryApplicants';
import { IndustryLearningPrograms } from './pages/industry/IndustryLearningPrograms';
import { IndustryMentorship } from './pages/industry/IndustryMentorship';
import { IndustryCollaboration } from './pages/industry/IndustryCollaboration';
import { IndustryCourses } from './pages/industry/IndustryCourses';

// Academician Pages
import { AcademicianDashboard } from './pages/academician/AcademicianDashboard';
import { AcademicianProfile } from './pages/academician/AcademicianProfile';
import { AcademicianInternships } from './pages/academician/AcademicianInternships';
import { AcademicianFDP } from './pages/academician/AcademicianFDP';
import { AcademicianResearch } from './pages/academician/AcademicianResearch';
import { AcademicianWorkshops } from './pages/academician/AcademicianWorkshops';
import { AcademicianOpportunities } from './pages/academician/AcademicianOpportunities';
import { AcademicianParticipation } from './pages/academician/AcademicianParticipation';
import { AcademicianCourses } from './pages/academician/AcademicianCourses';

// Institution Pages
import { InstitutionDashboard } from './pages/institution/InstitutionDashboard';
import { InstitutionStudents } from './pages/institution/InstitutionStudents';
import { InstitutionAcademicians } from './pages/institution/InstitutionAcademicians';
import { InstitutionPortfolioVerification } from './pages/institution/InstitutionPortfolioVerification';
import { InstitutionSkills } from './pages/institution/InstitutionSkills';
import { InstitutionAnalytics } from './pages/institution/InstitutionAnalytics';
import { InstitutionCollaboration } from './pages/institution/InstitutionCollaboration';
import { InstitutionCourses } from './pages/institution/InstitutionCourses';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<RoleLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="assessment" element={<StudentAssessments />} />
              <Route path="skill-assessment" element={<StudentAssessments />} />
              <Route path="skill-mapping" element={<StudentSkillMapping />} />
              <Route path="skills" element={<StudentSkills />} />
              <Route path="certifications" element={<StudentCertifications />} />
              <Route path="internships" element={<StudentInternships />} />
              <Route path="jobs" element={<StudentJobs />} />
              <Route path="learning" element={<StudentLearning />} />
              <Route path="applications" element={<StudentApplications />} />
              <Route path="portfolio" element={<StudentPortfolio />} />
              <Route path="collaboration" element={<StudentCollaboration />} />
              <Route path="courses" element={<StudentCourseCatalog />} />
              <Route path="courses/:id" element={<StudentCourseDetail />} />
              <Route path="my-courses" element={<StudentMyCourses />} />
              <Route path="my-courses/:id" element={<StudentCourseStudyRoom />} />
            </Route>
          </Route>

          {/* Protected Industry Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INDUSTRY']} />}>
            <Route path="/industry" element={<RoleLayout />}>
              <Route index element={<Navigate to="/industry/dashboard" replace />} />
              <Route path="dashboard" element={<IndustryDashboard />} />
              <Route path="profile" element={<IndustryProfile />} />
              <Route path="opportunities" element={<IndustryOpportunities />} />
              <Route path="opportunities/create" element={<CreateOpportunity />} />
              <Route path="opportunities/edit/:id" element={<CreateOpportunity />} />
              <Route path="applicants" element={<IndustryApplicants />} />
              <Route path="learning-programs" element={<IndustryLearningPrograms />} />
              <Route path="courses" element={<IndustryCourses />} />
              <Route path="mentorship" element={<IndustryMentorship />} />
              <Route path="projects" element={<IndustryCollaboration />} />
              <Route path="collaboration" element={<IndustryCollaboration />} />
            </Route>
          </Route>

          {/* Protected Academician Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ACADEMICIAN']} />}>
            <Route path="/academician" element={<RoleLayout />}>
              <Route index element={<Navigate to="/academician/dashboard" replace />} />
              <Route path="dashboard" element={<AcademicianDashboard />} />
              <Route path="profile" element={<AcademicianProfile />} />
              <Route path="opportunities" element={<AcademicianOpportunities />} />
              <Route path="courses" element={<AcademicianCourses />} />
              <Route path="participations" element={<AcademicianParticipation />} />
              <Route path="internships" element={<AcademicianOpportunities />} />
              <Route path="fdp" element={<AcademicianOpportunities />} />
              <Route path="consultancy" element={<AcademicianOpportunities />} />
              <Route path="research" element={<AcademicianOpportunities />} />
              <Route path="workshops" element={<AcademicianOpportunities />} />
              <Route path="mentorship" element={<AcademicianOpportunities />} />
              <Route path="projects" element={<AcademicianOpportunities />} />
            </Route>
          </Route>

          {/* Protected Institution Routes */}
          <Route element={<ProtectedRoute allowedRoles={['INSTITUTION']} />}>
            <Route path="/institution" element={<RoleLayout />}>
              <Route index element={<Navigate to="/institution/dashboard" replace />} />
              <Route path="dashboard" element={<InstitutionDashboard />} />
              <Route path="students" element={<InstitutionStudents />} />
              <Route path="academicians" element={<InstitutionAcademicians />} />
              <Route path="verify-portfolio" element={<InstitutionPortfolioVerification />} />
              <Route path="skills" element={<InstitutionSkills />} />
              <Route path="courses" element={<InstitutionCourses />} />
              <Route path="internships" element={<InstitutionDashboard />} />
              <Route path="placements" element={<InstitutionDashboard />} />
              <Route path="industry" element={<InstitutionCollaboration />} />
              <Route path="analytics" element={<InstitutionAnalytics />} />
              <Route path="collaboration" element={<InstitutionCollaboration />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
