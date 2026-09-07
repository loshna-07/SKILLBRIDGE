import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Calendar,
  Building,
  MapPin,
  Clock,
  ChevronRight,
  XCircle,
  Edit2,
  HelpCircle,
  CheckSquare,
  Users,
  Compass,
  Layers,
  GraduationCap,
  Plus,
  Send,
  Zap,
} from 'lucide-react';

const COMMON_CAREER_INTERESTS_BY_DOMAIN: Record<string, string[]> = {
  AYURVEDA: [
    'Panchakarma',
    'Herbal Medicine',
    'Clinical Research',
    'Dravyaguna',
    'Ayurvedic Pharmacy',
    'Rasashastra',
    'Ayurvedic Clinical Practice',
    'Swasthavritta',
    'Yoga Therapy',
    'Preventive Wellness',
    'Digital Health',
    'Medicinal Plants',
    'Quality Control',
  ],
  ENGINEERING: [
    'Full Stack Development',
    'Frontend Development',
    'Backend Development',
    'Embedded Systems',
    'IoT Hardware',
    'Cloud Computing',
    'DevOps',
    'Mobile App Development',
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'VLSI Design',
  ],
  COMMERCE: [
    'Financial Analysis',
    'Corporate Accounting',
    'Auditing & Taxation',
    'Business Analytics',
    'Digital Marketing',
    'Banking & Financial Services',
    'Investment Advisory',
    'Business Management',
  ],
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Career Interests Edit Modal
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [primaryInterest, setPrimaryInterest] = useState<string>('');
  const [secondaryInterests, setSecondaryInterests] = useState<string[]>([]);
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [savingInterests, setSavingInterests] = useState(false);

  // Opportunity Match Details Deep Dive Modal
  const [matchDetailsModalOpen, setMatchDetailsModalOpen] = useState(false);
  const [selectedMatchOpp, setSelectedMatchOpp] = useState<any | null>(null);
  const [matchDetailsData, setMatchDetailsData] = useState<any | null>(null);
  const [matchDetailsLoading, setMatchDetailsLoading] = useState(false);

  // Application applying state
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [applyErrorMsg, setApplyErrorMsg] = useState<string | null>(null);

  const fetchDashboard = () => {
    setLoading(true);
    api
      .get('/student/dashboard')
      .then((res) => {
        setData(res.data);
        const careerInts = res.data?.careerInterests || [];
        if (careerInts.length > 0) {
          setPrimaryInterest(res.data?.primaryCareerInterest || careerInts[0]);
          setSecondaryInterests(
            careerInts.filter((i: string) => i !== (res.data?.primaryCareerInterest || careerInts[0]))
          );
        } else {
          setPrimaryInterest('');
          setSecondaryInterests([]);
        }
      })
      .catch((err) => console.error('Failed to load student dashboard', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSaveInterests = async () => {
    setSavingInterests(true);
    try {
      const allInterests: string[] = [];
      if (primaryInterest.trim()) allInterests.push(primaryInterest.trim());
      secondaryInterests.forEach((sec) => {
        if (sec.trim() && !allInterests.includes(sec.trim())) {
          allInterests.push(sec.trim());
        }
      });

      const res = await api.put('/student/career-interests', {
        careerInterests: allInterests,
      });

      // Update in-place state with new recommendations without page reload
      if (res.data?.recommendations) {
        setData((prev: any) => ({
          ...prev,
          student: res.data.student || prev?.student,
          careerInterests: allInterests,
          primaryCareerInterest: primaryInterest,
          secondaryCareerInterests: secondaryInterests,
          recommendedSkills: res.data.recommendations.recommendedSkills,
          skillsToLearnNext: res.data.recommendations.skillsToLearnNext,
          skillGaps: res.data.recommendations.skillGaps.map((g: any) => g.skillName),
          skillAnalysis: {
            ...prev?.skillAnalysis,
            skillGaps: res.data.recommendations.skillGaps.map((g: any) => g.skillName),
            skillGapItems: res.data.recommendations.skillGaps,
            skillsToLearnNext: res.data.recommendations.skillsToLearnNext,
            recommendedSkills: res.data.recommendations.recommendedSkills,
          },
          recommendedCourses: res.data.recommendations.recommendedCourses,
          recommendedInternships: res.data.recommendations.recommendedInternships,
          recommendedJobs: res.data.recommendations.recommendedJobs,
          recommendedMentors: res.data.recommendations.recommendedMentors,
          recommendedCollaborations: res.data.recommendations.recommendedCollaborations,
          recommendedOpportunities: [
            ...res.data.recommendations.recommendedInternships.map((i: any) => ({
              ...i.opportunity,
              matchResult: i.matchResult,
              isEligible: i.isEligible,
              ineligibleReasons: i.ineligibleReasons,
              goodMatchReasons: i.goodMatchReasons,
              matchedSkills: i.matchedSkills,
              unmatchedSkills: i.unmatchedSkills,
              hasApplied: i.hasApplied,
              applicationStatus: i.applicationStatus,
              recommendationReason: i.recommendationReason,
            })),
            ...res.data.recommendations.recommendedJobs.map((j: any) => ({
              ...j.opportunity,
              matchResult: j.matchResult,
              isEligible: j.isEligible,
              ineligibleReasons: j.ineligibleReasons,
              goodMatchReasons: j.goodMatchReasons,
              matchedSkills: j.matchedSkills,
              unmatchedSkills: j.unmatchedSkills,
              hasApplied: j.hasApplied,
              applicationStatus: j.applicationStatus,
              recommendationReason: j.recommendationReason,
            })),
          ].slice(0, 8),
        }));
      } else {
        fetchDashboard();
      }

      setIsInterestModalOpen(false);
      setApplySuccessMsg('Career interests updated! All personalized recommendations recalculated in real-time.');
    } catch (err) {
      console.error('Failed to update interests', err);
    } finally {
      setSavingInterests(false);
    }
  };

  const handleSelectSuggestedInterest = (interest: string) => {
    if (!primaryInterest) {
      setPrimaryInterest(interest);
    } else if (primaryInterest === interest) {
      // already primary
    } else if (secondaryInterests.includes(interest)) {
      setSecondaryInterests(secondaryInterests.filter((i) => i !== interest));
    } else {
      setSecondaryInterests([...secondaryInterests, interest]);
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInterestInput.trim();
    if (!trimmed) return;
    if (!primaryInterest) {
      setPrimaryInterest(trimmed);
    } else if (!secondaryInterests.includes(trimmed) && primaryInterest !== trimmed) {
      setSecondaryInterests([...secondaryInterests, trimmed]);
    }
    setCustomInterestInput('');
  };

  const handleOpenMatchDetails = async (opp: any) => {
    setSelectedMatchOpp(opp);
    setMatchDetailsModalOpen(true);
    setMatchDetailsLoading(true);
    try {
      const res = await api.get(`/student/opportunities/${opp.id}/match-details`);
      setMatchDetailsData(res.data);
    } catch (err) {
      console.error('Failed to fetch match details:', err);
      // fallback to opportunity embedded match result
      setMatchDetailsData({
        opportunityId: opp.id,
        title: opp.title,
        companyName: opp.industry?.companyName || 'Corporate Partner',
        type: opp.type,
        compatibilityPercentage: opp.matchResult?.matchScore || 0,
        isEligible: opp.isEligible,
        eligibility: opp.matchResult?.eligibility,
        ineligibleReasons: opp.ineligibleReasons || [],
        goodMatchReasons: opp.goodMatchReasons || [],
        matchedSkills: opp.matchedSkills || [],
        unmatchedSkills: opp.unmatchedSkills || [],
        breakdown: opp.matchResult?.breakdown,
        explanation: opp.matchResult?.explanation,
      });
    } finally {
      setMatchDetailsLoading(false);
    }
  };

  const handleApply = async (oppId: string) => {
    setApplyingId(oppId);
    setApplySuccessMsg(null);
    setApplyErrorMsg(null);
    try {
      await api.post(`/opportunities/${oppId}/apply`, {});
      setApplySuccessMsg('Application submitted successfully!');
      fetchDashboard();
    } catch (err: any) {
      setApplyErrorMsg(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const student = data?.student || {};
  const currentSkills = data?.skills || [];
  const careerInterests = data?.careerInterests || [];
  const domain = data?.domain || 'GENERAL';
  const domainDisplayName = data?.domainDisplayName || 'Multi-Domain';
  const certifications = data?.certifications || [];
  const skillsToLearnNext = data?.skillsToLearnNext || data?.recommendedSkills || [];
  const skillGaps = data?.skillAnalysis?.skillGaps || [];
  const recommendedCourses = data?.recommendedCourses || [];
  const recommendedInternships = data?.recommendedInternships || [];
  const recommendedJobs = data?.recommendedJobs || [];
  const recommendedMentors = data?.recommendedMentors || [];
  const recommendedCollaborations = data?.recommendedCollaborations || [];

  const suggestedInterests = COMMON_CAREER_INTERESTS_BY_DOMAIN[domain] || COMMON_CAREER_INTERESTS_BY_DOMAIN.AYURVEDA;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast Notifications */}
      {applySuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{applySuccessMsg}</span>
          </div>
          <button
            onClick={() => setApplySuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}
      {applyErrorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{applyErrorMsg}</span>
          </div>
          <button
            onClick={() => setApplyErrorMsg(null)}
            className="text-red-700 hover:text-red-900 font-bold text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. WELCOME & CAREER PATHWAY HERO */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg shadow-brand-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur border border-white/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Personal Career Assistant &bull; {domainDisplayName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome, {student.fullName || user?.profile?.fullName || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
              {student.degree} &bull; {student.department} &bull; {student.institutionName}
            </p>
          </div>

          {/* Profile Completion */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 sm:w-60 shrink-0">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span>Profile Readiness</span>
              <span>{data?.profileCompletion || 0}%</span>
            </div>
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${data?.profileCompletion || 0}%` }}
              />
            </div>
            <Link
              to="/student/profile"
              className="text-[11px] text-emerald-200 hover:text-white font-medium block mt-2"
            >
              Manage Academic Profile &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MY CAREER INTERESTS & 2. MY CURRENT SKILLS ROW                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. MY CAREER INTERESTS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">My Career Interests</h2>
                  <p className="text-xs text-slate-500">Primary driver of all personalized recommendations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInterestModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors border border-purple-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Interests
              </button>
            </div>

            {careerInterests.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-600 font-medium">No career interests selected yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Choose your career goals to trigger customized skill matching and opportunity recommendations.
                </p>
                <button
                  type="button"
                  onClick={() => setIsInterestModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 mt-3 hover:underline"
                >
                  + Set Career Interests Now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Primary Interest Highlight */}
                {data?.primaryCareerInterest && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600 fill-purple-600" />
                      <span className="text-xs font-black text-purple-950">
                        {data.primaryCareerInterest}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                      PRIMARY PATHWAY
                    </span>
                  </div>
                )}

                {/* Secondary Interests */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {careerInterests
                    .filter((ci: string) => ci !== data?.primaryCareerInterest)
                    .map((interest: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        {interest}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dynamic Recalculation: <strong>ACTIVE</strong></span>
            <span className="text-purple-600 font-semibold">Updates all 8 sections</span>
          </div>
        </div>

        {/* 2. MY CURRENT SKILLS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">My Current Skills</h2>
                  <p className="text-xs text-slate-500">Your verified & self-declared technical proficiencies</p>
                </div>
              </div>
              <Link
                to="/student/skills"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors border border-emerald-200"
              >
                Manage Skills
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {currentSkills.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-600 font-medium">No skills in your profile yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Add your skills to compute match compatibility against active recruiter postings.
                </p>
                <Link
                  to="/student/skills"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-3 hover:underline"
                >
                  + Add Your Skills Now
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentSkills.slice(0, 6).map((s: any) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-900 truncate">{s.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        s.proficiencyLevel === 'ADVANCED' || s.proficiencyLevel === 'EXPERT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : s.proficiencyLevel === 'INTERMEDIATE'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s.proficiencyLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentSkills.length > 6 && (
            <div className="pt-2 border-t border-slate-100 text-right">
              <Link to="/student/skills" className="text-xs text-emerald-700 font-semibold hover:underline">
                +{currentSkills.length - 6} more skills in profile &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SKILLS TO LEARN NEXT & 4. MY SKILL GAPS                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. SKILLS TO LEARN NEXT (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                Skills To Learn Next
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Missing competencies prioritized by your career pathway and active recruiter demand.
              </p>
            </div>
            <Link
              to="/student/courses"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline shrink-0"
            >
              Explore Learning &rarr;
            </Link>
          </div>

          {skillsToLearnNext.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-emerald-900">Comprehensive Skill Coverage</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                You currently cover the primary skills required for your active career pathway.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {skillsToLearnNext.slice(0, 4).map((sk: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-brand-200 transition-all flex flex-col justify-between space-y-2.5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-black text-slate-900">{sk.skillName}</h4>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          sk.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : sk.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {sk.priority} Priority
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">{sk.reason}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Current: <strong>{sk.currentLevel}</strong></span>
                    <span>Target: <strong className="text-brand-600">{sk.targetLevel}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. MY SKILL GAPS (1 Column) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">My Skill Gaps</h2>
                <p className="text-[11px] text-slate-500">Domain & career specific deficits only</p>
              </div>
            </div>

            <div className="pt-3">
              {skillGaps.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 italic">No domain skill gaps identified.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skillGaps.map((gapName: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {gapName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-900">
            <strong>Targeted Gaps:</strong> Gaps are restricted exclusively to {domainDisplayName}.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RECOMMENDED COURSES                                                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Recommended Courses For You
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated courses bridging your active skill gaps and accelerating your career interest in {data?.primaryCareerInterest || domainDisplayName}.
            </p>
          </div>
          <Link
            to="/student/courses"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Courses &rarr;
          </Link>
        </div>

        {recommendedCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses match your active skill gaps"
            description="Explore the public catalog or adjust your career pathway to discover tailored learning programs."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCourses.slice(0, 6).map((rec: any) => (
              <div
                key={rec.course.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold rounded-full">
                      {rec.course.providerType}
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {rec.matchPercentage}% Match
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">
                    {rec.course.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">{rec.course.providerName}</p>

                  <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-100 text-sky-950 text-[11px] mb-3 leading-relaxed">
                    <strong>Why it is recommended:</strong> {rec.reason}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {rec.course.skills?.map((cs: any) => (
                      <span
                        key={cs.id}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold"
                      >
                        {cs.skill?.name || cs.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {rec.course.duration} &bull; {rec.course.mode}
                  </span>
                  <Link
                    to={`/student/courses/${rec.course.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. RECOMMENDED INTERNSHIPS                                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              Recommended Internships
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Industrial internships mapped to your competencies with transparent compatibility & eligibility breakdowns.
            </p>
          </div>
          <Link
            to="/student/internships"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Internships &rarr;
          </Link>
        </div>

        {recommendedInternships.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No internships matching current criteria"
            description="Industry postings matching your career interest will appear here as soon as they are published."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedInternships.slice(0, 4).map((item: any) => {
              const opp = item.opportunity;
              const match = item.matchResult;
              const isEligible = item.isEligible;
              const hasApplied = item.hasApplied;

              return (
                <div
                  key={opp.id}
                  className={`rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                    isEligible
                      ? 'border-slate-200 bg-white hover:border-brand-300'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-black rounded-md uppercase">
                          {opp.type}
                        </span>
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ELIGIBLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            NOT ELIGIBLE
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-brand-50 text-brand-800 border border-brand-200">
                        {match?.matchPercentage || match?.matchScore || 0}% Match
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                    <p className="text-xs font-semibold text-slate-600 mb-2">{opp.industry?.companyName}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {opp.location || 'Remote'}
                      </span>
                      <span>&bull;</span>
                      <span>{opp.workMode}</span>
                      {opp.stipendOrSalary && (
                        <>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-700">{opp.stipendOrSalary}</span>
                        </>
                      )}
                    </div>

                    {/* Matched vs Unmatched Skills */}
                    <div className="space-y-1.5 text-xs mb-3">
                      {item.matchedSkills?.length > 0 && (
                        <div className="flex items-start gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                          <span>
                            <strong>Matched:</strong>{' '}
                            {item.matchedSkills.map((s: any) => s.name).join(', ')}
                          </span>
                        </div>
                      )}
                      {item.unmatchedSkills?.length > 0 && (
                        <div className="flex items-start gap-1.5 text-rose-800">
                          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                          <span>
                            <strong>Unmatched:</strong>{' '}
                            {item.unmatchedSkills.map((s: any) => s.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ineligible Reasons callout if not eligible */}
                    {!isEligible && item.ineligibleReasons?.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] space-y-0.5">
                        <span className="font-bold block">Ineligibility Reason:</span>
                        <p>{item.ineligibleReasons[0]}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMatchDetails(item)}
                      className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1 hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      View Match Details
                    </button>

                    {hasApplied ? (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                        Applied ({item.applicationStatus})
                      </span>
                    ) : isEligible ? (
                      <button
                        type="button"
                        onClick={() => handleApply(opp.id)}
                        disabled={applyingId === opp.id}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {applyingId === opp.id ? 'Submitting...' : 'Apply Now'}
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed">
                        Not Eligible
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. RECOMMENDED JOBS                                                       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              Recommended Full-Time Jobs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Graduate and entry-level career openings matching your career interest in {data?.primaryCareerInterest || domainDisplayName}.
            </p>
          </div>
          <Link
            to="/student/jobs"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Jobs &rarr;
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs match your active profile"
            description="Verified job openings will populate here as corporate recruiters publish positions in your field."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.slice(0, 4).map((item: any) => {
              const opp = item.opportunity;
              const match = item.matchResult;
              const isEligible = item.isEligible;
              const hasApplied = item.hasApplied;

              return (
                <div
                  key={opp.id}
                  className={`rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                    isEligible
                      ? 'border-slate-200 bg-white hover:border-brand-300'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-black rounded-md uppercase">
                          {opp.type}
                        </span>
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ELIGIBLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            NOT ELIGIBLE
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-brand-50 text-brand-800 border border-brand-200">
                        {match?.matchPercentage || match?.matchScore || 0}% Match
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                    <p className="text-xs font-semibold text-slate-600 mb-2">{opp.industry?.companyName}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {opp.location || 'Remote'}
                      </span>
                      <span>&bull;</span>
                      <span>{opp.workMode}</span>
                      {opp.stipendOrSalary && (
                        <>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-700">{opp.stipendOrSalary}</span>
                        </>
                      )}
                    </div>

                    {/* Matched vs Unmatched Skills */}
                    <div className="space-y-1.5 text-xs mb-3">
                      {item.matchedSkills?.length > 0 && (
                        <div className="flex items-start gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                          <span>
                            <strong>Matched:</strong>{' '}
                            {item.matchedSkills.map((s: any) => s.name).join(', ')}
                          </span>
                        </div>
                      )}
                      {item.unmatchedSkills?.length > 0 && (
                        <div className="flex items-start gap-1.5 text-rose-800">
                          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                          <span>
                            <strong>Unmatched:</strong>{' '}
                            {item.unmatchedSkills.map((s: any) => s.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isEligible && item.ineligibleReasons?.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] space-y-0.5">
                        <span className="font-bold block">Ineligibility Reason:</span>
                        <p>{item.ineligibleReasons[0]}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMatchDetails(item)}
                      className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1 hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      View Match Details
                    </button>

                    {hasApplied ? (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                        Applied ({item.applicationStatus})
                      </span>
                    ) : isEligible ? (
                      <button
                        type="button"
                        onClick={() => handleApply(opp.id)}
                        disabled={applyingId === opp.id}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {applyingId === opp.id ? 'Submitting...' : 'Apply Now'}
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed">
                        Not Eligible
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7.5 INDUSTRY VACANCY ASSESSMENTS & APPLICATION PIPELINE                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Industry Vacancy Assessments & Applications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified technical assessment evaluations, application status, and score reports for recruiter postings.
            </p>
          </div>
          <Link
            to="/student/skill-mapping"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            Skill Mapping Profile &rarr;
          </Link>
        </div>

        {(!data?.applications || data.applications.length === 0) ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-700">No industry applications or vacancy assessments taken yet.</p>
            <p className="text-[11px] text-slate-500">
              Browse recommended jobs and internships to complete vacancy-specific skill assessments and submit applications directly to recruiters.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/student/jobs"
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-sm hover:bg-purple-700"
              >
                Browse Jobs
              </Link>
              <Link
                to="/student/internships"
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                Browse Internships
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.applications.slice(0, 4).map((app: any) => {
              const opp = app.opportunity;
              const hasAssessment = app.assessmentScore != null;
              const isPassed = app.assessmentPassed;

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">
                          {opp?.type || 'OPPORTUNITY'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{opp?.title}</h4>
                        <p className="text-xs text-slate-600 font-medium">{opp?.industry?.companyName}</p>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase shrink-0 border ${
                          app.status === 'SELECTED'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : app.status === 'ASSESSMENT_FAILED'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : app.status === 'INTERVIEW' || app.status === 'SHORTLISTED'
                            ? 'bg-sky-100 text-sky-900 border-sky-300'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    {/* Assessment Performance pill */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">Vacancy Assessment:</span>
                      {hasAssessment ? (
                        <span
                          className={`font-bold inline-flex items-center gap-1 ${
                            isPassed ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          {app.assessmentScore}% {isPassed ? '(Passed)' : '(Failed)'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Assessment Required</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                    <Link
                      to={opp?.type === 'JOB' ? '/student/jobs' : '/student/internships'}
                      className="text-purple-600 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      View Posting <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8. RECOMMENDED MENTORS & 9. RECOMMENDED COLLABORATIONS                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 8. RECOMMENDED MENTORS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Recommended Mentors
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Faculty & industry mentors specializing in {data?.primaryCareerInterest || domainDisplayName}.
              </p>
            </div>
          </div>

          {recommendedMentors.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-500 italic">No mentors matching this career pathway yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedMentors.slice(0, 3).map((mentor: any) => (
                <div
                  key={mentor.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-200 transition-all flex flex-col justify-between space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{mentor.name}</h4>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">{mentor.designation}</p>
                      <p className="text-[10px] text-slate-400">{mentor.organization}</p>
                    </div>

                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 shrink-0">
                      {mentor.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-slate-100">
                    {mentor.reason}
                  </p>

                  {mentor.canHelpLearn?.length > 0 && (
                    <div className="text-[10px] text-purple-900 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold">Can help you learn:</span>
                      {mentor.canHelpLearn.map((sk: string, sIdx: number) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 9. RECOMMENDED COLLABORATIONS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Recommended Collaborations & Projects
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Research initiatives, workshops, and live industrial projects in your field.
              </p>
            </div>
            <Link
              to="/student/collaboration"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View Hub &rarr;
            </Link>
          </div>

          {recommendedCollaborations.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-500 italic">No collaboration projects found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedCollaborations.slice(0, 3).map((collab: any) => (
                <div
                  key={collab.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all flex flex-col justify-between space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-bold">
                        {collab.type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1.5">{collab.title}</h4>
                    </div>

                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-200 shrink-0">
                      {collab.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">{collab.reason}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">{collab.mode}</span>
                    <Link
                      to="/student/collaboration"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Participate &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT CAREER INTERESTS                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        title="Personalize Career Pathway"
        maxWidth="lg"
      >
        <div className="space-y-5 pt-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            Your career interests actively drive your recommended learning skills, skill gaps, course curricula, internships, and recruiter matches.
          </p>

          {/* Primary Career Interest Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              Primary Career Goal / Target Role
            </label>
            <input
              type="text"
              placeholder="e.g. Panchakarma Consultant, Full Stack Development, Financial Analysis"
              value={primaryInterest}
              onChange={(e) => setPrimaryInterest(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white font-semibold text-slate-900"
            />
            <p className="text-[11px] text-slate-400">
              This goal receives highest weighting in algorithm calculations.
            </p>
          </div>

          {/* Secondary Interests */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Secondary Interests & Specializations
            </label>

            {/* Current Secondary Tags */}
            <div className="flex flex-wrap gap-1.5">
              {secondaryInterests.map((sec, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  {sec}
                  <button
                    type="button"
                    onClick={() => setSecondaryInterests(secondaryInterests.filter((i) => i !== sec))}
                    className="hover:text-red-600 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleAddCustomInterest} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom career interest..."
                value={customInterestInput}
                onChange={(e) => setCustomInterestInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>

          {/* Suggested Domain Interests */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Suggested for {domainDisplayName}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedInterests.map((item) => {
                const isPrimary = primaryInterest.toLowerCase() === item.toLowerCase();
                const isSecondary = secondaryInterests.some((s) => s.toLowerCase() === item.toLowerCase());

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectSuggestedInterest(item)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                      isPrimary
                        ? 'bg-purple-600 text-white shadow-sm'
                        : isSecondary
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isPrimary ? `★ ${item}` : item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInterestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveInterests}
              disabled={savingInterests || !primaryInterest.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {savingInterests ? 'Recalculating...' : 'Save & Recalculate'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW MATCH DETAILS DEEP DIVE                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={matchDetailsModalOpen}
        onClose={() => setMatchDetailsModalOpen(false)}
        title={matchDetailsData ? `${matchDetailsData.title} • Compatibility Breakdown` : 'Match Details'}
        maxWidth="xl"
      >
        {matchDetailsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : matchDetailsData ? (
          <div className="space-y-6 pt-2">
            {/* Header compatibility card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-sky-300">
                  {matchDetailsData.type} &bull; {matchDetailsData.companyName}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{matchDetailsData.title}</h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">
                    {matchDetailsData.compatibilityPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-300 block">Compatibility Score</span>
                </div>
                {matchDetailsData.isEligible ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    ELIGIBLE
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white">
                    NOT ELIGIBLE
                  </span>
                )}
              </div>
            </div>

            {/* Eligibility Pass / Fail Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Eligibility Evaluation
              </h4>

              {matchDetailsData.isEligible ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    You meet all hard requirements (Academic Degree, Department, Minimum CGPA, and Prerequisites) for this opportunity.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Prerequisite / Eligibility Criteria Not Met:</span>
                  </div>
                  {matchDetailsData.ineligibleReasons?.map((reason: string, idx: number) => (
                    <p key={idx} className="pl-5 text-rose-700 list-disc">
                      &bull; {reason}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Matched Skills Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Matched Skills ({matchDetailsData.matchedSkills?.length || 0})
              </h4>

              {matchDetailsData.matchedSkills?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No matching skills found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchDetailsData.matchedSkills.map((sk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-emerald-950 block">{sk.name}</span>
                        <span className="text-[10px] text-emerald-700">
                          Your Level: <strong>{sk.studentLevel}</strong> (Req: {sk.requiredLevel})
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          sk.matchType === 'FULL'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {sk.matchType === 'FULL' ? 'FULL MATCH' : 'PARTIAL'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unmatched / Missing Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Unmatched / Missing Skills ({matchDetailsData.unmatchedSkills?.length || 0})
              </h4>

              {matchDetailsData.unmatchedSkills?.length === 0 ? (
                <p className="text-xs text-emerald-700 font-medium">
                  ✓ Perfect 100% skill coverage for this position!
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchDetailsData.unmatchedSkills.map((sk: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-rose-950 block">{sk.name}</span>
                          <span className="text-[10px] text-rose-700">
                            Required: {sk.requiredLevel} {sk.isRequired && '(Mandatory)'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                          MISSING
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Note: Missing required skills have been prioritized in your <strong>Skills to Learn Next</strong> section.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
