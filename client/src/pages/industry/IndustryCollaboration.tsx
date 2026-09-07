import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Building,
  PlusCircle,
  CalendarCheck,
  Sparkles,
  Search,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  Star,
  MessageSquare,
  Clock,
  ArrowRight,
  Send,
  Eye,
} from 'lucide-react';

const COLLAB_TYPES = [
  { value: 'ALL', label: 'All Initiatives' },
  { value: 'MENTORSHIP', label: 'Mentorship' },
  { value: 'WORKSHOP', label: 'Workshops' },
  { value: 'GUEST_LECTURE', label: 'Guest Lectures' },
  { value: 'LIVE_PROJECT', label: 'Live Projects' },
  { value: 'INNOVATION_CHALLENGE', label: 'Innovation Challenges' },
  { value: 'RESEARCH_PROJECT', label: 'Research Projects' },
  { value: 'CONSULTANCY', label: 'Consultancy' },
  { value: 'INDUSTRY_VISIT', label: 'Industry Visits' },
];

export const IndustryCollaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my' | 'feedback'>('my');
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [myCollaborations, setMyCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Propose Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'LIVE_PROJECT',
    description: '',
    targetAudience: 'Engineering & Pharmacy Students and Faculty',
    location: '',
    mode: 'HYBRID',
    duration: '3 Months',
    remunerationOrStipend: 'INR 15,000 / month',
    eligibilityCriteria: 'Basic knowledge of pharmacology or data analytics',
    budget: 'INR 1,50,000',
    startDate: '',
    endDate: '',
  });

  // Applicants Modal
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [selectedCollabForApplicants, setSelectedCollabForApplicants] = useState<any>(null);
  const [applicantsList, setApplicantsList] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Feedback Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackCollab, setFeedbackCollab] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get('/collaboration', {
          params: {
            type: selectedType,
            mode: selectedMode,
            search: searchQuery || undefined,
          },
        }),
        api.get('/collaboration/my/created'),
      ]);
      setCollaborations(allRes.data);
      setMyCollaborations(myRes.data);
    } catch (err) {
      console.error('Failed to load collaborations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType, selectedMode, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/collaboration', form);
      alert('Collaboration initiative posted successfully!');
      setModalOpen(false);
      setForm({
        title: '',
        type: 'LIVE_PROJECT',
        description: '',
        targetAudience: 'Engineering & Pharmacy Students and Faculty',
        location: '',
        mode: 'HYBRID',
        duration: '3 Months',
        remunerationOrStipend: 'INR 15,000 / month',
        eligibilityCriteria: 'Basic knowledge of pharmacology or data analytics',
        budget: 'INR 1,50,000',
        startDate: '',
        endDate: '',
      });
      fetchData();
      setActiveTab('my');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit collaboration proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewApplicants = async (collab: any) => {
    setSelectedCollabForApplicants(collab);
    setApplicantsModalOpen(true);
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/collaboration/${collab.id}/applicants`);
      setApplicantsList(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch applicants.');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.put(`/collaboration/applications/${appId}/status`, { status });
      alert(`Applicant marked as ${status}.`);
      if (selectedCollabForApplicants) {
        const res = await api.get(`/collaboration/${selectedCollabForApplicants.id}/applicants`);
        setApplicantsList(res.data);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update applicant status.');
    }
  };

  const handleOpenFeedback = (collab: any) => {
    setFeedbackCollab(collab);
    setRating(5);
    setComment('');
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackCollab) return;
    setSubmittingFeedback(true);
    try {
      await api.post(`/collaboration/${feedbackCollab.id}/feedback`, {
        rating,
        comments: comment,
      });
      alert('Feedback submitted successfully!');
      setFeedbackModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Academia-Industry Collaboration Hub
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Collaboration & Innovation Initiatives</h1>
          <p className="text-xs text-slate-500 mt-1">
            Initiate and manage mentorship, live capstone projects, guest lectures, workshops, hackathons, and research.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Propose Collaboration
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'my'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Proposed Initiatives ({myCollaborations.length})
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'browse'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Explore All Initiatives ({collaborations.length})
        </button>
      </div>

      {/* Search & Filter Bar (Shown in browse tab) */}
      {activeTab === 'browse' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search initiatives by title, scope, skills, or audience..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {COLLAB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All Modes</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline / On-Site</option>
            </select>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : activeTab === 'my' ? (
        // MY COLLABORATIONS TAB
        myCollaborations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCollaborations.map((collab) => (
              <div
                key={collab.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900">{collab.title}</h3>
                    <Badge variant="purple" size="sm">
                      {collab.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                    {collab.description}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl">
                    {collab.targetAudience && (
                      <p>
                        <span className="font-semibold text-slate-700">Target Audience: </span>
                        {collab.targetAudience}
                      </p>
                    )}
                    {collab.duration && (
                      <p>
                        <span className="font-semibold text-slate-700">Duration: </span>
                        {collab.duration} &bull; Mode: {collab.mode}
                      </p>
                    )}
                    {collab.budget && (
                      <p className="text-emerald-700 font-semibold">
                        Budget / Honorarium: {collab.budget}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      {collab.status}
                    </Badge>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {collab.applications?.length || 0} Applicants
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewApplicants(collab)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Manage Applicants
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenFeedback(collab)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      Feedback
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarCheck}
            title="No proposed initiatives yet"
            description="Propose industry mentorship, capstone live projects, guest lectures, or hackathons to collaborate with top academia."
            actionText="Propose New Initiative"
            onAction={() => setModalOpen(true)}
          />
        )
      ) : (
        // BROWSE TAB
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
                    <Badge variant="purple" size="sm">
                      {collab.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{collab.description}</p>

                  <div className="space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                    <p>
                      <span className="font-semibold text-slate-700">Initiator: </span>
                      {collab.initiatorInfo?.name || collab.initiatorRole}
                    </p>
                    {collab.targetAudience && (
                      <p>
                        <span className="font-semibold text-slate-700">Audience: </span>
                        {collab.targetAudience}
                      </p>
                    )}
                    {collab.budget && (
                      <p className="text-emerald-700 font-semibold">
                        Funding / Budget: {collab.budget}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Mode: <strong className="text-slate-700">{collab.mode}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {collab.averageRating && (
                      <span className="flex items-center text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                        {collab.averageRating}
                      </span>
                    )}
                    <Badge variant="success" size="sm">
                      {collab.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No matching initiatives found"
            description="Try adjusting your keyword search or category filters."
          />
        )
      )}

      {/* Propose Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Propose Collaboration Initiative">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initiative Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Clinical Pharmacovigilance Real-Time Analytics"
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
                <option value="LIVE_PROJECT">Live Project</option>
                <option value="MENTORSHIP">Mentorship Program</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="GUEST_LECTURE">Guest Lecture</option>
                <option value="INNOVATION_CHALLENGE">Innovation Challenge / Hackathon</option>
                <option value="RESEARCH_PROJECT">Research Project</option>
                <option value="CONSULTANCY">Consultancy</option>
                <option value="INDUSTRY_VISIT">Industry Visit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Mode *</label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="HYBRID">Hybrid</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline / On-Site</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope & Objectives *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detail problem statements, milestone deliverables, expectations..."
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g., 8 Weeks, 1 Semester"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget / Grant (INR)</label>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="INR 1,00,000 / Industry Funded"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stipend / Honorarium</label>
              <input
                type="text"
                value={form.remunerationOrStipend}
                onChange={(e) => setForm({ ...form, remunerationOrStipend: e.target.value })}
                placeholder="INR 10,000 / month or Honorarium"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
            <input
              type="text"
              value={form.eligibilityCriteria}
              onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })}
              placeholder="e.g., Final year BAMS/B.Tech, Minimum CGPA 7.0"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
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
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Initiative'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Applicants Management Modal */}
      <Modal
        isOpen={applicantsModalOpen}
        onClose={() => setApplicantsModalOpen(false)}
        title={`Applicants: ${selectedCollabForApplicants?.title || ''}`}
      >
        <div className="space-y-4">
          {loadingApplicants ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : applicantsList.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {applicantsList.map((app) => {
                const name =
                  app.student?.fullName ||
                  app.academician?.fullName ||
                  app.institution?.institutionName ||
                  'Applicant';
                const roleBadge = app.applicantRole || 'APPLICANT';
                const org =
                  app.student?.institutionName ||
                  app.academician?.institutionName ||
                  app.institution?.institutionType;

                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{name}</h4>
                          <Badge variant="purple" size="sm">
                            {roleBadge}
                          </Badge>
                          <Badge
                            variant={
                              app.status === 'ACCEPTED'
                                ? 'success'
                                : app.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {app.status}
                          </Badge>
                        </div>
                        {org && <p className="text-[11px] text-slate-500 mt-0.5">{org}</p>}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {app.proposal && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                        <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">
                          Statement of Interest:
                        </span>
                        {app.proposal}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                      {app.status !== 'ACCEPTED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateApplicantStatus(app.id, 'ACCEPTED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept
                        </button>
                      )}
                      {app.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateApplicantStatus(app.id, 'REJECTED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No applicants yet"
              description="When students, faculty, or partner institutions apply to this collaboration, their profiles will appear here."
            />
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setApplicantsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title={`Feedback for ${feedbackCollab?.title || ''}`}
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rating (1 to 5 Stars) *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comments & Testimonial *
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details on engagement outcome, faculty/student performance, and deliverables..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
