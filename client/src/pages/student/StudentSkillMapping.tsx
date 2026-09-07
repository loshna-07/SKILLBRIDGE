import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  TrendingUp,
  Target,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building,
  Briefcase,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Layers,
  Zap,
  CheckSquare,
  Users,
  Compass,
  Edit3,
} from 'lucide-react';

export const StudentSkillMapping: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndustryFilter, setActiveIndustryFilter] = useState<string>('ALL');

  // Edit Career Interest Modal
  const [isEditInterestOpen, setIsEditInterestOpen] = useState(false);
  const [careerInterestInput, setCareerInterestInput] = useState('');
  const [savingInterest, setSavingInterest] = useState(false);

  const fetchSkillMapping = () => {
    setLoading(true);
    api
      .get('/student/skill-mapping')
      .then((res) => {
        setData(res.data);
        setCareerInterestInput(res.data?.primaryCareerInterest || '');
      })
      .catch((err) => console.error('Failed to load skill mapping', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSkillMapping();
  }, []);

  const handleUpdateCareerInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerInterestInput.trim()) return;

    setSavingInterest(true);
    try {
      await api.put('/student/interests', {
        careerInterests: careerInterestInput.trim(),
      });
      setIsEditInterestOpen(false);
      fetchSkillMapping();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update career interest.');
    } finally {
      setSavingInterest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Skill Mapping Unavailable"
        description="Could not load your personalized skill mapping. Please make sure your student profile is active."
      />
    );
  }

  const {
    student,
    domainDisplayName,
    primaryCareerInterest,
    careerInterests,
    skillProfile,
    recommendedSkills,
    recommendedCourses,
    recommendedIndustries,
    recommendedJobRoles,
    pipelineStages,
  } = data;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 mb-2">
            <Compass className="w-3.5 h-3.5" />
            End-to-End Skill Intelligence & Pathways
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Skill Mapping & Career Pathways</h1>
          <p className="text-sm text-slate-600 mt-1">
            Visual pipeline bridging your declared skills and assessment benchmarks to target industries and high-demand job roles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsEditInterestOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Target: {primaryCareerInterest}</span>
          </button>
          <button
            onClick={() => navigate('/student/assessment')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Take Assessment</span>
          </button>
        </div>
      </div>

      {/* 7-Stage Visual Career Pipeline Roadmap */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          End-to-End Career Advancement Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {pipelineStages.map((stage: any, index: number) => {
            const isCompleted = stage.status === 'COMPLETED';
            const isInProgress = stage.status === 'IN_PROGRESS';
            return (
              <div
                key={stage.stage}
                className={`p-3 rounded-xl border flex flex-col justify-between relative transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : isInProgress
                    ? 'bg-brand-50/70 border-brand-200 text-brand-950 ring-1 ring-brand-500/20'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Step {index + 1}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isInProgress ? (
                      <Zap className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold mb-1 leading-snug">{stage.title}</h4>
                  <p className="text-[11px] leading-tight text-slate-600 line-clamp-2">
                    {stage.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Intelligence Matrix & Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Readiness Gauge */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-600" />
                Overall Readiness
              </h3>
              <Badge variant={skillProfile.overallSkillScore >= 70 ? 'success' : 'info'} size="sm">
                {domainDisplayName}
              </Badge>
            </div>

            <div className="my-4 text-center">
              <div className="inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-brand-100 bg-brand-50/50 relative">
                <span className="text-3xl font-extrabold text-brand-700">
                  {skillProfile.overallSkillScore}%
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Readiness Score
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-500 text-[10px] block">Total Skills</span>
                <span className="font-bold text-slate-900 text-sm">{skillProfile.totalSkills}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-500 text-[10px] block">Assessed</span>
                <span className="font-bold text-emerald-600 text-sm">{skillProfile.assessedSkillsCount}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-500 text-[10px] block">Verified</span>
                <span className="font-bold text-brand-600 text-sm">{skillProfile.verifiedSkillsCount}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-500 text-[10px] block">Gaps to Close</span>
                <span className="font-bold text-rose-600 text-sm">{skillProfile.skillGaps.length}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/student/skills')}
            className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-center"
          >
            Manage Skills & Proficiencies &rarr;
          </button>
        </div>

        {/* Competencies Categorization (Strong vs Gaps) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Competency Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              Target: <strong className="text-brand-600">{primaryCareerInterest}</strong>
            </span>
          </div>

          {/* Strong Skills */}
          <div>
            <span className="text-xs font-bold text-emerald-700 block mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Strong Skills ({skillProfile.strongSkills.length}) - Score ≥ 75% or Advanced/Expert
            </span>
            {skillProfile.strongSkills.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No advanced skills recorded yet. Complete assessments or update proficiency levels.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {skillProfile.strongSkills.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{s.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {s.source === 'ASSESSMENT' ? 'Assessed' : 'Self-Declared'} &bull; {s.proficiencyLevel}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                      {s.scorePercentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Developing Skills */}
          <div>
            <span className="text-xs font-bold text-blue-700 block mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Developing Skills ({skillProfile.developingSkills.length}) - Intermediate Proficiency
            </span>
            {skillProfile.developingSkills.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">No intermediate skills recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {skillProfile.developingSkills.map((s: any) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    {s.name} ({s.scorePercentage}%)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Critical Skill Gaps */}
          <div>
            <span className="text-xs font-bold text-rose-700 block mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              Critical Skill Gaps ({skillProfile.skillGaps.length}) - Required for {primaryCareerInterest}
            </span>
            {skillProfile.skillGaps.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">
                Zero skill gaps detected! Your profile fully aligns with current market demand.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {skillProfile.skillGaps.slice(0, 4).map((gap: any, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{gap.skillName}</span>
                      <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-1.5 py-0.5 rounded">
                        {gap.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{gap.recommendation}</p>
                    {gap.suggestedCourses && gap.suggestedCourses.length > 0 && (
                      <Link
                        to={`/student/courses/${gap.suggestedCourses[0].id}`}
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Take: {gap.suggestedCourses[0].title}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Target Job Roles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              Recommended Target Job Roles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific to your career focus in {primaryCareerInterest} and verified competencies.
            </p>
          </div>
        </div>

        {recommendedJobRoles && recommendedJobRoles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobRoles.map((role: any, idx: number) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all bg-slate-50/40 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{role.roleTitle}</h4>
                      <span className="text-xs text-slate-500 font-medium">{role.averageSalary}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 inline-block">
                        {role.compatibilityPercentage}% Match
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 uppercase font-semibold">
                        Demand: {role.marketDemand}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{role.whyRecommended}</p>

                  {/* Matched Skills */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                        Matched Skills ({role.matchedSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {role.matchedSkills.map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-medium"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {role.unmatchedSkills.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-amber-700 block mb-1">
                          Skills to Develop ({role.unmatchedSkills.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {role.unmatchedSkills.map((sk: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-medium"
                            >
                              + {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    <strong className="text-slate-900">{role.livePostingsCount}</strong> active opening(s)
                  </span>
                  <button
                    onClick={() => navigate('/student/jobs')}
                    className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>View Matching Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No job role blueprints available"
            description="Update your career interests to generate target job role pathways."
          />
        )}
      </div>

      {/* Recommended Industries */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-600" />
              Recommended Industries & Innovation Hubs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprises and organizations actively seeking students in {domainDisplayName}.
            </p>
          </div>
        </div>

        {recommendedIndustries && recommendedIndustries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedIndustries.map((ind: any) => (
              <div
                key={ind.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all bg-white flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{ind.companyName}</h4>
                      <span className="text-xs text-brand-700 font-semibold">{ind.industrySector}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ind.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                    {ind.whyRecommended}
                  </p>

                  {ind.location && (
                    <span className="text-[11px] text-slate-500 block mb-2">
                      📍 {ind.location}
                    </span>
                  )}

                  {/* Required Skills list */}
                  {ind.relevantSkills && ind.relevantSkills.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Key Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ind.relevantSkills.slice(0, 3).map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {ind.activeOpportunitiesCount} active opening(s)
                  </span>
                  <button
                    onClick={() => navigate('/student/internships')}
                    className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>Explore Openings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building}
            title="No industry recommendations available"
            description="Industry recommendations will appear as partner companies post opportunities in your domain."
          />
        )}
      </div>

      {/* Recommended Courses to Close Skill Gaps */}
      {recommendedCourses && recommendedCourses.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                Courses to Close Your Skill Gaps
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified curriculum directly developing skills required for {primaryCareerInterest}.
              </p>
            </div>
            <button
              onClick={() => navigate('/student/courses')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCourses.slice(0, 3).map((item: any) => (
              <div
                key={item.course.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-brand-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <Badge variant="info" size="sm">
                      {item.course.skillLevel || 'All Levels'}
                    </Badge>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.matchPercentage}% Gap Match
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.course.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.reason}</p>
                </div>

                <Link
                  to={`/student/courses/${item.course.id}`}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>Enroll in Course</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Career Interest Modal */}
      <Modal
        isOpen={isEditInterestOpen}
        onClose={() => setIsEditInterestOpen(false)}
        title="Update Career Focus & Path"
      >
        <form onSubmit={handleUpdateCareerInterest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Career Interest <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Clinical Ayurveda, Full Stack Development, Financial Analysis, Panchakarma"
              value={careerInterestInput}
              onChange={(e) => setCareerInterestInput(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Updating your career interest dynamically recalibrates your skill gap calculations, recommended industries, and target job roles.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditInterestOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingInterest}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {savingInterest ? 'Recalculating...' : 'Update & Recalculate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
