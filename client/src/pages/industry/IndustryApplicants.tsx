import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Application } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Building,
  GraduationCap,
  Calendar,
  Video,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  Award,
  AlertTriangle,
  TrendingUp,
  Target,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const IndustryApplicants: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOppId = searchParams.get('opportunityId') || 'ALL';

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState(initialOppId);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState('ALL');
  const [minMatchFilter, setMinMatchFilter] = useState('ALL');
  const [minCgpaFilter, setMinCgpaFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Candidate Evaluation Deep Dive Modal
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [activeCandidateApp, setActiveCandidateApp] = useState<any | null>(null);

  // Interview modal
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<any | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/new');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Status update notes modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedOppId !== 'ALL') params.append('opportunityId', selectedOppId);
      if (minScoreFilter !== 'ALL') params.append('minScore', minScoreFilter);
      if (minMatchFilter !== 'ALL') params.append('minCompatibility', minMatchFilter);
      if (minCgpaFilter !== 'ALL') params.append('minCgpa', minCgpaFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const [oppsRes, appsRes] = await Promise.all([
        api.get('/opportunities/my/created'),
        api.get('/opportunities/my/applicants?' + params.toString()),
      ]);
      setOpportunities(oppsRes.data);
      setApplicants(appsRes.data);
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedOppId, minScoreFilter, minMatchFilter, minCgpaFilter, statusFilter]);

  const handleOpenStatusChange = (app: any, status: string) => {
    setActiveApp(app);
    setTargetStatus(status);
    setStatusNotes('Candidate moved to ' + status + ' stage.');
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;

    try {
      await api.put('/opportunities/applications/' + activeApp.id + '/status', {
        status: targetStatus,
        notes: statusNotes,
      });
      setStatusModalOpen(false);
      if (activeCandidateApp && activeCandidateApp.id === activeApp.id) {
        setActiveCandidateApp({ ...activeCandidateApp, status: targetStatus });
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleOpenSchedule = (app: any) => {
    setActiveApp(app);
    setScheduledAt('');
    setMeetingLink('https://meet.google.com/new');
    setInterviewNotes('');
    setInterviewModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;

    try {
      await api.post('/opportunities/applications/' + activeApp.id + '/interview', {
        scheduledAt,
        meetingLink,
        notes: interviewNotes,
      });
      alert('Interview scheduled successfully!');
      setInterviewModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule interview.');
    }
  };

  const handleOpenEvaluation = (app: any) => {
    setActiveCandidateApp(app);
    setEvalModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return <Badge variant="success">Selected / Offer</Badge>;
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return <Badge variant="info">{status}</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="purple">Under Review</Badge>;
      case 'ASSESSMENT_FAILED':
        return <Badge variant="danger">Assessment Failed</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="default">Withdrawn</Badge>;
      default:
        return <Badge variant="default">Applied</Badge>;
    }
  };

  const getProficiencyBadgeClass = (tier: string) => {
    switch (tier) {
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADVANCED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'DEVELOPING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const nameMatch = (app.student?.fullName || '').toLowerCase().includes(s);
    const deptMatch = (app.student?.department || '').toLowerCase().includes(s);
    const degMatch = (app.student?.degree || '').toLowerCase().includes(s);
    const instMatch = (app.student?.institutionName || '').toLowerCase().includes(s);
    const roleMatch = (app.opportunity?.title || '').toLowerCase().includes(s);
    return nameMatch || deptMatch || degMatch || instMatch || roleMatch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Recruiter Applicant Pipeline
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Applicant Pipeline & Screening</h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate candidate technical assessment scores, verified competencies, strengths, skill gaps, and manage candidate stages.
          </p>
        </div>

        {/* Filter by Opportunity */}
        <select
          value={selectedOppId}
          onChange={(e) => setSelectedOppId(e.target.value)}
          className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm"
        >
          <option value="ALL">All Postings ({applicants.length} Candidates)</option>
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title} ({o.applications?.length || 0} applicants)
            </option>
          ))}
        </select>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by candidate name, degree, department, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Assessment Score Filter */}
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Assessment Scores</option>
              <option value="90">Assessment ≥ 90% (Expert)</option>
              <option value="75">Assessment ≥ 75% (Advanced)</option>
              <option value="60">Assessment ≥ 60% (Passed)</option>
              <option value="50">Assessment ≥ 50%</option>
            </select>

            {/* Compatibility % Filter */}
            <select
              value={minMatchFilter}
              onChange={(e) => setMinMatchFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Match %</option>
              <option value="85">Match ≥ 85%</option>
              <option value="70">Match ≥ 70%</option>
              <option value="50">Match ≥ 50%</option>
            </select>

            {/* Min CGPA Filter */}
            <select
              value={minCgpaFilter}
              onChange={(e) => setMinCgpaFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All CGPAs</option>
              <option value="8.5">CGPA ≥ 8.5</option>
              <option value="7.5">CGPA ≥ 7.5</option>
              <option value="6.5">CGPA ≥ 6.5</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Stages</option>
              <option value="APPLIED">Applied</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Selected / Offer</option>
              <option value="ASSESSMENT_FAILED">Assessment Failed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Pipeline Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : filteredApplicants.length > 0 ? (
        <div className="space-y-4">
          {filteredApplicants.map((app) => {
            const hasAssessment = app.assessmentScore != null;
            const isPassed = app.assessmentPassed;
            const demonstratedStrengths = app.demonstratedStrengths || [];
            const skillGaps = app.skillGaps || [];

            return (
              <div
                key={app.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-start justify-between gap-6 hover:shadow-md transition-all"
              >
                {/* Candidate Core Info */}
                <div className="space-y-4 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {app.student?.fullName || 'Candidate'}
                        </h3>
                        {app.isEligible === false && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            Ineligible ({app.ineligibleReasons?.[0] || 'Criteria not met'})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {app.student?.degree} in {app.student?.department} &bull; CGPA:{' '}
                        <strong>{app.student?.cgpa || 'N/A'}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {app.student?.institutionName} &bull; Target Role:{' '}
                        <strong className="text-slate-700">{app.opportunity?.title}</strong>
                      </p>
                    </div>

                    {/* Scores Badges */}
                    <div className="flex items-center gap-2">
                      {/* Match Compatibility */}
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        {app.matchScore}% Match
                      </span>

                      {/* Assessment Score */}
                      {hasAssessment ? (
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-xl text-xs border ${
                            isPassed
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-rose-700 bg-rose-50 border-rose-200'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          Assessment: {app.assessmentScore}% {isPassed ? '(Passed)' : '(Failed)'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                          No Assessment
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Demonstrated Strengths & Skill Gaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Strengths */}
                    <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Demonstrated Strengths (≥75%)
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {demonstratedStrengths.length > 0 ? (
                          demonstratedStrengths.map((st, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-emerald-100/70 text-emerald-900 px-2 py-0.5 rounded-lg"
                            >
                              {st}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            No high strengths recorded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skill Gaps */}
                    <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Identified Skill Gaps (&lt;60%)
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skillGaps.length > 0 ? (
                          skillGaps.map((gap, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded-lg"
                            >
                              {gap}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            No major skill gaps identified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {app.coverLetter && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700 block mb-0.5">Cover Letter:</span>
                      "{app.coverLetter}"
                    </div>
                  )}

                  {/* Deep-dive trigger link */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEvaluation(app)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline"
                    >
                      <Target className="w-3.5 h-3.5" />
                      View Candidate Competency Deep-Dive & Question Breakdown
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    {app.resumeUrl && (
                      <a
                        href={'http://localhost:5000' + app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 underline ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Resume
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Column & Pipeline Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Pipeline Stage:</span>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenStatusChange(app, 'UNDER_REVIEW')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                    >
                      Under Review
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStatusChange(app, 'SHORTLISTED')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors border border-sky-200"
                    >
                      Shortlist
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenSchedule(app)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Video className="w-3 h-3" />
                      Interview
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStatusChange(app, 'SELECTED')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                    >
                      Select / Offer
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStatusChange(app, 'REJECTED')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No candidates match selected criteria"
          description="Adjust your screening filters or check back later as students complete your industry assessments."
        />
      )}

      {/* Candidate Competency Deep-Dive Modal */}
      <Modal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        title="Candidate Competency & Assessment Deep-Dive"
        maxWidth="4xl"
      >
        {activeCandidateApp && (
          <div className="space-y-6">
            {/* Candidate Header Summary */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeCandidateApp.student?.fullName}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {activeCandidateApp.student?.degree} in {activeCandidateApp.student?.department} &bull; CGPA: {activeCandidateApp.student?.cgpa || 'N/A'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeCandidateApp.student?.institutionName} &bull; Applied for:{' '}
                  <strong>{activeCandidateApp.opportunity?.title}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center p-3 bg-white rounded-xl border border-purple-200">
                  <div className="text-xl font-black text-purple-700">
                    {activeCandidateApp.matchScore}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Match Score</div>
                </div>

                <div className="text-center p-3 bg-white rounded-xl border border-purple-200">
                  <div
                    className={`text-xl font-black ${
                      activeCandidateApp.assessmentPassed ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {activeCandidateApp.assessmentScore != null
                      ? activeCandidateApp.assessmentScore + '%'
                      : 'N/A'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Assessment {activeCandidateApp.assessmentPassed ? '(Passed)' : '(Failed)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Skill-Wise Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Evaluated Skill Competency Breakdown
              </h4>

              {activeCandidateApp.assessmentBreakdown && Array.isArray(activeCandidateApp.assessmentBreakdown) ? (
                <div className="space-y-2">
                  {activeCandidateApp.assessmentBreakdown.map((sb, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{sb.skillName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getProficiencyBadgeClass(
                              sb.proficiencyLevel
                            )}`}
                          >
                            {sb.proficiencyLevel}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700">
                          {sb.scorePercentage}% ({sb.earnedMarks} / {sb.totalMarks} Marks)
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            sb.scorePercentage >= 75
                              ? 'bg-emerald-500'
                              : sb.scorePercentage >= 60
                              ? 'bg-sky-500'
                              : sb.scorePercentage >= 40
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: sb.scorePercentage + '%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 italic">
                  No detailed skill breakdown available for this attempt.
                </div>
              )}
            </div>

            {/* Strengths & Gaps Deep Analysis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Demonstrated Competencies
                </h5>
                <ul className="space-y-1">
                  {(activeCandidateApp.demonstratedStrengths || []).map((s, idx) => (
                    <li key={idx} className="text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                      &bull; {s}
                    </li>
                  ))}
                  {(!activeCandidateApp.demonstratedStrengths || activeCandidateApp.demonstratedStrengths.length === 0) && (
                    <li className="text-xs text-slate-400 italic">No advanced strengths recorded.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Identified Skill Gaps
                </h5>
                <ul className="space-y-1">
                  {(activeCandidateApp.skillGaps || []).map((g, idx) => (
                    <li key={idx} className="text-xs text-amber-800 flex items-center gap-1.5 font-medium">
                      &bull; {g}
                    </li>
                  ))}
                  {(!activeCandidateApp.skillGaps || activeCandidateApp.skillGaps.length === 0) && (
                    <li className="text-xs text-emerald-700 font-medium">Candidate meets all benchmark competencies.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Pipeline Stage:</span>
                {getStatusBadge(activeCandidateApp.status)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEvalModalOpen(false);
                    handleOpenStatusChange(activeCandidateApp, 'SHORTLISTED');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200"
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEvalModalOpen(false);
                    handleOpenSchedule(activeCandidateApp);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEvalModalOpen(false);
                    handleOpenStatusChange(activeCandidateApp, 'SELECTED');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200"
                >
                  Select / Offer
                </button>
                <button
                  type="button"
                  onClick={() => setEvalModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        title={'Schedule Technical Interview: ' + (activeApp?.student?.fullName || '')}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interview Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Video Meeting Link (Google Meet / Zoom)
            </label>
            <input
              type="url"
              required
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Instructions for Candidate
            </label>
            <textarea
              rows={3}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="e.g., Please have your code editor and portfolio ready for screen share..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setInterviewModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              Confirm Interview Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={'Change Candidate Stage to ' + targetStatus}
      >
        <form onSubmit={handleConfirmStatusChange} className="space-y-4">
          <p className="text-xs text-slate-600">
            Updating candidate <strong className="text-slate-900">{activeApp?.student?.fullName}</strong> to{' '}
            <strong className="text-purple-700">{targetStatus}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recruiter Feedback / Status History Note
            </label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
            >
              Update Candidate Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
