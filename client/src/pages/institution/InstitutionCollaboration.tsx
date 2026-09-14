import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Building,
  PlusCircle,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Users,
  Star,
  ShieldCheck,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react';

const COLLAB_TYPES = [
  { value: 'ALL', label: 'All Partnerships' },
  { value: 'INDUSTRY_VISIT', label: 'Industry Visits' },
  { value: 'WORKSHOP', label: 'Workshops & FDP' },
  { value: 'RESEARCH_PROJECT', label: 'Joint Research & Labs' },
  { value: 'GUEST_LECTURE', label: 'Guest Lectures' },
  { value: 'LIVE_PROJECT', label: 'Live Projects' },
  { value: 'INNOVATION_CHALLENGE', label: 'Innovation Challenges' },
  { value: 'CONSULTANCY', label: 'Consultancy' },
  { value: 'MENTORSHIP', label: 'Mentorship' },
];

export const InstitutionCollaboration: React.FC = () => {
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [myCollaborations, setMyCollaborations] = useState<any[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'partnerships' | 'my' | 'all'>('partnerships');

  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'INDUSTRY_VISIT',
    description: '',
    targetAudience: 'Students and Recognized Faculty',
    mode: 'OFFLINE',
    location: 'Main Campus / Industrial Unit',
    duration: '1 Day',
    budget: 'INR 50,000',
    eligibilityCriteria: 'Enrolled students and recognized faculty',
  });

  const fetchCollabs = async () => {
    setLoading(true);
    try {
      const [allRes, myRes, partRes] = await Promise.all([
        api.get('/collaboration', {
          params: {
            type: selectedType,
            search: searchQuery || undefined,
          },
        }),
        api.get('/collaboration/my/created'),
        api.get('/institution/partnerships').catch(() => ({ data: [] })),
      ]);
      setCollaborations(allRes.data);
      setMyCollaborations(myRes.data);
      setPartnerships(Array.isArray(partRes.data) ? partRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollabs();
  }, [selectedType, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/collaboration', form);
      alert('Institutional initiative submitted successfully!');
      setModalOpen(false);
      setForm({
        title: '',
        type: 'INDUSTRY_VISIT',
        description: '',
        targetAudience: 'Students and Recognized Faculty',
        mode: 'OFFLINE',
        location: 'Main Campus / Industrial Unit',
        duration: '1 Day',
        budget: 'INR 50,000',
        eligibilityCriteria: 'Enrolled students and recognized faculty',
      });
      fetchCollabs();
      setActiveTab('my');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondPartnership = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/institution/partnerships/${id}/respond`, { status });
      fetchCollabs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update partnership status.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-brand-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur border border-white/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Institutional Industry Collaboration Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Industry Partnerships & MoUs</h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl">
              Connect directly with verified industry leaders for MoUs, joint research laboratories, clinical trials, and student internship pipelines.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Initiative
          </button>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('partnerships')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'partnerships'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Official Industry MoUs ({partnerships.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'my'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          My Posted Initiatives ({myCollaborations.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Active Collaborative Programs ({collaborations.length})
        </button>
      </div>

      {/* 3. Partnerships Tab */}
      {activeTab === 'partnerships' && (
        <div className="space-y-4">
          {partnerships.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No industry partnerships established yet"
              description="Enterprises seeking academic and clinical MoUs with your institution will appear here for review."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partnerships.map((p) => (
                <div
                  key={p.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {p.industry?.companyName || 'Enterprise Partner'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {p.industry?.industrySector} &bull; {p.industry?.location || 'India'}
                        </p>
                      </div>
                    </div>
                    {p.status === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active MoU
                      </span>
                    ) : p.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Declined
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Approval
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="text-slate-500 dark:text-slate-400 font-semibold">
                      Partnership Scope: <span className="text-slate-800 dark:text-slate-200 font-bold">{p.partnershipType?.replace(/_/g, ' ')}</span>
                    </div>
                    {p.proposalNote && (
                      <p className="text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                        "{p.proposalNote}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Requested: {new Date(p.requestedAt || p.createdAt).toLocaleDateString()}
                    </span>
                    {p.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespondPartnership(p.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                        >
                          Approve MoU
                        </button>
                        <button
                          onClick={() => handleRespondPartnership(p.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. My Initiatives & All Collaborations */}
      {activeTab !== 'partnerships' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeTab === 'my' ? myCollaborations : collaborations).map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h3>
                  <Badge variant="info">{c.type?.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{c.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400">Target:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{c.targetAudience}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Location / Mode:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{c.location} ({c.mode})</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Initiative */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Institutional Initiative">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Program Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Joint Clinical Trial Center & Hospital Internship MoU"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Collaboration Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {COLLAB_TYPES.filter((t) => t.value !== 'ALL').map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scope & Objectives *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide initiative summary, clinical/industrial resources, faculty leads..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              {submitting ? 'Publishing...' : 'Publish Initiative'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
