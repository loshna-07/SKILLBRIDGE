import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
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
  BookOpen,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Layers,
  Zap,
  CheckSquare,
  Edit3,
  Flame,
  Check,
  RotateCcw,
  History,
  Clock,
  Compass,
  Briefcase,
} from 'lucide-react';

export const StudentSkillMapping: React.FC = () => {
  const navigate = useNavigate();

  // Primary State
  const [granularData, setGranularData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any>(null);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [careerRoles, setCareerRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [targetType, setTargetType] = useState<'ROLE' | 'OPPORTUNITY'>('ROLE');
  const [loading, setLoading] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'ROADMAP' | 'TAXONOMY' | 'READINESS' | 'GROWTH'>('ROADMAP');

  // Expanded Skills in Taxonomy Tree
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});

  // Career Target Switcher Modal
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [savingCareer, setSavingCareer] = useState(false);

  // Roadmap History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [roadmapHistory, setRoadmapHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Quick Reassessment / Practice Modal
  const [reassessModalOpen, setReassessModalOpen] = useState(false);
  const [selectedSubSkillForReassess, setSelectedSubSkillForReassess] = useState<any | null>(null);
  const [reassessScoreInput, setReassessScoreInput] = useState<number>(85);
  const [reassessing, setReassessing] = useState(false);
  const [reassessFeedback, setReassessFeedback] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Granular Skills, Career Roles, Roadmap, Growth, Opportunities
      const [skillsRes, rolesRes, roadmapRes, growthRes, oppsRes] = await Promise.all([
        api.get('/student/granular-skills'),
        api.get('/student/career-roles').catch(() => ({ data: [] })),
        api.get('/student/roadmap').catch(() => ({ data: null })),
        api.get('/student/skill-growth').catch(() => ({ data: { skills: [] } })),
        api.get('/opportunities').catch(() => ({ data: [] })),
      ]);

      const prof = skillsRes.data;
      setGranularData(prof);
      setGrowthData(growthRes.data);

      const roles = Array.isArray(rolesRes.data) ? rolesRes.data : [];
      setCareerRoles(roles);

      const allOpps = Array.isArray(oppsRes.data) ? oppsRes.data : oppsRes.data?.data || [];
      setOpportunities(allOpps);

      const activeRoadmap = roadmapRes.data;
      setRoadmapData(activeRoadmap);

      if (activeRoadmap?.targetRole?.id) {
        setSelectedRoleId(activeRoadmap.targetRole.id);
        setTargetType('ROLE');
      } else if (roles.length > 0) {
        setSelectedRoleId(roles[0].id);
      }

      // Pick first opp if any
      if (allOpps.length > 0) {
        setSelectedOpportunityId(allOpps[0].id);
      }

      // Auto-expand skills that have critical gaps or strong scores
      if (prof?.highLevelSkills) {
        const initialExpanded: Record<string, boolean> = {};
        prof.highLevelSkills.forEach((s: any, idx: number) => {
          initialExpanded[s.skillId] = idx < 2 || s.subSkills?.some((sub: any) => sub.scorePercentage < 60);
        });
        setExpandedSkills(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to load granular skill data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Dynamic Career Role Switch
  const handleRoleChange = async (roleId: string) => {
    setSelectedRoleId(roleId);
    setTargetType('ROLE');
    try {
      const res = await api.post('/student/career-target', { careerRoleId: roleId });
      setRoadmapData(res.data.roadmap);
      if (granularData) {
        setGranularData({
          ...granularData,
          targetCareer: res.data.targetRole?.name || granularData.targetCareer,
        });
      }
    } catch (err) {
      console.error('Failed to switch target career role', err);
    }
  };

  // Handle Dynamic Opportunity Switch
  const handleOpportunityChange = async (oppId: string) => {
    setSelectedOpportunityId(oppId);
    setTargetType('OPPORTUNITY');
    try {
      const [roadmapRes, readinessRes] = await Promise.all([
        api.post('/student/roadmap/generate', { opportunityId: oppId }),
        api.get(`/student/industry-readiness/${oppId}`).catch(() => ({ data: null })),
      ]);
      setRoadmapData(roadmapRes.data);
      setReadinessData(readinessRes.data);
    } catch (err) {
      console.error('Failed to update opportunity diagnostics', err);
    }
  };

  // Open Roadmap History Modal
  const handleOpenHistory = async () => {
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await api.get('/student/roadmap/history');
      setRoadmapHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch roadmap history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenReassessment = (subSkill: any) => {
    setSelectedSubSkillForReassess(subSkill);
    setReassessScoreInput(Math.min(100, (subSkill.currentScore ?? subSkill.scorePercentage ?? 50) + 15));
    setReassessFeedback(null);
    setReassessModalOpen(true);
  };

  const handleExecuteReassessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubSkillForReassess) return;
    setReassessing(true);
    try {
      const res = await api.post('/student/reassess-skill', {
        subSkillId: selectedSubSkillForReassess.subSkillId || selectedSubSkillForReassess.id,
        scorePercentage: Number(reassessScoreInput),
      });

      const delta = res.data.growthDelta ?? 0;
      const deltaText = delta >= 0 ? `+${delta}%` : `${delta}%`;
      setReassessFeedback(`✓ Reassessment recorded! New score: ${res.data.newScore}% (${deltaText} delta). Roadmap updated dynamically!`);

      if (res.data.updatedRoadmap) {
        setRoadmapData(res.data.updatedRoadmap);
      }

      setTimeout(() => {
        setReassessModalOpen(false);
        fetchAllData();
      }, 1400);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record reassessment');
    } finally {
      setReassessing(false);
    }
  };

  const toggleSkillExpand = (skillId: string) => {
    setExpandedSkills((prev) => ({ ...prev, [skillId]: !prev[skillId] }));
  };

  const getProficiencyBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'EXPERT':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">EXPERT</span>;
      case 'ADVANCED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">ADVANCED</span>;
      case 'INTERMEDIATE':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">INTERMEDIATE</span>;
      case 'DEVELOPING':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">DEVELOPING</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50">BEGINNER</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Computing Dynamic AI Career Roadmap & Role Readiness...</p>
      </div>
    );
  }

  if (!granularData) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Skill Intelligence Unavailable"
        description="Could not load your granular skill intelligence profile. Please try refreshing or ensure your student account is active."
      />
    );
  }

  const currentReadiness = roadmapData?.currentReadiness ?? 0;
  const targetReadiness = roadmapData?.targetReadiness ?? 80;
  const readinessGap = Math.max(0, targetReadiness - currentReadiness);
  const nextSkill = roadmapData?.nextActionableSkill;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner & Target Role Controls */}
      <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700/50">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Dynamic AI Career Roadmap Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Career Role Roadmap & Readiness Diagnostic
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Personalized learning pathway dynamically calculated against industry role benchmarks. Target role changes or reassessment results automatically adjust prioritization, prerequisites, and readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleOpenHistory}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Roadmap History (v{roadmapData?.version || 1})</span>
          </button>
          <button
            onClick={() => navigate('/student/assessments')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-900/30"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Take Granular Assessment</span>
          </button>
        </div>
      </div>

      {/* 2. Target Role Selector Bar with Quick-Select Chips */}
      <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700/40 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Target Career Pathway
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {roadmapData?.targetRole?.name || roadmapData?.targetTitle || granularData.targetCareer}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Role:</label>
              <select
                value={selectedRoleId}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-bold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {careerRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.domain})
                  </option>
                ))}
              </select>
            </div>

            {opportunities.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Or Target Opp:</label>
                <select
                  value={selectedOpportunityId}
                  onChange={(e) => handleOpportunityChange(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">Select Opportunity...</option>
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} ({opp.industry?.companyName || 'Industry'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Quick-Select Role Chips */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Quick Select:
          </span>
          {careerRoles.map((role) => {
            const isSelected = selectedRoleId === role.id && targetType === 'ROLE';
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleChange(role.id)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {role.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Role Readiness Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role Readiness % */}
        <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Role Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-extrabold ${currentReadiness >= targetReadiness ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'}`}>
                {currentReadiness}%
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ {targetReadiness}% Target</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {currentReadiness >= targetReadiness ? '✓ Industry Benchmark Met' : `${readinessGap}% gap remaining`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700/40 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Mandatory Requirements Met */}
        <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Mandatory Skills Met
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {roadmapData?.mandatoryMet ?? 0} / {roadmapData?.mandatoryTotal ?? 0}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Core role requirements
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pathway Phases */}
        <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Pathway Milestones
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{roadmapData?.totalPhases || 0}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{roadmapData?.completedPhases || 0} Achieved</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Sequenced by prerequisites</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Readiness Qualification Status */}
        <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Qualification Status
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-extrabold ${roadmapData?.isReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {roadmapData?.isReady ? 'QUALIFIED' : 'GAPS TO CLOSE'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {roadmapData?.isReady ? 'Ready for placement' : 'Active roadmap in progress'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
            roadmapData?.isReady
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/40 text-amber-600 dark:text-amber-400'
          }`}>
            {roadmapData?.isReady ? <Award className="w-6 h-6" /> : <Flame className="w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* 4. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ROADMAP')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ROADMAP'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Dynamic AI Roadmap ({roadmapData?.totalPhases || 0} Phases)</span>
        </button>

        <button
          onClick={() => setActiveTab('READINESS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'READINESS'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Industry Diagnostic Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('TAXONOMY')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TAXONOMY'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Granular Skill Taxonomy Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('GROWTH')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'GROWTH'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Skill Growth & History ({growthData?.skills?.length || 0})</span>
        </button>
      </div>

      {/* 5. TAB 1: DYNAMIC AI LEARNING ROADMAP */}
      {activeTab === 'ROADMAP' && (
        <div className="space-y-6">
          {/* "YOUR NEXT BEST SKILL" AI RECOMMENDATION CARD */}
          {nextSkill && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600/10 via-brand-500/5 to-transparent dark:from-brand-950/40 dark:via-[#121824] dark:to-[#121824] border-2 border-brand-500/40 dark:border-brand-500/30 shadow-md relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-600 text-white shadow-xs flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      YOUR NEXT BEST SKILL
                    </span>
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                      Phase {nextSkill.phaseNumber} of {roadmapData?.totalPhases}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {nextSkill.subSkillName}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Category: <strong className="text-slate-800 dark:text-slate-200">{nextSkill.skillName}</strong> • Target Benchmark: <strong className="text-brand-600 dark:text-brand-400">{nextSkill.targetScore}%</strong> (Current: {nextSkill.currentScore}%)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                    <strong className="text-brand-700 dark:text-brand-300">AI Sequencing Rationale:</strong> {nextSkill.aiRationale}
                  </p>

                  {/* Topics Pills */}
                  {nextSkill.topicsToMaster && nextSkill.topicsToMaster.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {nextSkill.topicsToMaster.map((t: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md text-[11px] bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                  <button
                    onClick={() => handleOpenReassessment(nextSkill)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-900/30 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Practice / Take Reassessment</span>
                  </button>
                  {nextSkill.recommendedCourse && (
                    <button
                      onClick={() => navigate('/student/learning')}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <span>View Matched Course</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sequential Phases List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Sequenced Skill Pathway ({roadmapData?.phases?.length || 0} Sequential Milestones)
            </h3>

            {roadmapData?.phases?.map((phase: any) => {
              const isAchieved = phase.status === 'TARGET_ACHIEVED';
              const isCurrent = phase.status === 'CURRENT_PHASE';
              const isMandatory = phase.isMandatory;

              return (
                <div
                  key={phase.phaseNumber}
                  className={`p-6 rounded-2xl border transition-all ${
                    isAchieved
                      ? 'bg-emerald-50/50 dark:bg-[#121824]/70 border-emerald-200 dark:border-emerald-800/50'
                      : isCurrent
                      ? 'bg-white dark:bg-[#121824] border-brand-500 dark:border-brand-600/80 ring-2 ring-brand-500/20 shadow-md'
                      : 'bg-white dark:bg-[#121824]/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Phase Info & Progress */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                          Phase {phase.phaseNumber}
                        </span>
                        {isAchieved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                            <Check className="w-3 h-3" />
                            TARGET ACHIEVED
                          </span>
                        ) : isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700/50 animate-pulse">
                            <Flame className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                            CURRENT MILESTONE
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            UPCOMING
                          </span>
                        )}

                        {isMandatory && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50">
                            Mandatory Prerequisite
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {phase.skillName}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {phase.phaseTitle}
                      </h3>

                      {/* Score Gauge / Progress Bar */}
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-400">Current Proficiency: <strong className="text-slate-900 dark:text-white">{phase.currentScore}%</strong></span>
                          <span className="text-brand-600 dark:text-brand-400">Target Benchmark: <strong className="text-brand-700 dark:text-brand-300">{phase.targetScore}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              isAchieved
                                ? 'bg-emerald-500'
                                : isCurrent
                                ? 'bg-brand-500'
                                : 'bg-slate-400 dark:bg-slate-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.round((phase.currentScore / phase.targetScore) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Explainable AI Rationale */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Why this skill?</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{phase.aiRationale}</p>
                      </div>

                      {/* Suggested Project */}
                      {phase.suggestedProject && (
                        <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2">
                          <Briefcase className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Recommended Project: </span>
                            <span className="text-slate-600 dark:text-slate-400">{phase.suggestedProject}</span>
                          </div>
                        </div>
                      )}

                      {/* Topics to Master Checklist */}
                      {phase.topicsToMaster && phase.topicsToMaster.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                            Key Topics to Master:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {phase.topicsToMaster.map((topic: string, tIdx: number) => (
                              <span
                                key={tIdx}
                                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1"
                              >
                                <CheckSquare className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Matched Learning Hub Course Recommendation */}
                    {phase.recommendedCourse && (
                      <div className="lg:w-80 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shrink-0">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Recommended Learning
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{phase.recommendedCourse.duration}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {phase.recommendedCourse.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            By {phase.recommendedCourse.providerName}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <button
                            onClick={() => navigate(`/student/learning`)}
                            className="w-full py-2 px-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <span>Enroll in Course</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenReassessment(phase)}
                            className="w-full py-1.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center justify-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                            <span>Practice / Reassess Skill</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INDUSTRY READINESS MATRIX */}
      {activeTab === 'READINESS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                  Role Benchmark Diagnostics
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {roadmapData?.targetRole?.name || roadmapData?.targetTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Target Domain: <strong className="text-slate-800 dark:text-slate-200">{roadmapData?.targetRole?.domain || 'Multi-Disciplinary'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                    {currentReadiness}%
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Role Readiness Index
                  </span>
                </div>

                <div className="text-center">
                  <div className={`text-lg font-bold ${roadmapData?.isReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {roadmapData?.isReady ? 'QUALIFIED' : 'GAPS IDENTIFIED'}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Readiness Status
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Text */}
            {roadmapData?.summaryText && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  AI Readiness Assessment Summary
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {roadmapData.summaryText}
                </p>
              </div>
            )}

            {/* Competency Matrix */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Role Competency Thresholds
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roadmapData?.phases?.map((item: any) => {
                  const isMet = item.currentScore >= item.targetScore;
                  return (
                    <div
                      key={item.subSkillId}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
                        isMet
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{item.subSkillName}</span>
                            {item.isMandatory ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50">
                                Mandatory
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                                Preferred
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.skillName}</span>
                        </div>

                        {isMet ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                            <Check className="w-3.5 h-3.5" />
                            MET
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50">
                            <AlertCircle className="w-3.5 h-3.5" />
                            GAP ({item.gap}%)
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-400">Current Score: <strong className="text-slate-900 dark:text-white">{item.currentScore}%</strong></span>
                          <span className="text-slate-600 dark:text-slate-400">Benchmark: <strong className="text-slate-800 dark:text-slate-200">{item.targetScore}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isMet ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, Math.round((item.currentScore / item.targetScore) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GRANULAR SKILL TAXONOMY TREE */}
      {activeTab === 'TAXONOMY' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Hierarchical Granular Competency Tree
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Domain &rarr; Skill &rarr; Sub-Skill &rarr; Topics decomposition with measurable proficiency tiers
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allExp: Record<string, boolean> = {};
                    granularData.highLevelSkills?.forEach((s: any) => (allExp[s.skillId] = true));
                    setExpandedSkills(allExp);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-200 dark:border-slate-700"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setExpandedSkills({})}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-200 dark:border-slate-700"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Skills Accordion List */}
            <div className="space-y-4">
              {granularData.highLevelSkills?.map((skill: any) => {
                const isExpanded = expandedSkills[skill.skillId];
                return (
                  <div
                    key={skill.skillId}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden transition-all shadow-xs"
                  >
                    {/* Skill Accordion Header */}
                    <button
                      onClick={() => toggleSkillExpand(skill.skillId)}
                      className="w-full p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{skill.skillName}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                              {skill.categoryName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {skill.subSkills?.length || 0} Measurable Sub-Skills
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{skill.averageScore}%</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{skill.proficiencyLevel}</span>
                        </div>
                        {getProficiencyBadge(skill.proficiencyLevel)}
                      </div>
                    </button>

                    {/* Sub-Skills Expanded Grid */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {skill.subSkills?.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="p-4 rounded-xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sub.subSkillName}</h4>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {sub.questionsCorrect}/{sub.questionsAttempted} Questions Correct
                                </span>
                              </div>
                              {getProficiencyBadge(sub.proficiencyLevel)}
                            </div>

                            {/* Score Progress */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-500 dark:text-slate-400">Score</span>
                                <span className={sub.scorePercentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : sub.scorePercentage >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                                  {sub.scorePercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    sub.scorePercentage >= 75
                                      ? 'bg-emerald-500'
                                      : sub.scorePercentage >= 60
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${sub.scorePercentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Topics List */}
                            {sub.topics && sub.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {sub.topics.map((t: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={() => handleOpenReassessment(sub)}
                              className="mt-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-700/40 transition-all flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reassess / Practice</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SKILL GROWTH & SNAPSHOTS */}
      {activeTab === 'GROWTH' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Historical Skill Growth & Delta Snapshots
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track longitudinal mastery progress, reassessment score increases, and target achievement milestones
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Average Growth: +{growthData?.overallAverageGrowth || 0}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {growthData?.skills?.map((item: any) => {
                const hasGrowth = item.improvementDelta > 0;
                return (
                  <div
                    key={item.subSkillId}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{item.skillName}</span>
                        {item.targetAchieved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                            ✓ ACHIEVED
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.subSkillName}</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Initial</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.initialScore}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Current</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.currentScore}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Delta</span>
                        <span className={`text-sm font-extrabold ${hasGrowth ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {hasGrowth ? `+${item.improvementDelta}%` : `${item.improvementDelta}%`}
                        </span>
                      </div>
                    </div>

                    {item.history && item.history.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Milestone Snapshots:
                        </span>
                        <div className="space-y-1">
                          {item.history.map((h: any, hIdx: number) => (
                            <div key={hIdx} className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{new Date(h.recordedAt || h.date).toLocaleDateString()}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{h.scorePercentage}% ({h.proficiencyLevel})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Roadmap History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Roadmap Version History & Journey"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Every career target change and reassessment creates a versioned checkpoint to document your competency growth.
          </p>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : roadmapHistory.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
              No historical roadmap checkpoints recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {roadmapHistory.map((ver: any) => (
                <div
                  key={ver.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Version {ver.version}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ver.status === 'ACTIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {ver.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{ver.targetTitle}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">{ver.currentReadiness}%</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Readiness</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{ver.summaryText}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Recorded {new Date(ver.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setHistoryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* 7. Quick Reassessment / Practice Modal */}
      <Modal
        isOpen={reassessModalOpen}
        onClose={() => setReassessModalOpen(false)}
        title={`Adaptive Reassessment: ${selectedSubSkillForReassess?.subSkillName || ''}`}
      >
        <form onSubmit={handleExecuteReassessment} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Simulate or submit a skill practice session / reassessment quiz. Achieving a score ≥ target benchmark unlocks Target Achieved status and dynamically advances the roadmap!
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assessed Score Percentage (0 – 100%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={reassessScoreInput}
              onChange={(e) => setReassessScoreInput(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-bold"
              required
            />
          </div>

          {reassessFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
              {reassessFeedback}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setReassessModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reassessing}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl disabled:opacity-50"
            >
              {reassessing ? 'Evaluating...' : 'Submit Reassessment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentSkillMapping;
