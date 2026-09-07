import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { Opportunity } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Search,
  CheckCircle2,
  Send,
  XCircle,
  Sparkles,
  Target,
  Edit3,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  CheckSquare,
  HelpCircle,
  BookOpen,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export const StudentJobs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'explore'>('recommended');
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [eligibleOnlyFilter, setEligibleOnlyFilter] = useState(false);

  // Student Profile & Career Context
  const [studentContext, setStudentContext] = useState<{
    primaryCareerInterest: string;
    careerInterests: string[];
    domainDisplayName: string;
  } | null>(null);

  // Match Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [matchDetails, setMatchDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Career Interest Edit Modal
  const [careerModalOpen, setCareerModalOpen] = useState(false);
  const [newCareerInterests, setNewCareerInterests] = useState('');
  const [updatingInterests, setUpdatingInterests] = useState(false);

  // Standard Application Modal (when assessment is not required)
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  // ASSESSMENT RUNNER STATE
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [assessmentTimeLeft, setAssessmentTimeLeft] = useState<number>(1800); // seconds
  const [timerActive, setTimerActive] = useState(false);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [isReviewStep, setIsReviewStep] = useState(false);
  const timerRef = useRef<any>(null);

  // ASSESSMENT RESULT STATE
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, recJobsRes, allJobsRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/recommended-jobs'),
        api.get('/opportunities?type=JOB'),
      ]);

      setStudentContext({
        primaryCareerInterest: dashRes.data.primaryCareerInterest || 'General',
        careerInterests: dashRes.data.careerInterests || [],
        domainDisplayName: dashRes.data.domainDisplayName || 'Academic Domain',
      });
      setNewCareerInterests((dashRes.data.careerInterests || []).join(', '));
      setRecommendedJobs(recJobsRes.data || []);
      setAllJobs(allJobsRes.data || []);
    } catch (err) {
      console.error('Failed to load student jobs data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer Countdown Handler
  useEffect(() => {
    if (timerActive && assessmentTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setAssessmentTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, assessmentTimeLeft]);

  const handleOpenMatchDetails = async (oppId: string) => {
    setLoadingDetails(true);
    setDetailsModalOpen(true);
    try {
      const res = await api.get('/student/opportunities/' + oppId + '/match-details');
      setMatchDetails(res.data);
    } catch (err) {
      console.error('Failed to load match details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveCareerInterests = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingInterests(true);
    try {
      const parsed = newCareerInterests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await api.put('/student/career-interests', { careerInterests: parsed });
      setCareerModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update career interests.');
    } finally {
      setUpdatingInterests(false);
    }
  };

  const handleOpenApply = async (item: any) => {
    const opp = item.opportunity ? item.opportunity : item;
    setSelectedOpp(item);
    setCoverLetter('');
    setApplyMessage(null);

    // If assessment is required on this vacancy, fetch assessment and launch runner
    if (opp.assessmentRequired !== false) {
      try {
        const res = await api.get('/opportunities/' + opp.id + '/assessment');
        if (res.data && res.data.questions && res.data.questions.length > 0) {
          setActiveAssessment(res.data);
          setCurrentQuestionIndex(0);
          setSelectedAnswers({});
          setIsReviewStep(false);
          setAssessmentTimeLeft((res.data.duration || 30) * 60);
          setTimerActive(true);
          setAssessmentModalOpen(true);
          return;
        }
      } catch (err) {
        console.warn('No linked assessment found, fallback to standard application.', err);
      }
    }

    // Fallback: standard application
    setApplyModalOpen(true);
  };

  const handleStandardApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    setSubmitting(true);
    try {
      const oppId = selectedOpp.opportunity ? selectedOpp.opportunity.id : selectedOpp.id;
      await api.post('/opportunities/' + oppId + '/apply', { coverLetter });
      setApplyMessage('Application submitted successfully!');
      setTimeout(() => {
        setApplyModalOpen(false);
        fetchData();
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Assessment Selection & Submission
  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleAutoSubmitAssessment = () => {
    alert('Assessment time limit has expired! Submitting your answers automatically.');
    handleSubmitAssessment();
  };

  const handleSubmitAssessment = async () => {
    if (!selectedOpp || !activeAssessment) return;
    setTimerActive(false);
    setSubmittingAssessment(true);

    const oppId = selectedOpp.opportunity ? selectedOpp.opportunity.id : selectedOpp.id;
    const formattedAnswers = Object.entries(selectedAnswers).map(([qId, oId]) => ({
      questionId: qId,
      selectedOptionId: oId,
    }));

    try {
      const totalDurationSec = (activeAssessment.duration || 30) * 60;
      const timeSpent = Math.max(10, totalDurationSec - assessmentTimeLeft);

      const res = await api.post('/opportunities/' + oppId + '/assessment/submit', {
        answers: formattedAnswers,
        coverLetter: coverLetter || 'Application submitted via verified vacancy assessment.',
        timeSpentSeconds: timeSpent,
      });

      setAssessmentModalOpen(false);
      setAssessmentResult(res.data);
      setResultModalOpen(true);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit assessment.');
    } finally {
      setSubmittingAssessment(false);
    }
  };

  // Filter items
  const filterList = (list: any[], isRecommended: boolean) => {
    return list.filter((item) => {
      const opp = isRecommended ? item.opportunity : item;
      const titleMatch = (opp.title || '').toLowerCase().includes(search.toLowerCase());
      const companyMatch = (opp.industry?.companyName || '').toLowerCase().includes(search.toLowerCase());
      const descMatch = (opp.description || '').toLowerCase().includes(search.toLowerCase());
      const locMatch = (opp.location || '').toLowerCase().includes(search.toLowerCase());
      const matchesSearch = !search || titleMatch || companyMatch || descMatch || locMatch;

      const matchesMode = workModeFilter === 'ALL' || opp.workMode === workModeFilter;

      const isEligible = isRecommended
        ? item.isEligible
        : item.matchResult?.eligibility?.isEligible;
      const matchesEligible = !eligibleOnlyFilter || isEligible;

      return matchesSearch && matchesMode && matchesEligible;
    });
  };

  const displayedRecommended = filterList(recommendedJobs, true);
  const displayedAll = filterList(allJobs, false);

  const getMatchScoreBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          {score}% High Match
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
          <Target className="w-3.5 h-3.5 text-blue-600" />
          {score}% Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
        {score}% Match
      </span>
    );
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return (mins < 10 ? '0' : '') + mins + ':' + (rem < 10 ? '0' : '') + rem;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-700 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            SkillBridge Placement Portal
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Graduate & Placement Jobs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore full-time placement opportunities strictly personalized to your career pathway, degree, and skills.
          </p>
        </div>

        {/* Career Interest Status Pill */}
        {studentContext && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Target Career Focus</div>
              <div className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                {studentContext.primaryCareerInterest}
              </div>
            </div>
            <button
              onClick={() => setCareerModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors ml-1"
              title="Change Career Focus"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('recommended')}
            className={'pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ' +
              (activeTab === 'recommended'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800')}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Recommended For You ({recommendedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={'pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ' +
              (activeTab === 'explore'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800')}
          >
            <Layers className="w-3.5 h-3.5" />
            Explore All Platform Jobs ({allJobs.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search roles, companies, technologies, or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="ON_SITE">On-Site</option>
            <option value="HYBRID">Hybrid</option>
          </select>

          <label className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 cursor-pointer select-none hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={eligibleOnlyFilter}
              onChange={(e) => setEligibleOnlyFilter(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-brand-600 focus:ring-brand-500"
            />
            <span>Eligible Only</span>
          </label>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : activeTab === 'recommended' ? (
        displayedRecommended.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedRecommended.map((item) => {
              const opp = item.opportunity;
              const matchScore = item.matchResult?.matchScore || 0;
              const isEligible = item.isEligible;
              const hasApplied = item.hasApplied;
              const assessmentRequired = opp.assessmentRequired !== false;

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4 relative"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                          {assessmentRequired && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              Assessment Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {opp.industry?.companyName}
                        </p>
                      </div>
                      {getMatchScoreBadge(matchScore)}
                    </div>

                    {/* Recommendation Reason Banner */}
                    {item.recommendationReason && (
                      <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{item.recommendationReason}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {opp.description}
                    </p>

                    {/* Key Specs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{opp.location || 'Location Flexible'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{opp.stipendOrSalary || 'Competitive CTC'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>Openings: {opp.numberOfOpenings}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="purple" size="sm">
                          {opp.workMode}
                        </Badge>
                      </div>
                    </div>

                    {/* Matched vs Unmatched Skills Chips */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Skills Compatibility:</span>
                        <span>
                          {item.matchedSkills?.length || 0} matched &bull;{' '}
                          {item.unmatchedSkills?.length || 0} missing
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.matchedSkills?.slice(0, 4).map((s: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {s.name}
                          </span>
                        ))}
                        {item.unmatchedSkills?.slice(0, 3).map((u: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            + {u.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Eligibility Status Banner */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Eligible to Apply
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Ineligible</span>
                          {item.ineligibleReasons?.length > 0 && (
                            <span
                              className="text-[10px] font-normal text-rose-600 max-w-[130px] truncate ml-1"
                              title={item.ineligibleReasons.join(' • ')}
                            >
                              ({item.ineligibleReasons[0]})
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenMatchDetails(opp.id)}
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5"
                      >
                        Match Deep-Dive
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      {opp.applicationDeadline
                        ? 'Deadline: ' + new Date(opp.applicationDeadline).toLocaleDateString()
                        : 'Open Applications'}
                    </span>

                    {hasApplied ? (
                      <Badge variant={item.applicationStatus === 'ASSESSMENT_FAILED' ? 'danger' : 'success'} size="md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Applied ({item.applicationStatus})
                      </Badge>
                    ) : isEligible ? (
                      <button
                        type="button"
                        onClick={() => handleOpenApply(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                      >
                        {assessmentRequired ? <Award className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        {assessmentRequired ? 'Take Assessment & Apply' : 'Apply Now'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed border border-slate-200"
                      >
                        Ineligible to Apply
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No job postings matching your current career pathway"
            description={'We did not find active full-time jobs matching ' + (studentContext?.primaryCareerInterest || 'your career interest') + '. You can update your career pathway or explore the complete platform catalog.'}
            actionText="Update Career Pathway"
            onAction={() => setCareerModalOpen(true)}
          />
        )
      ) : (
        // EXPLORE ALL TAB
        displayedAll.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedAll.map((opp) => {
              const matchScore = opp.matchResult?.matchScore || 0;
              const isEligible = opp.matchResult?.eligibility?.isEligible;
              const hasApplied = opp.hasApplied;
              const assessmentRequired = opp.assessmentRequired !== false;

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                          {assessmentRequired && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              Assessment Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {opp.industry?.companyName}
                        </p>
                      </div>
                      {getMatchScoreBadge(matchScore)}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {opp.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{opp.location || 'Location Not Specified'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{opp.stipendOrSalary || 'Competitive CTC'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>Openings: {opp.numberOfOpenings}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="purple" size="sm">
                          {opp.workMode}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Ineligible
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenMatchDetails(opp.id)}
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5"
                      >
                        Match Deep-Dive
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      {opp.applicationDeadline
                        ? 'Deadline: ' + new Date(opp.applicationDeadline).toLocaleDateString()
                        : 'Open Applications'}
                    </span>

                    {hasApplied ? (
                      <Badge variant={opp.applicationStatus === 'ASSESSMENT_FAILED' ? 'danger' : 'success'} size="md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Applied ({opp.applicationStatus})
                      </Badge>
                    ) : isEligible ? (
                      <button
                        type="button"
                        onClick={() => handleOpenApply(opp)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                      >
                        {assessmentRequired ? <Award className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        {assessmentRequired ? 'Take Assessment & Apply' : 'Apply Now'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed border border-slate-200"
                      >
                        Ineligible
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Adjust your search filters or check back later for corporate vacancies."
          />
        )
      )}

      {/* Match Details Deep Dive Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="SkillBridge Match Compatibility Deep-Dive"
      >
        {loadingDetails ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : matchDetails ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{matchDetails.title}</h3>
                <p className="text-xs text-slate-600">{matchDetails.companyName}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-brand-700">
                  {matchDetails.compatibilityPercentage}%
                </div>
                <div className="text-[10px] font-bold text-brand-600 uppercase">
                  Compatibility Score
                </div>
              </div>
            </div>

            {matchDetails.explanation && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {matchDetails.explanation}
              </p>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
                Hard Eligibility Verification
              </h4>
              <div
                className={'p-3 rounded-xl border flex items-center justify-between ' +
                  (matchDetails.isEligible
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800')}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  {matchDetails.isEligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    {matchDetails.isEligible
                      ? 'You meet all mandatory eligibility prerequisites.'
                      : 'You do not currently satisfy mandatory requirements.'}
                  </span>
                </div>
              </div>
              {matchDetails.ineligibleReasons?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {matchDetails.ineligibleReasons.map((reason: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-[11px] text-rose-600 flex items-center gap-1.5 pl-2"
                    >
                      &bull; {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
                Skills Competency Analysis
              </h4>
              <div className="space-y-2">
                {matchDetails.matchedSkills?.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-slate-800">{s.name}</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium">
                      Your Level: <strong>{s.studentLevel}</strong> &bull; Required:{' '}
                      {s.requiredLevel} ({s.matchType === 'FULL' ? 'Full Match' : 'Partial Match'})
                    </div>
                  </div>
                ))}

                {matchDetails.unmatchedSkills?.map((u: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-600">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>{u.name}</span>
                      {u.isRequired && (
                        <span className="text-[10px] text-rose-600 font-bold">(Mandatory)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Required: {u.requiredLevel} &bull; <em>Skill Not Added</em>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Analysis
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Career Focus Switcher Modal */}
      <Modal
        isOpen={careerModalOpen}
        onClose={() => setCareerModalOpen(false)}
        title="Update Target Career Pathway"
      >
        <form onSubmit={handleSaveCareerInterests} className="space-y-4">
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-800">
            <p className="font-semibold">Dynamic Career-Based Personalization</p>
            <p className="text-[11px] text-brand-700 mt-0.5">
              Updating your career interests dynamically recalculates your skill gaps, course suggestions, recommended internships, and jobs instantly.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Career Interests (Comma-separated)
            </label>
            <input
              type="text"
              required
              value={newCareerInterests}
              onChange={(e) => setNewCareerInterests(e.target.value)}
              placeholder="e.g. Full Stack Development, React, Node.js, Cloud Computing..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCareerModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingInterests}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {updatingInterests ? 'Saving...' : 'Save & Refresh Recommendations'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Standard Apply Modal (Fallback) */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={'Apply to ' + (selectedOpp?.opportunity ? selectedOpp.opportunity.title : selectedOpp?.title || 'Job')}
      >
        {selectedOpp && (
          <form onSubmit={handleStandardApplySubmit} className="space-y-4">
            <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-800">
              <p className="font-semibold">
                {selectedOpp.opportunity
                  ? selectedOpp.opportunity.industry?.companyName
                  : selectedOpp.industry?.companyName}
              </p>
              <p className="text-[11px] text-brand-700 mt-0.5">
                Assessed match score:{' '}
                <strong>{selectedOpp.matchResult?.matchScore || 0}%</strong>. Verified skills and academic records will be submitted automatically.
              </p>
            </div>

            {applyMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{applyMessage}</span>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Cover Letter & Statement of Interest
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Highlight your academic foundation, verified skills, and interest in this role..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Portfolio & Transcripts: </span>
                  Your verified skills, project repository, and academic details will be attached automatically.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </Modal>

      {/* OPPORTUNITY SKILL ASSESSMENT RUNNER MODAL */}
      <Modal
        isOpen={assessmentModalOpen}
        onClose={() => {
          if (window.confirm('Are you sure you want to exit the assessment? Your progress will not be saved.')) {
            setTimerActive(false);
            setAssessmentModalOpen(false);
          }
        }}
        title="Vacancy Technical Assessment & Application"
        maxWidth="4xl"
      >
        {activeAssessment && (
          <div className="space-y-6">
            {/* Top Bar: Title & Timer */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{activeAssessment.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedOpp?.opportunity ? selectedOpp.opportunity.title : selectedOpp?.title} &bull;{' '}
                  {selectedOpp?.opportunity?.industry?.companyName || selectedOpp?.industry?.companyName}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Countdown Timer */}
                <div
                  className={'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-bold text-xs shadow-sm ' +
                    (assessmentTimeLeft < 300
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : assessmentTimeLeft < 600
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-white border-purple-200 text-purple-700')}
                >
                  <Clock className="w-4 h-4" />
                  <span>Time Remaining: {formatTimer(assessmentTimeLeft)}</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-emerald-700">
                  Pass Mark: {activeAssessment.passingScore}%
                </div>
              </div>
            </div>

            {/* Question Navigation Stepper */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {activeAssessment.questions.map((q: any, idx: number) => {
                const isAnswered = Boolean(selectedAnswers[q.id]);
                const isCurrent = currentQuestionIndex === idx && !isReviewStep;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setIsReviewStep(false);
                      setCurrentQuestionIndex(idx);
                    }}
                    className={'w-8 h-8 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center ' +
                      (isCurrent
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/40'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
                  >
                    {idx + 1}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsReviewStep(true)}
                className={'px-3 h-8 rounded-xl text-xs font-bold transition-all shrink-0 ml-auto ' +
                  (isReviewStep
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}
              >
                Review & Statement
              </button>
            </div>

            {/* Main Question Body OR Review Step */}
            {!isReviewStep ? (
              activeAssessment.questions[currentQuestionIndex] && (
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple">
                        Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
                      </Badge>
                      <Badge variant="info">
                        {activeAssessment.questions[currentQuestionIndex].skill?.name || 'Competency'}
                      </Badge>
                      <Badge variant="default">
                        {activeAssessment.questions[currentQuestionIndex].difficulty}
                      </Badge>
                    </div>
                    <span className="text-xs font-bold text-purple-700">
                      +{activeAssessment.questions[currentQuestionIndex].marks} Marks
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-900 leading-relaxed pt-1">
                    {activeAssessment.questions[currentQuestionIndex].questionText}
                  </div>

                  {/* Options Radio List */}
                  <div className="space-y-2.5 pt-2">
                    {activeAssessment.questions[currentQuestionIndex].options.map((opt: any, oIdx: number) => {
                      const qId = activeAssessment.questions[currentQuestionIndex].id;
                      const isSelected = selectedAnswers[qId] === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(qId, opt.id)}
                          className={'p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ' +
                            (isSelected
                              ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-400/20 shadow-sm font-semibold text-purple-900'
                              : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-700')}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={'w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ' +
                                (isSelected
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-white border-slate-300 text-slate-600')}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="text-xs">{opt.text}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              // Review & Cover Letter Step
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Submission Summary & Statement of Interest
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-lg font-black text-slate-900">
                      {Object.keys(selectedAnswers).length} / {activeAssessment.questions.length}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Questions Answered</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-lg font-black text-purple-700">
                      {activeAssessment.questions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 0), 0)}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Marks</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-lg font-black text-emerald-700">{activeAssessment.passingScore}%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Passing Cutoff</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-lg font-black text-indigo-700">{formatTimer(assessmentTimeLeft)}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Remaining Time</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cover Letter / Statement of Purpose for Recruiter *
                  </label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly explain your relevant projects, motivation, and why you are the ideal fit..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your score, skill breakdown, and verified academic credentials will be immediately submitted to the recruiter.
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={currentQuestionIndex === 0 && !isReviewStep}
                onClick={() => {
                  if (isReviewStep) {
                    setIsReviewStep(false);
                  } else {
                    setCurrentQuestionIndex((p) => Math.max(0, p - 1));
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {!isReviewStep ? (
                  currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((p) => p + 1)}
                      className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsReviewStep(true)}
                      className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
                    >
                      Proceed to Review
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={submittingAssessment}
                    onClick={handleSubmitAssessment}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {submittingAssessment ? 'Submitting & Evaluating...' : 'Submit Assessment & Application'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* OPPORTUNITY ASSESSMENT RESULT MODAL */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Assessment Evaluation & Application Status"
        maxWidth="3xl"
      >
        {assessmentResult && (
          <div className="space-y-6">
            {/* Header Result Banner */}
            <div
              className={'p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ' +
                (assessmentResult.isPassed
                  ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-emerald-200'
                  : 'bg-gradient-to-r from-rose-50 via-red-50 to-rose-100 border-rose-200')}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ' +
                      (assessmentResult.isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white')}
                  >
                    {assessmentResult.isPassed ? 'Assessment Passed' : 'Assessment Failed'}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Cutoff: {assessmentResult.passingScore || 60}%
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {assessmentResult.isPassed
                    ? 'Congratulations! Your application has been submitted.'
                    : 'Assessment score below passing threshold.'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {assessmentResult.isPassed
                    ? 'Your verified competency score has been added to your profile and forwarded to the recruiter.'
                    : 'Review the identified skill gaps below and explore recommended learning resources to improve.'}
                </p>
              </div>

              <div className="text-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm shrink-0">
                <div
                  className={'text-3xl font-black ' +
                    (assessmentResult.isPassed ? 'text-emerald-700' : 'text-rose-700')}
                >
                  {assessmentResult.scorePercentage}%
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Earned Score ({assessmentResult.earnedMarks} / {assessmentResult.totalMarks} Marks)
                </div>
              </div>
            </div>

            {/* Skill-wise Breakdown */}
            {assessmentResult.skillBreakdown && assessmentResult.skillBreakdown.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  Competency Performance Breakdown
                </h4>

                <div className="space-y-2">
                  {assessmentResult.skillBreakdown.map((sb: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{sb.skillName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                            {sb.proficiencyLevel}
                          </span>
                        </div>
                        <span className="font-bold text-slate-700">{sb.scorePercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={'h-full rounded-full ' +
                            (sb.scorePercentage >= 75
                              ? 'bg-emerald-500'
                              : sb.scorePercentage >= 60
                              ? 'bg-sky-500'
                              : sb.scorePercentage >= 40
                              ? 'bg-amber-500'
                              : 'bg-rose-500')}
                          style={{ width: sb.scorePercentage + '%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths and Gaps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Demonstrated Strengths
                </div>
                <div className="flex flex-wrap gap-1">
                  {assessmentResult.demonstratedStrengths?.length > 0 ? (
                    assessmentResult.demonstratedStrengths.map((s: string, idx: number) => (
                      <span key={idx} className="text-xs font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No advanced strengths recorded</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Identified Skill Gaps
                </div>
                <div className="flex flex-wrap gap-1">
                  {assessmentResult.skillGaps?.length > 0 ? (
                    assessmentResult.skillGaps.map((g: string, idx: number) => (
                      <span key={idx} className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg">
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">All benchmark skills satisfied</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Courses to bridge gaps */}
            {assessmentResult.recommendedCourses && assessmentResult.recommendedCourses.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  Recommended Courses to Bridge Gaps
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assessmentResult.recommendedCourses.slice(0, 2).map((c: any) => (
                    <div key={c.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                      <div className="text-xs font-bold text-slate-900">{c.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-bold text-brand-700">{c.category || 'Domain Skill'}</span>
                        <a
                          href="/student/courses"
                          className="text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                        >
                          Enroll Now <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResultModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
