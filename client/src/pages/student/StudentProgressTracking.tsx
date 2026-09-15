import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  GraduationCap,
  Building,
  RefreshCw,
  FileCheck2,
  Flame,
  ArrowRight,
  Compass,
  Check,
  Zap,
  HelpCircle,
  FileText,
  Search,
  ExternalLink,
} from 'lucide-react';

interface SubSkill {
  subSkillId: string;
  subSkillName: string;
  scorePercentage: number;
  proficiencyLevel: string;
  questionsAttempted?: number;
  questionsCorrect?: number;
  lastAssessedAt?: string;
}

interface SkillProgress {
  skillId: string;
  skillName: string;
  categoryName: string;
  currentScore: number;
  currentProficiency: string;
  previousScore: number;
  improvementDelta: number;
  lastAssessedAt: string;
  verified: boolean;
  verificationStatus: string;
  highestEvidenceLevel: string;
  evidenceStrength: string;
  evidenceList: any[];
  subSkills: SubSkill[];
}

interface EnrolledCourse {
  id: string;
  courseId: string;
  title: string;
  category: string;
  duration: string;
  progressPercentage: number;
  completed: boolean;
  totalLessons: number;
  completedLessons: number;
  certificateRequested?: boolean;
  certificateApproved?: boolean;
  certificateUrl?: string;
}

interface RoadmapStage {
  phaseNumber: number;
  title: string;
  subSkillName?: string;
  skillName?: string;
  currentScore?: number;
  targetScore?: number;
  isMandatory?: boolean;
  topicsToMaster?: string[];
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | string;
  recommendedCourse?: any;
}

interface OpportunityReadiness {
  opportunityId: string;
  title: string;
  companyName: string;
  type: string;
  location: string;
  workMode: string;
  stipendOrSalary?: string;
  readinessPercentage: number;
  requiredThreshold: number;
  isReady: boolean;
  matchedSkills: string[];
  missingSkills: string[];
  skillsImproving: string[];
}

interface ProgressData {
  isEmpty: boolean;
  studentInfo: {
    id: string;
    fullName: string;
    department: string;
    degree: string;
    institutionName: string;
    careerGoal: string;
  };
  overallProgress: {
    overallProgressPercentage: number;
    skillsImprovedCount: number;
    skillsDevelopingCount: number;
    skillsNeedingAttentionCount: number;
    currentOverallScore: number;
    previousOverallScore: number;
    overallDelta: number;
    totalAssessedSkills: number;
  };
  skillProgress: SkillProgress[];
  learningProgress: {
    coursesCompleted: number;
    coursesInProgress: number;
    coursesNotStarted: number;
    totalLearningHours: number;
    courseCompletionPercentage: number;
    assessmentCompletionCount: number;
    enrolledCourses: EnrolledCourse[];
  };
  roadmapProgress: {
    careerGoal: string;
    overallProgressPercentage: number;
    completedStages: RoadmapStage[];
    inProgressStages: RoadmapStage[];
    upcomingStages: RoadmapStage[];
  };
  assessmentProgress: {
    totalAttempts: number;
    skillBridgeCount: number;
    industryCount: number;
    latestAssessment: {
      title: string;
      type: string;
      scorePercentage: number;
      passed: boolean;
      date: string;
    } | null;
    previousAssessment: {
      title: string;
      type: string;
      scorePercentage: number;
      passed: boolean;
      date: string;
    } | null;
    timeline: Array<{
      id: string;
      title: string;
      category: string;
      type: string;
      scorePercentage: number;
      passed: boolean;
      date: string;
    }>;
  };
  evidenceProfile: any[];
  opportunityReadiness: OpportunityReadiness[];
}

