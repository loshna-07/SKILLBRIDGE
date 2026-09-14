import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { DocumentUploadZone } from '../../components/common/DocumentUploadZone';
import {
  Trophy,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Calendar,
  Search,
  Building2,
  Medal,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  achievementType?: string | null;
  category?: string | null;
  issuer?: string | null;
  level?: string | null;
  position?: string | null;
  relatedSkills?: string | null;
  date?: string | null;
  description?: string | null;
  documentUrl?: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  remarks?: string | null;
  createdAt: string;
}

const ACHIEVEMENT_TYPES = [
  'Academic Award & Gold Medal',
  'Research & Paper Presentation',
  'Hackathon & Innovation Challenge',
  'Case Competition / Symposium',
  'Extracurricular & Sports Excellence',
  'Leadership & Community Impact',
  'Publication in Peer-Reviewed Journal',
  'Patent / Intellectual Property',
];

const LEVELS = ['College / Campus', 'University', 'State / Zonal', 'National', 'International'];

const POSITIONS = [
  '1st Place / Gold Medal / Winner',
  '2nd Place / Silver Medal / Runner-up',
  '3rd Place / Bronze Medal',
  'Finalist / Top 5%',
  'Special Jury Mention / Best Paper',
  'Participant with Distinction',
];

export const StudentAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('');
  const [editingAchiev, setEditingAchiev] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    title: '',
    achievementType: 'Academic Award & Gold Medal',
    category: '',
    issuer: '',
    level: 'National',
    position: '1st Place / Gold Medal / Winner',
    relatedSkills: '',
    date: '',
    description: '',
    documentUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = () => {
    setLoading(true);
    api
      .get('/student/achievements')
      .then((res) => setAchievements(res.data || []))
      .catch((err) => console.error('Failed to load achievements', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleOpenAdd = () => {
    setEditingAchiev(null);
    setForm({
      title: '',
      achievementType: 'Academic Award & Gold Medal',
      category: '',
      issuer: '',
      level: 'National',
      position: '1st Place / Gold Medal / Winner',
      relatedSkills: '',
      date: '',
      description: '',
      documentUrl: '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (achiev: Achievement) => {
    setEditingAchiev(achiev);
    setForm({
      title: achiev.title,
      achievementType: achiev.achievementType || 'Academic Award & Gold Medal',
      category: achiev.category || '',
      issuer: achiev.issuer || '',
      level: achiev.level || 'National',
      position: achiev.position || '1st Place / Gold Medal / Winner',
      relatedSkills: achiev.relatedSkills || '',
      date: achiev.date || '',
      description: achiev.description || '',
      documentUrl: achiev.documentUrl || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Achievement title is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingAchiev) {
        await api.put(`/student/achievements/${editingAchiev.id}`, form);
      } else {
        await api.post('/student/achievements', form);
      }
      setIsModalOpen(false);
      fetchAchievements();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this achievement record?')) return;
    try {
      await api.delete(`/student/achievements/${id}`);
      fetchAchievements();
    } catch (err) {
      console.error('Failed to delete achievement', err);
    }
  };

  const handleOpenPreview = (url: string, title: string) => {
    setPreviewDocUrl(url);
    setPreviewDocTitle(title);
    setIsPreviewModalOpen(true);
  };

  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      const matchesTab = activeTab === 'ALL' || a.verificationStatus === activeTab;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(query) ||
        (a.issuer && a.issuer.toLowerCase().includes(query)) ||
        (a.achievementType && a.achievementType.toLowerCase().includes(query)) ||
        (a.level && a.level.toLowerCase().includes(query)) ||
        (a.relatedSkills && a.relatedSkills.toLowerCase().includes(query));
      return matchesTab && matchesSearch;
    });
  }, [achievements, activeTab, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: achievements.length,
      verified: achievements.filter((a) => a.verificationStatus === 'VERIFIED').length,
      national: achievements.filter((a) => a.level === 'National' || a.level === 'International').length,
      pending: achievements.filter((a) => a.verificationStatus === 'PENDING').length,
      rejected: achievements.filter((a) => a.verificationStatus === 'REJECTED').length,
    };
  }, [achievements]);

  const getStatusBadge = (status: string) => {
    if (status === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ✓ VERIFIED
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          ✕ REJECTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        ⏱ PENDING REVIEW
      </span>
    );
  };

  const getLevelBadgeColor = (level?: string | null) => {
    switch (level) {
      case 'International':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'National':
        return 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800';
      case 'State / Zonal':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Honors & Achievements
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Achievements & Awards</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Showcase your academic honors, hackathon victories, research presentations, and extracurricular recognitions with verified proof documents.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-sm transition-all shrink-0 hover:shadow-brand-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Achievement
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'ALL'
              ? 'bg-brand-50/70 border-brand-300 dark:bg-brand-950/40 dark:border-brand-700'
              : 'bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Achievements</span>
            <Trophy className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{stats.total}</p>
        </div>

        <div
          onClick={() => setActiveTab('VERIFIED')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'VERIFIED'
              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700'
              : 'bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Verified Honors</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.verified}</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">National / International</span>
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1.5">{stats.national}</p>
        </div>

        <div
          onClick={() => setActiveTab('PENDING')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'PENDING'
              ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700'
              : 'bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{stats.pending}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121824] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeTab === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL'
                ? `All Awards (${stats.total})`
                : tab === 'PENDING'
                ? `Pending (${stats.pending})`
                : tab === 'VERIFIED'
                ? `Verified (${stats.verified})`
                : `Rejected (${stats.rejected})`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search achievements, awards, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filteredAchievements.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={searchQuery ? 'No matching achievements found' : 'No achievements recorded yet'}
          description={
            searchQuery
              ? `No achievements match "${searchQuery}".`
              : 'Add your competitions, hackathons, academic medals, and research recognitions.'
          }
          actionText={!searchQuery ? 'Add Achievement' : undefined}
          onAction={!searchQuery ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achiev) => {
            const rawDocUrl = achiev.documentUrl;
            const fullDocUrl = rawDocUrl
              ? rawDocUrl.startsWith('http')
                ? rawDocUrl
                : `http://localhost:5000${rawDocUrl}`
              : null;

            return (
              <div
                key={achiev.id}
                className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {achiev.level && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getLevelBadgeColor(
                                achiev.level
                              )}`}
                            >
                              {achiev.level}
                            </span>
                          )}
                          {achiev.achievementType && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {achiev.achievementType}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                          {achiev.title}
                        </h3>
                        {achiev.issuer && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{achiev.issuer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>{getStatusBadge(achiev.verificationStatus)}</div>
                  </div>

                  {achiev.position && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-lg bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800/60 my-2">
                      <Medal className="w-3.5 h-3.5 text-brand-500" />
                      <span>{achiev.position}</span>
                    </div>
                  )}

                  {achiev.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {achiev.description}
                    </p>
                  )}

                  <div className="space-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-400">
                    {achiev.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Date / Period: <strong>{achiev.date}</strong></span>
                      </div>
                    )}

                    {achiev.relatedSkills && (
                      <div className="pt-2">
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                          Demonstrated Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {achiev.relatedSkills.split(',').map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {achiev.remarks && (
                      <div className={`p-2.5 rounded-lg border text-xs mt-3 ${
                        achiev.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      }`}>
                        <div className="flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div>
                            <strong>Verifier Remarks:</strong> {achiev.remarks}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {fullDocUrl ? (
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(fullDocUrl, achiev.title)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Evidence
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No document attached</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(achiev)}
                      className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Achievement"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(achiev.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Achievement"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAchiev ? 'Edit Achievement Record' : 'Add Achievement / Award Proof'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Achievement / Award Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. National Ayurveda Research Paper Presentation Award"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Achievement Type
              </label>
              <select
                value={form.achievementType}
                onChange={(e) => setForm({ ...form, achievementType: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {ACHIEVEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Level of Competition / Recognition
              </label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issuing / Hosting Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Ministry of AYUSH, Central Council for Research in Ayurvedic Sciences"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Position / Rank Achieved
              </label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date / Year of Award
              </label>
              <input
                type="text"
                placeholder="e.g. November 2025"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Related Skills (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Clinical Research, Data Analysis, Pharmacognosy"
                value={form.relatedSkills}
                onChange={(e) => setForm({ ...form, relatedSkills: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Impact Summary (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Summary of presentation topic, problem solved, or innovation presented..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          {/* Document Upload */}
          <div className="pt-1">
            <DocumentUploadZone
              fileUrl={form.documentUrl}
              onUploadSuccess={(url) => setForm({ ...form, documentUrl: url })}
              onRemove={() => setForm({ ...form, documentUrl: '' })}
              label="Upload Award Certificate / Citation (PDF or Image)"
              helperText="Upload official certificate of merit, trophy citation, or award letter (Max 5MB)."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : editingAchiev ? 'Update Achievement' : 'Submit Achievement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={previewDocTitle || 'Achievement Document Preview'}
      >
        <div className="space-y-4">
          {previewDocUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 min-h-[400px] flex items-center justify-center">
              {previewDocUrl.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={previewDocUrl}
                  title="Evidence PDF Preview"
                  className="w-full h-[550px] border-0 rounded-xl"
                />
              ) : (
                <img
                  src={previewDocUrl}
                  alt="Achievement Evidence"
                  className="max-h-[550px] max-w-full object-contain mx-auto rounded-xl p-2"
                />
              )}
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <a
              href={previewDocUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(false)}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
