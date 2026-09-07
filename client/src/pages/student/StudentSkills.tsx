import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StudentSkillProfile } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
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
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Briefcase,
} from 'lucide-react';

interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  reason?: string;
  gapType?: string;
  severity?: string;
  currentLevel?: string;
  targetLevel?: string;
  opportunityCount?: number;
}

interface RecommendedCourse {
  course: any;
  matchPercentage: number;
  reason: string;
  addressedGaps: string[];
}

export const StudentSkills: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [form, setForm] = useState({
    skillName: '',
    categoryName: '',
    proficiencyLevel: 'INTERMEDIATE',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkillsData = () => {
    setLoading(true);
    Promise.all([
      api.get('/student/skills'),
      api.get('/student/dashboard'),
      api.get('/skills/categories').catch(() => ({ data: [] })),
    ])
      .then(([skillsRes, dashRes, catsRes]) => {
        setSkills(skillsRes.data || []);
        setDashboardData(dashRes.data || null);
        setCategories(catsRes.data || []);
      })
      .catch((err) => console.error('Failed to load skills data', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setForm({
      skillName: '',
      categoryName: 'General Skills',
      proficiencyLevel: 'INTERMEDIATE',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: any) => {
    setEditingSkill(skill);
    setForm({
      skillName: skill.skill?.name || skill.name,
      categoryName: skill.skill?.category?.name || skill.category || 'General Skills',
      proficiencyLevel: skill.proficiencyLevel || 'INTERMEDIATE',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skillName.trim()) {
      setError('Skill name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingSkill) {
        await api.put(`/student/skills/${editingSkill.id}`, {
          proficiencyLevel: form.proficiencyLevel,
        });
      } else {
        await api.post('/student/skills', {
          skillName: form.skillName.trim(),
          categoryName: form.categoryName.trim(),
          proficiencyLevel: form.proficiencyLevel,
        });
      }
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

  const getProficiencyBadgeColor = (level: string) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ADVANCED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'BEGINNER':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 mb-2">
            <Award className="w-3.5 h-3.5" />
            Skill Matrix & Competencies
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Skills & Competencies</h1>
          <p className="text-sm text-slate-600 mt-1">
            Explicitly declare your skills and proficiency levels. The system uses these to calculate eligibility and personalize your courses and opportunities.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Main Skills Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-600" />
                Declared Skills ({skills.length})
              </h2>
              <span className="text-xs text-slate-500">
                {skills.length === 0 ? 'No skills added yet' : 'Click edit to update proficiency level'}
              </span>
            </div>

            {skills.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No skills added yet."
                description="Add the programming languages, medical assays, frameworks, or tools you know to unlock personalized opportunity recommendations and eligibility checks."
                actionText="Add Your First Skill"
                onAction={handleOpenAdd}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((item) => {
                  const skillName = item.skill?.name || item.name;
                  const categoryName = item.skill?.category?.name || item.category || 'General';
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-slate-900 text-base">{skillName}</h3>
                            <span className="text-xs text-slate-500 font-medium">{categoryName}</span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getProficiencyBadgeColor(
                              item.proficiencyLevel
                            )}`}
                          >
                            {item.proficiencyLevel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60">
                        <span className="text-[11px] text-slate-500">
                          {item.verificationStatus === 'VERIFIED' ? (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-slate-500">Self-Declared</span>
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-white rounded-lg transition-colors"
                            title="Edit Proficiency"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                            title="Remove Skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Skill Gap Analysis Section */}
          {dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Strong Skills */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Strong Skills ({dashboardData.skillAnalysis?.strongSkills?.length || 0})
                </h3>
                {dashboardData.skillAnalysis?.strongSkills?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No advanced skills declared yet. Add skills with Advanced/Expert proficiency.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboardData.skillAnalysis.strongSkills.map((s: any) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between"
                      >
                        <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                        <span className="text-xs font-semibold text-emerald-700">{s.proficiencyLevel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Needs Improvement */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-amber-700">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Needs Improvement ({dashboardData.skillAnalysis?.skillsToImprove?.length || 0})
                </h3>
                {dashboardData.skillAnalysis?.skillsToImprove?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    All declared skills meet or exceed intermediate benchmark.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboardData.skillAnalysis.skillsToImprove.map((s: any) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between"
                      >
                        <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                        <span className="text-xs font-semibold text-amber-700">{s.proficiencyLevel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills / Gaps */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Missing Skills ({dashboardData.skillAnalysis?.skillGaps?.length || 0})
                </h3>
                {dashboardData.skillAnalysis?.skillGaps?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No missing skills detected based on active opportunities.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {dashboardData.skillAnalysis.skillGaps.map((skillName: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium"
                      >
                        {skillName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills You Should Learn Next */}
          {dashboardData?.recommendedSkills && dashboardData.recommendedSkills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    Skills You Should Learn Next
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prioritized based on active industry demand and your career interests.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.recommendedSkills.map((rec: SkillGapItem, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{rec.skillName}</h4>
                          <span className="text-xs text-slate-500">{rec.category}</span>
                        </div>
                        {rec.opportunityCount !== undefined && rec.opportunityCount > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {rec.opportunityCount} jobs/internships
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{rec.reason}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                      <span className="text-slate-500">
                        Current: <strong className="text-slate-700">{rec.currentLevel || 'Not added'}</strong>
                      </span>
                      <span className="text-slate-500">
                        Target: <strong className="text-brand-600">{rec.targetLevel || 'Intermediate'}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? 'Edit Skill Proficiency' : 'Add Skill to Profile'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skill Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={Boolean(editingSkill)}
              placeholder="e.g. React, JavaScript, SQL, Pharmacognosy, HPTLC"
              value={form.skillName}
              onChange={(e) => setForm({ ...form, skillName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          {!editingSkill && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Development, Databases, Quality Control"
                value={form.categoryName}
                onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proficiency Level <span className="text-red-500">*</span>
            </label>
            <select
              value={form.proficiencyLevel}
              onChange={(e) => setForm({ ...form, proficiencyLevel: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              <option value="BEGINNER">BEGINNER - Basic awareness, introductory knowledge</option>
              <option value="INTERMEDIATE">INTERMEDIATE - Practical working experience</option>
              <option value="ADVANCED">ADVANCED - High proficiency, complex problem solving</option>
              <option value="EXPERT">EXPERT - Authority level, architecture & mastery</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : editingSkill ? 'Update Proficiency' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
