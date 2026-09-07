import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  Users,
  Video,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Building,
  Target,
  GraduationCap,
  Award,
  AlertCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export const IndustryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Recommended candidates state
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [candidatesData, setCandidatesData] = useState<any>(null);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    Promise.all([
      api.get('/opportunities/my/created'),
      api.get('/opportunities/my/applicants'),
      api.get('/collaboration/my/created').catch(() => ({ data: [] })),
    ])
      .then(([oppsRes, appsRes, collabsRes]) => {
        setOpportunities(oppsRes.data);
        setApplicants(appsRes.data);
        setCollaborations(collabsRes.data);
        if (oppsRes.data.length > 0) {
          setSelectedOppId(oppsRes.data[0].id);
          fetchCandidates(oppsRes.data[0].id);
        } else {
          fetchCandidates('');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchCandidates = (oppId?: string) => {
    setCandidatesLoading(true);
    const url = oppId
      ? `/industry/recommended-candidates?opportunityId=${encodeURIComponent(oppId)}`
      : '/industry/recommended-candidates';
    api
      .get(url)
      .then((res) => {
        setCandidatesData(res.data);
      })
      .catch((err) => console.error('Failed to fetch recommended candidates:', err))
      .finally(() => setCandidatesLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpportunityChange = (oppId: string) => {
    setSelectedOppId(oppId);
    fetchCandidates(oppId);
  };

  const totalOpenings = opportunities.reduce((acc, o) => acc + (o.numberOfOpenings || 1), 0);
  const interviewingCount = applicants.filter((a) => a.status === 'INTERVIEW').length;
  const selectedCount = applicants.filter((a) => a.status === 'SELECTED').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-brand-600 p-6 sm:p-8 text-white shadow-lg shadow-purple-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur border border-white/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Corporate Talent & Collaboration Command
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {user?.profile?.companyName || 'Corporate Partner'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl">
              Sector: {user?.profile?.industrySector || 'Technology'} &bull; Location: {user?.profile?.location || 'India'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/industry/opportunities/create"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-purple-900 bg-white hover:bg-purple-50 rounded-2xl shadow-md transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-purple-700" />
              Post Opportunity
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Postings"
          value={opportunities.length}
          subtitle={`${totalOpenings} target openings`}
          icon={Briefcase}
          color="purple"
        />
        <StatCard
          title="Total Applicants"
          value={applicants.length}
          subtitle="Screened candidates"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Collaborations"
          value={collaborations.length}
          subtitle="Active R&D / projects"
          icon={Building}
          color="emerald"
        />
        <StatCard
          title="Interviews"
          value={interviewingCount}
          subtitle="Scheduled sessions"
          icon={Video}
          color="amber"
        />
        <StatCard
          title="Selected / Hired"
          value={selectedCount}
          subtitle="Confirmed offers"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* AI-Recommended Candidate Pool (Domain-Scoped Talent) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">AI-Matched Talent Discovery</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ranked domain student candidates matching your required competencies and job roles.
            </p>
          </div>

          {/* Opportunity Switcher */}
          {opportunities.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Role:</span>
              <select
                value={selectedOppId}
                onChange={(e) => handleOpportunityChange(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {candidatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : candidatesData?.candidates?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidatesData.candidates.slice(0, 6).map((c: any, idx: number) => (
              <div
                key={c.studentId}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-purple-200 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {c.fullName}
                        {c.isEligible ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Ineligible
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {c.degree} &bull; {c.department}
                      </p>
                      <p className="text-[11px] text-slate-500">{c.institutionName}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-black px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200">
                        {c.matchScore}% Match
                      </span>
                      {c.cgpa && (
                        <span className="text-[10px] text-slate-500 font-bold block mt-1">
                          CGPA: {c.cgpa}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills breakdown */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    {c.matchedSkills?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-800">Matched:</span>
                        {c.matchedSkills.slice(0, 4).map((ms: any, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold"
                          >
                            {ms.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {c.missingSkills?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-rose-800">Missing:</span>
                        {c.missingSkills.slice(0, 3).map((sk: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {c.applicationStatus ? (
                    <span className="font-bold text-purple-700">
                      Application Status: {c.applicationStatus}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Talent pool candidate</span>
                  )}
                  <Link
                    to="/industry/applicants"
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    View in Pipeline &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No candidates found matching criteria"
            description="As more domain students register and assess their competencies, top matched profiles will appear here."
          />
        )}
      </div>

      {/* Talent Screening Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Talent Screening Pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by candidate skill compatibility calculated by the SkillBridge engine.
            </p>
          </div>
          <Link to="/industry/applicants" className="text-xs font-semibold text-purple-600 hover:text-purple-700">
            Open Pipeline &rarr;
          </Link>
        </div>

        {applicants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Opportunity</th>
                  <th className="pb-3">Institution & Dept</th>
                  <th className="pb-3">Skill Match</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.slice(0, 6).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">{app.student?.fullName}</td>
                    <td className="py-3 text-slate-600">{app.opportunity?.title}</td>
                    <td className="py-3 text-slate-500">
                      {app.student?.department} &bull; {app.student?.institutionName}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {app.matchScore}% Match
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          app.status === 'SELECTED'
                            ? 'success'
                            : app.status === 'INTERVIEW'
                            ? 'warning'
                            : app.status === 'SHORTLISTED'
                            ? 'info'
                            : app.status === 'REJECTED'
                            ? 'danger'
                            : 'default'
                        }
                        size="sm"
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/industry/applicants"
                        className="text-purple-600 hover:text-purple-800 font-semibold"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No applicants yet"
            description="Students will appear in your pipeline once they apply to your posted internships and jobs."
          />
        )}
      </div>
    </div>
  );
};
