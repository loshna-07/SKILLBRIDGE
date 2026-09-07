import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  TrendingUp,
  BarChart3,
  Users,
  Award,
  Briefcase,
  BadgePercent,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Filter,
  RotateCcw,
  Building,
  GraduationCap,
  CalendarCheck,
  Target,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const InstitutionAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedDept !== 'ALL') params.department = selectedDept;
      if (selectedCohort !== 'ALL') params.cohort = selectedCohort;
      if (selectedType !== 'ALL') params.opportunityType = selectedType;

      const res = await api.get('/institution/intelligence', { params });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load institution intelligence', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept, selectedCohort, selectedType]);

  const handleResetFilters = () => {
    setSelectedDept('ALL');
    setSelectedCohort('ALL');
    setSelectedType('ALL');
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = Boolean(data?.hasData);
  const summary = data?.summary || {};
  const dimensions = data?.dimensions || {};
  const availableDepts: string[] = data?.filters?.availableDepartments || [];
  const availableCohorts: string[] = data?.filters?.availableCohorts || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Institution Intelligence & Decision Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Institutional Performance & Skill Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Real-time analytics across student competencies, industry skill deficits, internship conversions,
            and department readiness derived exclusively from database records.
          </p>
        </div>

        {data?.generatedAt && (
          <div className="text-right text-[11px] text-slate-400 shrink-0">
            <span>Live Database Query</span>
            <p className="font-mono text-slate-500 mt-0.5">
              {new Date(data.generatedAt).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 w-full md:w-auto">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Analytics Filters:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-3xl">
          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="ALL">All Departments</option>
              {availableDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Cohort / Grad Year Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Graduation Cohort</label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="ALL">All Cohorts</option>
              {availableCohorts.map((c) => (
                <option key={c} value={c}>
                  Batch of {c}
                </option>
              ))}
            </select>
          </div>

          {/* Opportunity Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Opportunity Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="ALL">All Opportunities</option>
              <option value="INTERNSHIP">Internships Only</option>
              <option value="JOB">Full-Time Jobs Only</option>
            </select>
          </div>
        </div>

        {(selectedDept !== 'ALL' || selectedCohort !== 'ALL' || selectedType !== 'ALL') && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Top High-Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={summary.totalStudents || 0}
          subtitle={selectedDept !== 'ALL' ? `In ${selectedDept}` : 'Platform cohort'}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Assessment Rate"
          value={`${summary.overallAssessmentRate || 0}%`}
          subtitle={`${summary.overallAssessedStudents || 0} assessed students`}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Avg Assessment Score"
          value={summary.overallAvgScore ? `${summary.overallAvgScore}%` : 'N/A'}
          subtitle="Competency benchmark"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Placement / Selection"
          value={`${summary.placementRate || 0}%`}
          subtitle={`${summary.selectedCount || 0} confirmed selections`}
          icon={BadgePercent}
          color="amber"
        />
      </div>

      {/* Conditional Rendering: Empty State vs Dynamic Analytics */}
      {!hasData ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <EmptyState
            icon={BarChart3}
            title="No data available yet."
            description="The institution intelligence dashboard operates entirely on real database records. As students register, complete skill assessments, apply for internships, and engage in learning programs, dynamic charts and predictive readiness metrics will automatically populate here."
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Row 1: Student Skill Distribution & Skill Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Student Skill Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Student Skill Distribution
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    {dimensions.studentSkillDistribution?.totalSkillsTracked || 0} Total Skills
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Breakdown of competency proficiency levels across the student cohort.
                </p>

                {/* Proficiency Level Stacked Meter */}
                {dimensions.studentSkillDistribution?.totalSkillsTracked > 0 ? (
                  <div className="space-y-3">
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{
                          width: `${dimensions.studentSkillDistribution.proficiencyPercentages.EXPERT}%`,
                        }}
                        title={`Expert: ${dimensions.studentSkillDistribution.proficiencyPercentages.EXPERT}%`}
                      />
                      <div
                        className="bg-blue-500 h-full transition-all"
                        style={{
                          width: `${dimensions.studentSkillDistribution.proficiencyPercentages.ADVANCED}%`,
                        }}
                        title={`Advanced: ${dimensions.studentSkillDistribution.proficiencyPercentages.ADVANCED}%`}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all"
                        style={{
                          width: `${dimensions.studentSkillDistribution.proficiencyPercentages.INTERMEDIATE}%`,
                        }}
                        title={`Intermediate: ${dimensions.studentSkillDistribution.proficiencyPercentages.INTERMEDIATE}%`}
                      />
                      <div
                        className="bg-slate-400 h-full transition-all"
                        style={{
                          width: `${dimensions.studentSkillDistribution.proficiencyPercentages.BEGINNER}%`,
                        }}
                        title={`Beginner: ${dimensions.studentSkillDistribution.proficiencyPercentages.BEGINNER}%`}
                      />
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                        <span className="text-[11px] text-emerald-700 block font-semibold">Expert</span>
                        <span className="font-bold text-slate-900">
                          {dimensions.studentSkillDistribution.proficiencyCounts.EXPERT} (
                          {dimensions.studentSkillDistribution.proficiencyPercentages.EXPERT}%)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                        <span className="text-[11px] text-blue-700 block font-semibold">Advanced</span>
                        <span className="font-bold text-slate-900">
                          {dimensions.studentSkillDistribution.proficiencyCounts.ADVANCED} (
                          {dimensions.studentSkillDistribution.proficiencyPercentages.ADVANCED}%)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                        <span className="text-[11px] text-amber-700 block font-semibold">Intermediate</span>
                        <span className="font-bold text-slate-900">
                          {dimensions.studentSkillDistribution.proficiencyCounts.INTERMEDIATE} (
                          {dimensions.studentSkillDistribution.proficiencyPercentages.INTERMEDIATE}%)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] text-slate-500 block font-semibold">Beginner</span>
                        <span className="font-bold text-slate-900">
                          {dimensions.studentSkillDistribution.proficiencyCounts.BEGINNER} (
                          {dimensions.studentSkillDistribution.proficiencyPercentages.BEGINNER}%)
                        </span>
                      </div>
                    </div>

                    {/* Top Student Skills Horizontal Bars */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Top Skills in Cohort</span>
                      {dimensions.studentSkillDistribution.topStudentSkills.slice(0, 5).map((s: any, i: number) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{s.skill}</span>
                            <span className="text-slate-500">
                              {s.count} students ({s.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, s.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skill profiles recorded for this filter.</p>
                )}
              </div>
            </div>

            {/* 2. Skill Gaps (Supply vs Demand) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Skill Gap Analysis (Supply vs Demand)
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">Market Deficit</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Identifies critical talent deficits where industry demand exceeds student skill supply.
                </p>

                {dimensions.skillGaps?.allSkillGaps && dimensions.skillGaps.allSkillGaps.length > 0 ? (
                  <div className="space-y-3">
                    {dimensions.skillGaps.allSkillGaps.slice(0, 6).map((item: any, idx: number) => {
                      const maxVal = Math.max(item.industryDemand, item.studentCount, 1);
                      const demandPct = Math.round((item.industryDemand / maxVal) * 100);
                      const supplyPct = Math.round((item.studentCount / maxVal) * 100);

                      return (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{item.skill}</span>
                            {item.isDeficit ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                Deficit of {item.gap}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Balanced / Surplus
                              </span>
                            )}
                          </div>

                          {/* Dual Bar Visual */}
                          <div className="space-y-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="w-16 text-slate-500">Industry:</span>
                              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-rose-500 h-full rounded-full transition-all"
                                  style={{ width: `${demandPct}%` }}
                                />
                              </div>
                              <span className="font-semibold text-slate-700 w-8 text-right">
                                {item.industryDemand}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="w-16 text-slate-500">Students:</span>
                              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all"
                                  style={{ width: `${supplyPct}%` }}
                                />
                              </div>
                              <span className="font-semibold text-slate-700 w-8 text-right">
                                {item.studentCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skill requirements found in current postings.</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Industry Skill Demand & Placement Pipeline Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Industry Skill Demand */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-sky-600" />
                  Industry Skill Demand
                </h2>
                <Badge variant="info" size="sm">
                  {dimensions.industrySkillDemand?.totalOpportunitySkills || 0} Skill Mentions
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Most requested skills across active corporate recruitment postings.
              </p>

              {dimensions.industrySkillDemand?.topInDemandSkills &&
              dimensions.industrySkillDemand.topInDemandSkills.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {dimensions.industrySkillDemand.topInDemandSkills.slice(0, 5).map((d: any, i: number) => {
                    const topDemand = dimensions.industrySkillDemand.topInDemandSkills[0]?.totalDemand || 1;
                    const pct = Math.round((d.totalDemand / topDemand) * 100);

                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{d.skill}</span>
                          <span className="text-slate-500 font-bold">{d.totalDemand} Postings</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No published industry postings available.</p>
              )}

              {/* Work Mode Demand Pills */}
              {dimensions.industrySkillDemand?.workModeDemand && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  {dimensions.industrySkillDemand.workModeDemand.map((wm: any) => (
                    <div key={wm.mode} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">{wm.mode}</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{wm.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Placement Pipeline (Recruitment Funnel) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Placement Pipeline Funnel
                </h2>
                <Badge variant="purple" size="sm">
                  {dimensions.placementPipeline?.conversionRates?.overallConversion || 0}% Conversion
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                End-to-end applicant progression from initial application to final offer selection.
              </p>

              {dimensions.placementPipeline?.stages ? (
                <div className="space-y-3 pt-2">
                  {dimensions.placementPipeline.stages.map((stage: any, idx: number) => {
                    const colors = [
                      'bg-slate-800 text-white',
                      'bg-blue-600 text-white',
                      'bg-purple-600 text-white',
                      'bg-emerald-600 text-white',
                    ];
                    return (
                      <div key={stage.stage} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {stage.stage}
                          </span>
                          <span className="font-bold text-slate-900">
                            {stage.count} ({stage.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${colors[idx % colors.length]}`}
                            style={{ width: `${Math.max(5, stage.percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
                    <div>
                      <span className="block text-slate-400">App &rarr; Shortlist</span>
                      <strong className="text-slate-800">
                        {dimensions.placementPipeline.conversionRates.appToShortlist}%
                      </strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">Shortlist &rarr; Interview</span>
                      <strong className="text-slate-800">
                        {dimensions.placementPipeline.conversionRates.shortlistToInterview}%
                      </strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">Interview &rarr; Offer</span>
                      <strong className="text-slate-800">
                        {dimensions.placementPipeline.conversionRates.interviewToSelected}%
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No application activity recorded.</p>
              )}
            </div>
          </div>

          {/* Row 3: Internship Applications & Internship Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 4. Internship Applications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  Internship Applications Activity
                </h2>
                <Badge variant="amber" size="sm">
                  {dimensions.internshipApplications?.totalApplications || 0} Total
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Application distribution across recruiting pipeline stages for internship roles.
              </p>

              {dimensions.internshipApplications?.statusBreakdown ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">APPLIED</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">
                      {dimensions.internshipApplications.statusBreakdown.APPLIED}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-700 block">SHORTLIST</span>
                    <span className="text-lg font-black text-blue-900 mt-1 block">
                      {dimensions.internshipApplications.statusBreakdown.SHORTLISTED}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-700 block">INTERVIEW</span>
                    <span className="text-lg font-black text-purple-900 mt-1 block">
                      {dimensions.internshipApplications.statusBreakdown.INTERVIEW}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 block">SELECTED</span>
                    <span className="text-lg font-black text-emerald-900 mt-1 block">
                      {dimensions.internshipApplications.statusBreakdown.SELECTED}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-700 block">REJECTED</span>
                    <span className="text-lg font-black text-rose-900 mt-1 block">
                      {dimensions.internshipApplications.statusBreakdown.REJECTED}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* 5. Internship Selection */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Internship Selection & Placements
                </h2>
                <Badge variant="success" size="sm">
                  {dimensions.internshipSelection?.selectionRate || 0}% Selection Rate
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Successful candidate placements and leading corporate internship hosts.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-semibold block">Total Offers Accepted</span>
                  <span className="text-2xl font-black text-emerald-900 mt-1 block">
                    {dimensions.internshipSelection?.selectedCount || 0}
                  </span>
                  <span className="text-[11px] text-emerald-600 mt-1 block">
                    Out of {dimensions.internshipApplications?.totalApplications || 0} applications
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold block">Top Hiring Corporate</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block truncate">
                    {dimensions.internshipSelection?.topHiringCompanies?.[0]?.company || 'Active Recruiters'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {dimensions.internshipSelection?.topHiringCompanies?.[0]?.count || 0} placements
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Learning Participation & Industry Collaboration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7. Learning Participation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  Learning Programs Participation
                </h2>
                <Badge variant="info" size="sm">
                  {dimensions.learningParticipation?.totalEnrollments || 0} Enrollments
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Student upskilling across training, certifications, bootcamps, and workshops.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-2">
                {dimensions.learningParticipation?.byType?.map((lp: any) => (
                  <div key={lp.type} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block truncate">{lp.type}</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">{lp.count}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Completed Programs: <strong>{dimensions.learningParticipation?.byStatus?.COMPLETED || 0}</strong></span>
                <span>Completion Rate: <strong>{dimensions.learningParticipation?.completionRate || 0}%</strong></span>
              </div>
            </div>

            {/* 8. Industry Collaboration */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  Industry & Faculty Collaboration
                </h2>
                <Badge variant="purple" size="sm">
                  {dimensions.industryCollaboration?.totalCollaborations || 0} Active Programs
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Cross-institutional academician engagements across 9 collaboration modules.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center pt-2">
                {dimensions.industryCollaboration?.byType?.slice(0, 8).map((c: any) => (
                  <div key={c.type} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 block truncate" title={c.type}>
                      {c.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">{c.count}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Total Applications: <strong>{dimensions.industryCollaboration?.totalApplications || 0}</strong></span>
                <span>Accepted Sabbaticals: <strong>{dimensions.industryCollaboration?.acceptedEngagements || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Row 5: Dimension 9 - Department-Wise Readiness */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  Department-Wise Readiness Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actionable intelligence comparing academic departments on assessments, competency index, and placement readiness.
                </p>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Index: 40% Score + 30% Assessment Rate + 30% Placements
              </span>
            </div>

            {dimensions.departmentReadiness && dimensions.departmentReadiness.length > 0 ? (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                      <th className="pb-3 pr-4">Department</th>
                      <th className="pb-3 px-3 text-center">Students</th>
                      <th className="pb-3 px-3 text-center">Assessed %</th>
                      <th className="pb-3 px-3 text-center">Avg Score</th>
                      <th className="pb-3 px-3 text-center">Skills/Student</th>
                      <th className="pb-3 px-3 text-center">Selections</th>
                      <th className="pb-3 pl-4 text-right">Readiness Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dimensions.departmentReadiness.map((d: any) => {
                      const badgeVariant =
                        d.readinessIndex >= 75
                          ? 'success'
                          : d.readinessIndex >= 50
                          ? 'amber'
                          : 'danger';

                      return (
                        <tr key={d.department} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 pr-4 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {d.department}
                          </td>
                          <td className="py-3.5 px-3 text-center font-medium text-slate-600">
                            {d.studentCount}
                          </td>
                          <td className="py-3.5 px-3 text-center font-medium text-slate-600">
                            {d.assessmentRate}%
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-slate-800">
                            {d.avgScore}%
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-600">
                            {d.avgSkillsPerStudent}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-emerald-700">
                            {d.selectedCount} ({d.selectionRate}%)
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full rounded-full ${
                                    d.readinessIndex >= 75
                                      ? 'bg-emerald-500'
                                      : d.readinessIndex >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${d.readinessIndex}%` }}
                                />
                              </div>
                              <Badge variant={badgeVariant} size="sm">
                                {d.readinessIndex} / 100
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No departmental records found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
