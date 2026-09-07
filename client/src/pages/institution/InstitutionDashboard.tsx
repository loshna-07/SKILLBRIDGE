import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  School,
  Users,
  Award,
  TrendingUp,
  Briefcase,
  BadgePercent,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Filter,
  Layers,
  ChevronRight,
  GraduationCap,
  Target,
  BarChart3,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const InstitutionDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Branch analytics state
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [branchData, setBranchData] = useState<any>(null);
  const [branchLoading, setBranchLoading] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    api
      .get('/institution/dashboard')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.error('Error loading institution dashboard:', err))
      .finally(() => setLoading(false));
  };

  const fetchBranchAnalytics = (branch: string) => {
    setBranchLoading(true);
    api
      .get(`/institution/branch-analytics?branch=${encodeURIComponent(branch)}`)
      .then((res) => {
        setBranchData(res.data);
      })
      .catch((err) => console.error('Error fetching branch analytics:', err))
      .finally(() => setBranchLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
    fetchBranchAnalytics('ALL');
  }, []);

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    fetchBranchAnalytics(branch);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { institution, analytics } = data || {};

  const AVAILABLE_BRANCHES = [
    { key: 'ALL', label: 'All Departments' },
    { key: 'BAMS', label: 'BAMS (Ayurveda)' },
    { key: 'Kayachikitsa', label: 'Kayachikitsa' },
    { key: 'Dravyaguna', label: 'Dravyaguna' },
    { key: 'Computer Science', label: 'B.Tech CSE' },
    { key: 'Electronics', label: 'B.E ECE' },
    { key: 'Commerce', label: 'B.Com / Finance' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-600 to-brand-600 p-6 sm:p-8 text-white shadow-lg shadow-emerald-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur border border-white/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Institutional Administrative Command
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {institution?.institutionName || 'Academic Institution'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              {institution?.institutionType || 'University / College'} &bull; University Affiliation:{' '}
              {institution?.affiliatedUniversity || 'Autonomous'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/institution/verify-portfolio"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-50 rounded-xl shadow-md transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              Verify Portfolios
            </Link>
            <Link
              to="/institution/students"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-800/80 hover:bg-emerald-800 rounded-xl border border-white/20 transition-all"
            >
              <Users className="w-4 h-4" />
              Student Directory
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Institution KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={analytics?.totalStudents || 0}
          subtitle="Enrolled on portal"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Assessment Rate"
          value={`${analytics?.assessmentCompletionRate || 0}%`}
          subtitle={`${analytics?.assessedStudentsCount || 0} assessed students`}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Avg Skill Score"
          value={analytics?.avgSkillScore ? `${analytics.avgSkillScore}%` : 'N/A'}
          subtitle="Overall competency index"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Placement Rate"
          value={`${analytics?.applicationMetrics?.placementRate || 0}%`}
          subtitle={`${analytics?.applicationMetrics?.selectedCount || 0} offers secured`}
          icon={BadgePercent}
          color="amber"
        />
      </div>

      {/* 3. Interactive Branch-Level Analytics Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Department & Branch Deep-Dive Analytics</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any academic department or degree branch to inspect targeted performance, skill gaps, and placements.
            </p>
          </div>

          {/* Branch Pill Selector */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
            {AVAILABLE_BRANCHES.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => handleBranchChange(b.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedBranch === b.key
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {branchLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : branchData ? (
          <div className="space-y-6">
            {/* Branch Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800">Branch Students</span>
                <span className="text-2xl font-bold text-emerald-950 block mt-1">
                  {branchData.totalStudents}
                </span>
                <span className="text-[11px] text-emerald-700 mt-0.5 block">
                  Active academic profiles
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="text-xs font-semibold text-blue-800">Average CGPA</span>
                <span className="text-2xl font-bold text-blue-950 block mt-1">
                  {branchData.avgCgpa > 0 ? branchData.avgCgpa : 'N/A'}
                </span>
                <span className="text-[11px] text-blue-700 mt-0.5 block">
                  Cumulative academic average
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <span className="text-xs font-semibold text-purple-800">Assessment Rate</span>
                <span className="text-2xl font-bold text-purple-950 block mt-1">
                  {branchData.assessedPercentage}%
                </span>
                <span className="text-[11px] text-purple-700 mt-0.5 block">
                  Verified with tests
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">Branch Placement</span>
                <span className="text-2xl font-bold text-amber-950 block mt-1">
                  {branchData.placedPercentage}%
                </span>
                <span className="text-[11px] text-amber-700 mt-0.5 block">
                  Selected candidates
                </span>
              </div>
            </div>

            {/* Top Demonstrated Skills & Career Pathways */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Skills */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Top Demonstrated Skills
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {branchData.topSkills?.length || 0} skills identified
                  </span>
                </div>

                {branchData.topSkills?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No verified skill records found for this branch.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {branchData.topSkills.map((s: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-500">{s.count} students</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {s.avgScore}% Avg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Career Interests */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Student Target Career Interests
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Target pathways
                  </span>
                </div>

                {branchData.topCareerInterests?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No student career interests recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {branchData.topCareerInterests.map((ci: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"
                      >
                        <span className="text-xs font-bold text-slate-900">{ci.interest}</span>
                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                          {ci.count} {ci.count === 1 ? 'student' : 'students'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Branch Skill Gaps & Recruitment Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branch Skill Gaps / Deficits */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Branch Skill Deficits vs Industry Postings
                  </h3>
                </div>

                {branchData.branchSkillGaps?.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No critical skill shortages detected in this branch.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {branchData.branchSkillGaps.map((gap: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-100"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900">{gap.skillName}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Demanded in industry postings
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                            Missing in {gap.missingCount} students
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              gap.severity === 'HIGH'
                                ? 'bg-red-500 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {gap.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Branch Recruitment Pipeline */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-brand-600" />
                  Branch Application & Placement Pipeline
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Applications</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">
                      {branchData.applicationPipeline?.applied || 0}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-sky-200">
                    <span className="text-[11px] font-semibold text-sky-700 block">Shortlisted</span>
                    <span className="text-xl font-bold text-sky-900 mt-1 block">
                      {branchData.applicationPipeline?.shortlisted || 0}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200">
                    <span className="text-[11px] font-semibold text-emerald-700 block">Placed Offers</span>
                    <span className="text-xl font-bold text-emerald-900 mt-1 block">
                      {branchData.applicationPipeline?.selected || 0}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 block">Rejected</span>
                    <span className="text-xl font-bold text-slate-500 mt-1 block">
                      {branchData.applicationPipeline?.rejected || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 4. Skills Demand vs Supply & General Recruitment Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">General Skill Demand vs Supply</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compares students assessed with skills demanded by active corporate postings.
              </p>
            </div>
            <Link to="/institution/skills" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Details &rarr;
            </Link>
          </div>

          {analytics?.skillComparison && analytics.skillComparison.length > 0 ? (
            <div className="space-y-3 pt-2">
              {analytics.skillComparison.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{item.skill}</span>
                    {item.isShortage ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Deficit of {item.gap}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Sufficient Talent
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <span>Industry Postings: <strong>{item.industryDemand}</strong></span>
                    <span>Student Possessing: <strong>{item.studentCount}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No skill comparisons available yet"
              description="As students complete skill assessments and industry partners post opportunities, automated demand vs supply analytics will populate here."
            />
          )}
        </div>

        {/* Quick Links & Verification shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Institutional Administration Hub</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct access to verified student talent, academician profiles, and corporate partnerships.
            </p>

            <div className="space-y-3 mt-4">
              <Link
                to="/institution/students"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      Student Talent Directory
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Filter students by CGPA, branch, verified competencies, and placement status
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
              </Link>

              <Link
                to="/institution/verify-portfolio"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      Portfolio Verification Center
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Validate student certificates, projects, and assessment scores
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>SkillBridge Institution Governance</span>
            <span className="font-semibold text-emerald-700">Live Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
