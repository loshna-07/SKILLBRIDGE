export type UserRole = 'STUDENT' | 'ACADEMICIAN' | 'INDUSTRY' | 'INSTITUTION';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: any;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  dob?: string;
  gender?: string;
  institutionName: string;
  department: string;
  degree: string;
  currentYear?: number;
  cgpa?: number;
  graduationYear?: number;
  location?: string;
  resumeUrl?: string;
  bio?: string;
  careerInterests?: string;
  preferredRoles?: string;
  preferredLocations?: string;
  createdAt: string;
}

export interface AcademicianProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  institutionName: string;
  department: string;
  designation: string;
  yearsOfExperience?: number;
  areasOfExpertise?: string;
  location?: string;
  bio?: string;
}

export interface IndustryProfile {
  id: string;
  userId: string;
  companyName: string;
  officialEmail: string;
  industrySector: string;
  companySize?: string;
  website?: string;
  location?: string;
  description?: string;
  contactPerson?: string;
  contactNumber?: string;
  logoUrl?: string;
}

export interface InstitutionProfile {
  id: string;
  userId: string;
  institutionName: string;
  officialEmail: string;
  institutionType: string;
  affiliatedUniversity?: string;
  address?: string;
  website?: string;
  contactPerson?: string;
  contactNumber?: string;
  logoUrl?: string;
}

export interface Skill {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  category?: { id: string; name: string };
}

export interface StudentSkillProfile {
  id: string;
  studentId: string;
  skillId: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  scorePercentage: number;
  lastAssessedAt?: string;
  verified: boolean;
  skill: Skill;
}

export interface MatchingResult {
  matchScore: number;
  matchPercentage?: number;
  matchedSkills: Array<{ skillId?: string; name: string; proficiency: string; score?: number; isRequired: boolean }>;
  missingSkills?: Array<{ skillId?: string; name: string; isRequired: boolean }>;
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  eligibility?: {
    isEligible: boolean;
    cgpaEligible: boolean;
    departmentEligible: boolean;
    degreeEligible: boolean;
    skillsEligible: boolean;
    proficiencyEligible?: boolean;
    deadlineEligible?: boolean;
    minCgpa?: number | null;
    studentCgpa?: number | null;
    reasons: string[];
    ineligibleReasons?: string[];
    goodMatchReasons?: string[];
  };
  cgpaEligible: boolean;
  departmentEligible: boolean;
  degreeEligible: boolean;
  skillGaps?: Array<{
    skillId?: string;
    name: string;
    gapType: string;
    currentProficiency?: string;
    requiredProficiency?: string;
    severity: string;
    recommendation: string;
  }>;
  breakdown: {
    skillScore: number;
    assessmentScore: number;
    cgpaScore: number;
    academicScore: number;
  };
  weightsUsed?: {
    skillWeight: number;
    assessmentWeight: number;
    cgpaWeight: number;
    academicWeight: number;
  };
  explanation: string;
}

export interface Opportunity {
  id: string;
  industryId: string;
  title: string;
  type: 'INTERNSHIP' | 'JOB' | 'APPRENTICESHIP' | 'LIVE_PROJECT';
  description: string;
  degree?: string;
  department?: string;
  minCgpa?: number;
  experience?: string;
  location?: string;
  workMode: 'ON_SITE' | 'REMOTE' | 'HYBRID';
  stipendOrSalary?: string;
  applicationDeadline?: string;
  numberOfOpenings: number;
  duration?: string;
  startDate?: string;
  responsibilities?: string;
  selectionProcess?: string;
  isPublished: boolean;
  createdAt: string;
  industry?: {
    id: string;
    companyName: string;
    industrySector: string;
    location?: string;
    logoUrl?: string;
  };
  skills?: Array<{
    id: string;
    skillId: string;
    isRequired: boolean;
    skill: Skill;
  }>;
  matchResult?: MatchingResult;
  hasApplied?: boolean;
  applicationStatus?: string;
}

export interface Application {
  id: string;
  studentId: string;
  opportunityId: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
  matchScore: number;
  appliedAt: string;
  student?: StudentProfile & { skillProfiles?: StudentSkillProfile[] };
  opportunity?: Opportunity;
  history?: Array<{
    id: string;
    status: string;
    notes?: string;
    createdAt: string;
  }>;
  interviews?: Array<{
    id: string;
    scheduledAt: string;
    meetingLink?: string;
    notes?: string;
    status: string;
  }>;
}

export interface LearningProgram {
  id: string;
  providerId: string;
  providerRole: string;
  title: string;
  type: 'TRAINING' | 'CERTIFICATION' | 'WORKSHOP' | 'BOOTCAMP' | 'MENTORSHIP' | 'FDP' | string;
  description: string;
  duration?: string;
  url?: string;
  mode: string;
  price: string;
  startDate?: string;
  isPublished: boolean;
  skills?: Array<{ id?: string; skillId: string; skill: Skill }>;
  addressesGap?: boolean;
  gapSkillsCovered?: string[];
  isEnrolled?: boolean;
  matchResult?: MatchingResult;
  _count?: { enrollments: number };
  enrollments?: any[];
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  category?: string;
  durationMinutes: number;
  passingScore: number;
  questionsCount?: number;
  latestAttempt?: any;
  questions?: Array<{
    id: string;
    skillId?: string;
    questionText: string;
    difficulty: string;
    weightage: number;
    skill?: Skill;
    options: Array<{
      id: string;
      optionText: string;
      isCorrect?: boolean;
    }>;
  }>;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedById?: string;
  verifiedAt?: string;
  remarks?: string;
  createdAt: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