export const StudentProgressTracking: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Navigation State
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SKILLS' | 'LEARNING' | 'ROADMAP' | 'ASSESSMENTS' | 'EVIDENCE' | 'OPPORTUNITIES'>('OVERVIEW');
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchProgressData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.get('/student/progress-tracking');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to fetch progress tracking:', err);
      setError(err.response?.data?.message || 'Failed to load progress tracking data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const toggleSkillExpand = (skillId: string) => {
    setExpandedSkills((prev) => ({ ...prev, [skillId]: !prev[skillId] }));
  };

  const getProficiencyBadge = (level: string, score: number) => {
    const l = level?.toUpperCase() || (score >= 90 ? 'EXPERT' : score >= 75 ? 'ADVANCED' : score >= 60 ? 'INTERMEDIATE' : score >= 40 ? 'DEVELOPING' : 'BEGINNER');
    switch (l) {
      case 'EXPERT':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Expert ({score}%)</span>;
      case 'ADVANCED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Advanced ({score}%)</span>;
      case 'INTERMEDIATE':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">Intermediate ({score}%)</span>;
      case 'DEVELOPING':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-800">Developing ({score}%)</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">Beginner ({score}%)</span>;
    }
  };

  const getEvidenceStrengthBadge = (strength: string) => {
    switch (strength?.toUpperCase()) {
      case 'HIGH':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">High Confidence</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">Medium Confidence</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">Self-Declared</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Aggregating unified progress tracking intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-xs text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Error Loading Progress Tracking</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error || 'Could not retrieve student development record.'}</p>
        <button
          onClick={() => fetchProgressData()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Check Empty State
  if (data.isEmpty) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 py-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
            <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Your progress journey starts here.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 text-base">
            SkillBridge provides end-to-end skill verification, learning milestones, and AI-driven career roadmaps. Complete your first steps below to populate your live intelligence profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <Link
              to="/student/assessment"
              className="p-5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-between">
                Take Assessment <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Benchmark your current baseline skills with interactive tests.</p>
            </Link>

            <Link
              to="/student/profile"
              className="p-5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-between">
                Add Your Skills <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Declare your technical competencies and career domains.</p>
            </Link>

            <Link
              to="/student/certifications"
              className="p-5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center justify-between">
                Upload Evidence <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Provide certificates and project proofs for verification.</p>
            </Link>

            <Link
              to="/student/courses"
              className="p-5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center justify-between">
                Enroll in Courses <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Browse curated training programs to bridge skill gaps.</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter skills by search and category
  const categories = ['ALL', ...Array.from(new Set((data.skillProgress || []).map((s) => s.categoryName)))];
  const filteredSkills = (data.skillProgress || []).filter((s) => {
    const matchesCat = selectedCategory === 'ALL' || s.categoryName === selectedCategory;
    const matchesSearch = s.skillName.toLowerCase().includes(searchQuery.toLowerCase()) || s.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* 1. Page Header with Student Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Comprehensive Student Development Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Progress Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base max-w-2xl">
              Real-time multi-dimensional tracking across verified skills, granular sub-skills, learning milestones, AI career roadmaps, and industry readiness.
            </p>

            {/* Student Context Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                {data.studentInfo.fullName}
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                {data.studentInfo.department} • {data.studentInfo.degree}
              </span>
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 font-semibold">
                <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Target Goal: {data.studentInfo.careerGoal || 'Specialist'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => fetchProgressData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh Analytics'}
            </button>
            <Link
              to="/student/skill-mapping"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              Skill Mapping
            </Link>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          {[
            { id: 'OVERVIEW', label: 'Overall Progress' },
            { id: 'SKILLS', label: 'Granular Skills' },
            { id: 'LEARNING', label: 'Learning Hub' },
            { id: 'ROADMAP', label: 'Career Roadmap' },
            { id: 'ASSESSMENTS', label: 'Assessment Timeline' },
            { id: 'EVIDENCE', label: 'Evidence & Verification' },
            { id: 'OPPORTUNITIES', label: 'Opportunity Readiness' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. OVERALL PROGRESS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Skill Progress % */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Proficiency</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {data.overallProgress.overallProgressPercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Level</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, data.overallProgress.overallProgressPercentage))}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Across {data.overallProgress.totalAssessedSkills} registered skill domains
          </p>
        </div>

        {/* Skills Improved Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills Improved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {data.overallProgress.skillsImprovedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Positive Delta</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${data.overallProgress.totalAssessedSkills > 0 ? (data.overallProgress.skillsImprovedCount / data.overallProgress.totalAssessedSkills) * 100 : 0}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {data.overallProgress.skillsDevelopingCount} currently developing • {data.overallProgress.skillsNeedingAttentionCount} need attention
          </p>
        </div>

        {/* Previous vs Current Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score Progression</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Prev: <span className="font-semibold text-slate-700 dark:text-slate-300">{data.overallProgress.previousOverallScore}%</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Current: <span className="font-bold text-slate-900 dark:text-slate-100">{data.overallProgress.currentOverallScore}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                data.overallProgress.overallDelta >= 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {data.overallProgress.overallDelta >= 0 ? `+${data.overallProgress.overallDelta}% Growth` : `${data.overallProgress.overallDelta}%`}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">since initial baseline</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Verified through assessments & evidence</p>
        </div>

        {/* Learning & Roadmap Velocity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Learning Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {data.learningProgress.totalLearningHours} hrs
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Invested</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-purple-600 dark:bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, data.learningProgress.courseCompletionPercentage))}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {data.learningProgress.coursesCompleted} completed • {data.learningProgress.coursesInProgress} in progress
          </p>
        </div>
      </div>

      {/* 3. SKILL PROGRESS WITH GRANULAR SUB-SKILL ACCORDION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Granular Skill Progression
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any skill to inspect granular sub-skills, specific competencies, and delta improvement.
                </p>
              </div>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skill Cards List */}
        <div className="space-y-4">
          {filteredSkills.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No skills match your search query.
            </div>
          ) : (
            filteredSkills.map((skill) => {
              const isExpanded = !!expandedSkills[skill.skillId];
              return (
                <div
                  key={skill.skillId}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 transition-all overflow-hidden"
                >
                  {/* Skill Summary Header */}
                  <div
                    onClick={() => toggleSkillExpand(skill.skillId)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        className="mt-1 sm:mt-0 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-transform"
                      >
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {skill.skillName}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                            {skill.categoryName}
                          </span>
                          {getProficiencyBadge(skill.currentProficiency, skill.currentScore)}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Last assessed: {new Date(skill.lastAssessedAt).toLocaleDateString()} • {skill.subSkills.length} Granular Sub-Skills
                        </p>
                      </div>
                    </div>

                    {/* Score Bar & Delta */}
                    <div className="flex items-center gap-6 md:w-80">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-500 dark:text-slate-400">
                            Prev: {skill.previousScore}%
                          </span>
                          <span className="text-slate-900 dark:text-slate-100 font-bold">
                            Current: {skill.currentScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              skill.currentScore >= 75
                                ? 'bg-blue-600 dark:bg-blue-500'
                                : skill.currentScore >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, skill.currentScore))}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2.5 py-1 text-xs font-bold rounded-lg ${
                            skill.improvementDelta > 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : skill.improvementDelta < 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {skill.improvementDelta > 0 ? `+${skill.improvementDelta}%` : `${skill.improvementDelta}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Sub-Skills View */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Granular Sub-Skill Breakdown for {skill.skillName}
                        </h4>
                        <span className="text-xs text-slate-400">Objective Criteria Testing</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {skill.subSkills.map((sub) => (
                          <div
                            key={sub.subSkillId}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                                {sub.subSkillName}
                              </span>
                              {getProficiencyBadge(sub.proficiencyLevel, sub.scorePercentage)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                <span>Mastery</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{sub.scorePercentage}%</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    sub.scorePercentage >= 75
                                      ? 'bg-blue-600 dark:bg-blue-500'
                                      : sub.scorePercentage >= 60
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(5, sub.scorePercentage))}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. LEARNING HUB & COURSES PROGRESS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Learning Progress & Training Programs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Course enrollments, study hours, lesson completion rates, and certificates earned.
              </p>
            </div>
          </div>

          <Link
            to="/student/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Explore Course Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Learning Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {data.learningProgress.coursesCompleted}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Courses Completed</p>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.learningProgress.coursesInProgress}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">In Progress</p>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.learningProgress.totalLearningHours}h
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Study Time</p>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {data.learningProgress.assessmentCompletionCount}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assessments Taken</p>
          </div>
        </div>

        {/* Enrolled Courses Cards */}
        {data.learningProgress.enrolledCourses.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">You have not enrolled in any training courses yet.</p>
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Recommended Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.learningProgress.enrolledCourses.map((c) => (
              <div
                key={c.id}
                className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-md">
                      {c.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {c.duration}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{c.title}</h4>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">
                      {c.completedLessons} / {c.totalLessons} lessons completed
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{c.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.completed ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, c.progressPercentage))}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs">
                    {c.completed ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certificate Earned
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">In Progress</span>
                    )}
                  </div>
                  <Link
                    to={`/student/my-courses/${c.courseId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Open Study Room <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. CAREER ROADMAP PROGRESS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Career Roadmap Milestones
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized sequential progression towards: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{data.roadmapProgress.careerGoal}</span>
              </p>
            </div>
          </div>

          <Link
            to="/student/skill-mapping"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Customize Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3-Stage Sequential Roadmap Timeline */}
        <div className="space-y-4">
          {/* Phase 1: Completed */}
          {data.roadmapProgress.completedStages.length > 0 && (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Completed Milestones ({data.roadmapProgress.completedStages.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {data.roadmapProgress.completedStages.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between"
                  >
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{st.title || st.skillName}</span>
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md">
                      {st.currentScore || 85}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 2: In Progress */}
          {data.roadmapProgress.inProgressStages.length > 0 && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm">
                <Flame className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Current Active Focus ({data.roadmapProgress.inProgressStages.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {data.roadmapProgress.inProgressStages.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-200/80 dark:border-blue-900/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{st.title || st.skillName}</span>
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 rounded-md">
                        Target: {st.targetScore || 75}%
                      </span>
                    </div>
                    {st.topicsToMaster && st.topicsToMaster.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {st.topicsToMaster.slice(0, 3).map((top, tidx) => (
                          <span key={tidx} className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                            {top}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 3: Upcoming */}
          {data.roadmapProgress.upcomingStages.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                Upcoming Milestones ({data.roadmapProgress.upcomingStages.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {data.roadmapProgress.upcomingStages.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-80"
                  >
                    <span className="font-medium text-xs text-slate-800 dark:text-slate-200">{st.title || st.skillName}</span>
                    <span className="text-[11px] text-slate-400">Target {st.targetScore || 75}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. ASSESSMENT TIMELINE & PERFORMANCE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Assessment Timeline & Historical Score Evolution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed record of SkillBridge platform assessments and industry-validated assessments.
              </p>
            </div>
          </div>

          <Link
            to="/student/assessment"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Take Skill Assessment <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Latest vs Previous Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latest Assessment</span>
            {data.assessmentProgress.latestAssessment ? (
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{data.assessmentProgress.latestAssessment.title}</h4>
                  <span className="px-2.5 py-1 text-xs font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-lg">
                    {data.assessmentProgress.latestAssessment.scorePercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(data.assessmentProgress.latestAssessment.date).toLocaleDateString()} • {data.assessmentProgress.latestAssessment.type}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No assessments taken yet.</p>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Previous Assessment</span>
            {data.assessmentProgress.previousAssessment ? (
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{data.assessmentProgress.previousAssessment.title}</h4>
                  <span className="px-2.5 py-1 text-xs font-extrabold bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-lg">
                    {data.assessmentProgress.previousAssessment.scorePercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(data.assessmentProgress.previousAssessment.date).toLocaleDateString()} • {data.assessmentProgress.previousAssessment.type}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">Previous comparison record will appear after your second assessment.</p>
            )}
          </div>
        </div>

        {/* Chronological Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Assessment Title</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Score</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.assessmentProgress.timeline.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">No assessment history recorded.</td>
                </tr>
              ) : (
                data.assessmentProgress.timeline.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{item.title}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.category}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{item.scorePercentage}%</td>
                    <td className="py-3 px-4">
                      {item.passed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Developing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. SKILL EVIDENCE & 5-TIER VERIFICATION LIFECYCLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Evidence-Based Skill Verification Lifecycle
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                5-level evidence hierarchy distinguishing self-declaration from verified credentials and industry validation.
              </p>
            </div>
          </div>

          <Link
            to="/student/certifications"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Upload Certificates & Evidence <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5-Tier Hierarchy Legend */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
            5-Tier Verification Pipeline:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">1. Self-Declared</span>
              <span className="text-[10px] text-slate-400">Profile Claimed</span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-blue-600 dark:text-blue-400 block">2. Evidence Provided</span>
              <span className="text-[10px] text-slate-400">Document Uploaded</span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-purple-600 dark:text-purple-400 block">3. Credential Verified</span>
              <span className="text-[10px] text-slate-400">Institution Audited</span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-amber-600 dark:text-amber-400 block">4. SkillBridge Assessed</span>
              <span className="text-[10px] text-slate-400">Platform Tested</span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">5. Industry Validated</span>
              <span className="text-[10px] text-slate-400">Direct Employer Valid</span>
            </div>
          </div>
        </div>

        {/* Skill Evidence Cards */}
        <div className="space-y-3">
          {(data.skillProgress || []).map((skill) => (
            <div
              key={skill.skillId}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{skill.skillName}</h4>
                  <span className="px-2 py-0.5 text-xs bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                    {skill.categoryName}
                  </span>
                  {getEvidenceStrengthBadge(skill.evidenceStrength)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Highest Evidence Reached: <span className="font-semibold text-slate-700 dark:text-slate-300">{skill.highestEvidenceLevel?.replace('_', ' ')}</span>
                </p>
              </div>

              {/* 5-Step Progress Indicators */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['SELF_DECLARED', 'EVIDENCE_PROVIDED', 'CREDENTIAL_VERIFIED', 'SKILL_ASSESSED', 'INDUSTRY_VALIDATED'].map((tier, idx) => {
                  const tiers = ['SELF_DECLARED', 'EVIDENCE_PROVIDED', 'CREDENTIAL_VERIFIED', 'SKILL_ASSESSED', 'INDUSTRY_VALIDATED'];
                  const highestIdx = tiers.indexOf(skill.highestEvidenceLevel);
                  const isAchieved = highestIdx >= idx;

                  return (
                    <div
                      key={tier}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
                        isAchieved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isAchieved ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      Tier {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. OPPORTUNITY READINESS & MATCHING */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Target Opportunity Readiness
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Objective match percentage against real internship and job requisitions.
              </p>
            </div>
          </div>

          <Link
            to="/student/internships"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All Postings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.opportunityReadiness.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-sm">
            No industry opportunities currently mapped. Explore live postings from the Opportunities hub.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.opportunityReadiness.map((opp) => (
              <div
                key={opp.opportunityId}
                className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-800/30 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {opp.companyName}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md">
                      {opp.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{opp.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {opp.location} • {opp.workMode} {opp.stipendOrSalary ? `• ${opp.stipendOrSalary}` : ''}
                  </p>
                </div>

                {/* Readiness Gauge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">
                      Readiness: <span className="font-extrabold text-slate-900 dark:text-slate-100">{opp.readinessPercentage}%</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">Required: {opp.requiredThreshold}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        opp.readinessPercentage >= opp.requiredThreshold ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, opp.readinessPercentage))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Skills Breakdown Tags */}
                <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                  {opp.matchedSkills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                        Matched Competencies ({opp.matchedSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {opp.matchedSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {opp.missingSkills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1">
                        Skills to Improve ({opp.missingSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {opp.missingSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          >
                            △ {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      opp.isReady
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {opp.isReady ? 'Ready to Apply' : 'Skill Gap Present'}
                  </span>
                  <Link
                    to={`/student/internships`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Opportunity <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
