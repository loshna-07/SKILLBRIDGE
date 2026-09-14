import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Award,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Zap,
  CheckSquare,
  RotateCcw,
  Layers,
  Search,
  ShieldCheck,
  Clock,
  Eye,
  FileCheck2,
} from 'lucide-react';

export const StudentSkills: React.FC = () => {
  const navigate = useNavigate();
  const [granularProfile, setGranularProfile] = useState<any>(null);
  const [evidenceProfile, setEvidenceProfile] = useState<any[]>([]);
  const [evidenceTimeline, setEvidenceTimeline] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('ALL');

  // Modal State for Adding Custom Skill
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    skillName: '',
    categoryName: 'General Skills',
    proficiencyLevel: 'INTERMEDIATE',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Quick Reassessment
  const [reassessModalOpen, setReassessModalOpen] = useState(false);
  const [selectedSubSkill, setSelectedSubSkill] = useState<any | null>(null);
  const [reassessScore, setReassessScore] = useState<number>(85);
  const [reassessing, setReassessing] = useState(false);
  const [reassessSuccess, setReassessSuccess] = useState<string | null>(null);

  // Evidence Detail Modal
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedSkillEvidence, setSelectedSkillEvidence] = useState<any | null>(null);

  const fetchSkillsData = () => {
    setLoading(true);
    Promise.all([
      api.get('/student/granular-skills'),
      api.get('/student/evidence-profile').catch(() => ({ data: [] })),
      api.get('/student/evidence-timeline').catch(() => ({ data: [] })),
      api.get('/student/skills').catch(() => ({ data: [] })),
      api.get('/skills/categories').catch(() => ({ data: [] })),
    ])
      .then(([granularRes, evProfRes, evTimeRes, skillsRes, catsRes]) => {
        setGranularProfile(granularRes.data || null);
        setEvidenceProfile(Array.isArray(evProfRes.data) ? evProfRes.data : []);
        setEvidenceTimeline(Array.isArray(evTimeRes.data) ? evTimeRes.data : []);
        setSkills(skillsRes.data || []);
        setCategories(catsRes.data || []);
      })
      .catch((err) => console.error('Failed to load skills data', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      skillName: '',
      categoryName: categories[0]?.name || 'General Skills',
      proficiencyLevel: 'INTERMEDIATE',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skillName.trim()) {
      setError('Skill name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.post('/student/skills', {
        skillName: form.skillName.trim(),
        categoryName: form.categoryName.trim(),
        proficiencyLevel: form.proficiencyLevel,
      });
      setIsModalOpen(false);
      fetchSkillsData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await api.delete(`/student/skills/${id}`);
      fetchSkillsData();
    } catch (err) {
      console.error('Failed to delete skill', err);
    }
  };

  const handleOpenReassess = (subSkill: any) => {
    setSelectedSubSkill(subSkill);
    setReassessScore(Math.min(100, (subSkill.scorePercentage || 50) + 15));
    setReassessSuccess(null);
    setReassessModalOpen(true);
  };

  const handleExecuteReassess = async () => {
    if (!selectedSubSkill) return;
    setReassessing(true);
    try {
      const res = await api.post('/student/reassess-skill', {
        subSkillId: selectedSubSkill.id,
        scorePercentage: reassessScore,
      });
      setReassessSuccess(
        `Reassessment complete! New score: ${reassessScore}%. Growth registered: +${res.data.growthPercentage || 15}%`
      );
      setTimeout(() => {
        setReassessModalOpen(false);
        fetchSkillsData();
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reassess skill.');
    } finally {
      setReassessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Filter skills based on search & verification tier
  const filteredEvidence = evidenceProfile.filter((s) => {
    const matchSearch =
      s.skillName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    if (filterTier === 'ALL') return true;
    if (filterTier === 'HIGH') return s.evidenceStrength === 'HIGH';
    if (filterTier === 'MEDIUM') return s.evidenceStrength === 'MEDIUM';
    if (filterTier === 'LOW') return s.evidenceStrength === 'LOW';
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur border border-white/20 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Evidence-Based Verification Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Evidence-Based Skills Profile</h1>
            <p className="text-xs sm:text-sm text-brand-100 mt-1 max-w-2xl">
              Every skill evaluated with 5 tiers of evidence: Self-declared &bull; Evidence provided &bull; Credential verified &bull; Skill assessed &bull; Industry validated.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Declare Skill
            </button>
            <button
              onClick={() => navigate('/student/skill-mapping')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500/40 hover:bg-brand-500/60 text-white rounded-xl text-xs font-bold backdrop-blur border border-white/20 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              View Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* 2. Evidence Levels Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Level 1</span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Self-Declared</p>
          <span className="text-[10px] text-slate-400">Claimed by Student</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500">Level 2</span>
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">Evidence Provided</p>
          <span className="text-[10px] text-slate-400">Certificate Uploaded</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">Level 3</span>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Credential Verified</p>
          <span className="text-[10px] text-slate-400">Institution Verified</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-500">Level 4</span>
          <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-0.5">Skill Assessed</p>
          <span className="text-[10px] text-slate-400">SkillBridge Tested</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500">Level 5</span>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">Industry Validated</p>
          <span className="text-[10px] text-slate-400">Enterprise Verified</span>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified skills or competencies..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTier === t
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {t === 'ALL' ? 'All Skills' : `${t} Confidence`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Skills Evidence Cards Grid */}
      {filteredEvidence.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No skills found"
          description="Declare new skills or upload verified certificates to establish your skill evidence matrix."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvidence.map((s) => {
            const strength = s.evidenceStrength || 'LOW';
            const badgeBg =
              strength === 'HIGH'
                ? 'bg-emerald-500 text-white'
                : strength === 'MEDIUM'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-400 text-white';

            return (
              <div
                key={s.skillId}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.skillName}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${badgeBg}`}>
                        {strength} CONFIDENCE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.categoryName}</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSkillEvidence(s);
                      setEvidenceModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details ({s.evidenceList?.length || 0})
                  </button>
                </div>

                {/* Score Comparison */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Claimed Level</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{s.claimedLevel || 'Advanced'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">SkillBridge Test</span>
                    <p className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                      {s.skillBridgeScore !== null ? `${s.skillBridgeScore}%` : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Industry Validated</span>
                    <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {s.industryScore !== null ? `${s.industryScore}%` : '—'}
                    </p>
                  </div>
                </div>

                {/* Granular Sub-skills */}
                {s.subSkillsEvidence && s.subSkillsEvidence.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Granular Sub-Competencies
                    </span>
                    <div className="space-y-2">
                      {s.subSkillsEvidence.map((sub: any) => (
                        <div key={sub.subSkillId} className="flex items-center justify-between text-xs gap-3">
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate flex-1">
                            {sub.subSkillName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-600 dark:text-brand-400">{sub.score}%</span>
                            <button
                              onClick={() => handleOpenReassess({ id: sub.subSkillId, name: sub.subSkillName, scorePercentage: sub.score })}
                              className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                              title="Reassess competency"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Evidence Timeline */}
      {evidenceTimeline.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            Verification Progression Timeline
          </h2>
          <div className="space-y-3">
            {evidenceTimeline.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.skillName} &bull; {item.evidenceType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {new Date(item.evidenceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {item.sourceName} {item.score ? `(Score: ${item.score}%)` : ''} &bull; Verification Status: {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Declare Skill */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Declare New Skill">
        <form onSubmit={handleCreateSkill} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Name *</label>
            <input
              type="text"
              required
              value={form.skillName}
              onChange={(e) => setForm({ ...form, skillName: e.target.value })}
              placeholder="e.g., Panchakarma Therapy & Hospital SOPs"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Proficiency Level</label>
            <select
              value={form.proficiencyLevel}
              onChange={(e) => setForm({ ...form, proficiencyLevel: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              {saving ? 'Saving...' : 'Declare Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Reassessment */}
      <Modal isOpen={reassessModalOpen} onClose={() => setReassessModalOpen(false)} title="Adaptive Competency Reassessment">
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Record a validated test score or simulated reassessment for <span className="font-bold">{selectedSubSkill?.name}</span>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Assessed Score: {reassessScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={reassessScore}
              onChange={(e) => setReassessScore(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          {reassessSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium">
              {reassessSuccess}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReassessModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteReassess}
              disabled={reassessing}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              {reassessing ? 'Evaluating...' : 'Submit Score & Update Roadmap'}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Evidence Details */}
      <Modal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        title={`Evidence Breakdown: ${selectedSkillEvidence?.skillName || 'Skill'}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Confidence Tier</span>
              <p className="font-extrabold text-sm text-brand-600">{selectedSkillEvidence?.evidenceStrength} CONFIDENCE</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Evidence Records</span>
              <p className="font-bold text-slate-800 dark:text-white">{selectedSkillEvidence?.evidenceList?.length || 0} Records</p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedSkillEvidence?.evidenceList?.map((ev: any, idx: number) => (
              <div
                key={ev.id || idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    {ev.evidenceType.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Status: {ev.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400">Assessor / Source:</span>
                    <p className="font-semibold">{ev.sourceName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <p className="font-semibold">{new Date(ev.evidenceDate).toLocaleDateString()}</p>
                  </div>
                  {ev.score !== null && (
                    <div>
                      <span className="text-slate-400">Score:</span>
                      <p className="font-bold text-emerald-600">{ev.score}%</p>
                    </div>
                  )}
                  {ev.credentialId && (
                    <div>
                      <span className="text-slate-400">Credential ID:</span>
                      <p className="font-mono text-[10px]">{ev.credentialId}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setEvidenceModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
