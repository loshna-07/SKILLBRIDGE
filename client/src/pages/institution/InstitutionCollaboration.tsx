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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'INDUSTRY_VISIT',
    description: '',
    targetAudience: 'BAMS & Biotechnology Students and Faculty',
    mode: 'OFFLINE',
    location: 'Main Campus / Industrial Unit',
    duration: '1 Day',
    budget: 'INR 50,000',
    eligibilityCriteria: 'Enrolled students and recognized faculty',
  });

  const fetchCollabs = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get('/collaboration', {
          params: {
            type: selectedType,
            search: searchQuery || undefined,
          },
        }),
        api.get('/collaboration/my/created'),
      ]);
      setCollaborations(allRes.data);
      setMyCollaborations(myRes.data);
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
        targetAudience: 'BAMS & Biotechnology Students and Faculty',
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Institutional MoUs & Collaboration Gateway
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Industry-Academia Partnerships</h1>
          <p className="text-xs text-slate-500 mt-1">
            Establish institutional MoUs, industrial tours, collaborative laboratories, and corporate-sponsored incubation challenges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Propose Partnership
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'my'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Our Proposed Partnerships ({myCollaborations.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'all'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Active Partnerships ({collaborations.length})
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partnerships by title, corporate partner, or keywords..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {COLLAB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : activeTab === 'my' ? (
        myCollaborations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCollaborations.map((collab) => (
              <div
                key={collab.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900">{collab.title}</h3>
                    <Badge variant="success" size="sm">
                      {collab.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{collab.description}</p>
                  {collab.targetAudience && (
                    <p className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Audience: </span>
                      {collab.targetAudience}
                    </p>
                  )}
                  {collab.budget && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      Budget / Allocation: {collab.budget}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {collab.applications?.length || 0} Registered Applicants
                  </span>
                  <Badge variant="success" size="sm">
                    {collab.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building}
            title="No institutional initiatives proposed yet"
            description="Initiate MoUs, sponsored incubation challenges, and industrial visit proposals here."
            actionText="Propose Partnership"
            onAction={() => setModalOpen(true)}
          />
        )
      ) : (
        collaborations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collaborations.map((collab) => (
              <div
                key={collab.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900">{collab.title}</h3>
                    <Badge variant="success" size="sm">
                      {collab.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{collab.description}</p>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Initiator: </span>
                    {collab.initiatorInfo?.name || collab.initiatorRole}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Mode: {collab.mode}</span>
                  <Badge variant="success" size="sm">
                    {collab.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No partnerships match this filter"
            description="Try choosing another partnership type or clearing your keyword filter."
          />
        )
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Propose Partnership Initiative">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Partnership Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Campus Center of Excellence in Herbal Formulation Analytics"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="INDUSTRY_VISIT">Industry Visit / Tour</option>
                <option value="WORKSHOP">Joint Workshop</option>
                <option value="RESEARCH_PROJECT">Research Collaboration & Lab</option>
                <option value="GUEST_LECTURE">Guest Lecture / Seminar</option>
                <option value="LIVE_PROJECT">Capstone Live Project</option>
                <option value="INNOVATION_CHALLENGE">Innovation Challenge</option>
                <option value="CONSULTANCY">Consultancy</option>
                <option value="MENTORSHIP">Mentorship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mode *</label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="OFFLINE">Offline / On-Site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Scope of agreement, mutual deliverables, and institutional outcomes..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget / Allocation (INR)</label>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="INR 1,00,000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
