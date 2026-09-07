import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Users,
  Search,
  PlusCircle,
  MapPin,
  Clock,
  Coins,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const MODULE_TYPES = [
  { key: 'ALL', label: 'All Opportunities', icon: Sparkles },
  { key: 'FACULTY_INTERNSHIP', label: 'Faculty Internships', icon: Briefcase },
  { key: 'INDUSTRIAL_TRAINING', label: 'Industrial Training', icon: Building },
  { key: 'FDP', label: 'FDP', icon: BookOpen },
  { key: 'CONSULTANCY', label: 'Consultancy', icon: TrendingUp },
  { key: 'RESEARCH', label: 'Research Collaboration', icon: GraduationCap },
  { key: 'WORKSHOP', label: 'Workshops', icon: CalendarCheck },
  { key: 'GUEST_LECTURE', label: 'Guest Lectures', icon: Users },
  { key: 'MENTORSHIP', label: 'Mentorship', icon: Users },
  { key: 'LIVE_PROJECT', label: 'Live Projects', icon: Briefcase },
  { key: 'INNOVATION_CHALLENGE', label: 'Innovation Challenges', icon: Sparkles },
  { key: 'INDUSTRY_VISIT', label: 'Industry Visits', icon: Building },
];

export const AcademicianOpportunities: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'ALL';

  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
  const [activeOpportunity, setActiveOpportunity] = useState<any>(null);
  const [applicantsList, setApplicantsList] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Form states
  const [proposalText, setProposalText] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    type: 'FACULTY_INTERNSHIP',
    description: '',
    targetAudience: '',
    location: '',
    mode: 'HYBRID',
    duration: '',
    remunerationOrStipend: '',
    eligibilityCriteria: '',
    budget: '',
    startDate: '',
    endDate: '',
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedType !== 'ALL') params.type = selectedType;
      if (selectedMode !== 'ALL') params.mode = selectedMode;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/academician/opportunities', { params });
      setOpportunities(res.data);
    } catch (err) {
      console.error('Failed to load opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedType, selectedMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleTypeSelect = (typeKey: string) => {
    setSelectedType(typeKey);
    setSearchParams(typeKey === 'ALL' ? {} : { type: typeKey });
  };

  // Apply Handler
  const handleOpenApply = (opp: any) => {
    setActiveOpportunity(opp);
    setProposalText('');
    setIsApplyOpen(true);
  };

  const handleSubmitApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOpportunity) return;
    setSubmittingApply(true);
    try {
      await api.post(`/academician/opportunities/${activeOpportunity.id}/apply`, {
        proposal: proposalText,
      });
      alert('Application submitted successfully!');
      setIsApplyOpen(false);
      fetchOpportunities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApply(false);
    }
  };

  // Withdraw Handler
  const handleWithdraw = async (oppId: string) => {
    if (!confirm('Are you sure you want to withdraw your application?')) return;
    try {
      await api.post(`/academician/participations/${oppId}/withdraw`);
      alert('Application withdrawn.');
      fetchOpportunities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw.');
    }
  };

  // Create Opportunity Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCreate(true);
    try {
      await api.post('/academician/opportunities', createForm);
      alert('Opportunity posted successfully!');
      setIsCreateOpen(false);
      setCreateForm({
        title: '',
        type: 'FACULTY_INTERNSHIP',
        description: '',
        targetAudience: '',
        location: '',
        mode: 'HYBRID',
        duration: '',
        remunerationOrStipend: '',
        eligibilityCriteria: '',
        budget: '',
        startDate: '',
        endDate: '',
      });
      fetchOpportunities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create opportunity.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Manage Applicants
  const handleOpenApplicants = async (opp: any) => {
    setActiveOpportunity(opp);
    setIsApplicantsOpen(true);
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/academician/opportunities/${opp.id}/applicants`);
      setApplicantsList(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch applicants.');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, newStatus: string) => {
    try {
      await api.put(`/academician/applications/${appId}/status`, { status: newStatus });
      setApplicantsList((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      fetchOpportunities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update applicant status.');
    }
  };

  // Delete Opportunity
  const handleDeleteOpportunity = async (oppId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity? All applications will also be removed.')) return;
    try {
      await api.delete(`/academician/opportunities/${oppId}`);
      alert('Opportunity deleted.');
      fetchOpportunities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete opportunity.');
    }
  };

  const canPost = user?.role === 'ACADEMICIAN' || user?.role === 'INDUSTRY' || user?.role === 'INSTITUTION';

  const getTypeBadgeColor = (type: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber' => {
    switch (type) {
      case 'FACULTY_INTERNSHIP':
        return 'info';
      case 'INDUSTRIAL_TRAINING':
        return 'purple';
      case 'FDP':
        return 'success';
      case 'CONSULTANCY':
        return 'amber';
      case 'RESEARCH':
        return 'purple';
      case 'WORKSHOP':
        return 'info';
      case 'GUEST_LECTURE':
        return 'info';
      case 'MENTORSHIP':
        return 'amber';
      case 'LIVE_PROJECT':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academician Collaboration Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, apply, and collaborate across faculty internships, FDPs, consultancy, research, and live projects.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Post Opportunity
          </button>
        )}
      </div>

      {/* Module Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {MODULE_TYPES.map((mod) => {
          const Icon = mod.icon;
          const isActive = selectedType === mod.key;
          return (
            <button
              key={mod.key}
              onClick={() => handleTypeSelect(mod.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-600 text-white font-bold shadow-sm shadow-amber-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Search & Mode Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, domain, keywords, location, or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Mode:</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
          >
            <option value="ALL">All Modes</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline / On-Campus</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <Badge variant={getTypeBadgeColor(opp.type) as any} size="sm">
                        {opp.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="default" size="sm">
                        {opp.mode}
                      </Badge>
                      {opp.status !== 'OPEN' && (
                        <Badge variant="danger" size="sm">
                          {opp.status}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{opp.title}</h3>
                  </div>

                  {opp.isInitiator && (
                    <button
                      onClick={() => handleDeleteOpportunity(opp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Opportunity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">
                    {opp.initiatorInfo?.name || 'SkillBridge Partner'}
                  </span>
                  <span>&bull;</span>
                  <span>{opp.initiatorRole}</span>
                  {opp.location && (
                    <>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {opp.location}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {opp.description}
                </p>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl mb-3">
                  {opp.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Duration: {opp.duration}</span>
                    </div>
                  )}
                  {opp.remunerationOrStipend && (
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-3 h-3 text-slate-400" />
                      <span>Stipend/Grant: {opp.remunerationOrStipend}</span>
                    </div>
                  )}
                  {opp.targetAudience && (
                    <div className="col-span-2 flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Target: {opp.targetAudience}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-medium">
                  {opp.applicantCount} {opp.applicantCount === 1 ? 'Applicant' : 'Applicants'}
                </span>

                <div className="flex items-center gap-2">
                  {opp.isInitiator ? (
                    <button
                      onClick={() => handleOpenApplicants(opp)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
                    >
                      Review Applicants ({opp.applicantCount})
                    </button>
                  ) : opp.hasApplied ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          opp.applicationStatus === 'ACCEPTED'
                            ? 'success'
                            : opp.applicationStatus === 'REJECTED'
                            ? 'danger'
                            : 'amber'
                        }
                        size="sm"
                      >
                        Status: {opp.applicationStatus}
                      </Badge>
                      {opp.applicationStatus === 'APPLIED' && (
                        <button
                          onClick={() => handleWithdraw(opp.id)}
                          className="text-[11px] font-semibold text-rose-600 hover:underline"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  ) : user?.role === 'ACADEMICIAN' ? (
                    <button
                      onClick={() => handleOpenApply(opp)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Apply / Register
                    </button>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Academician Only</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description="There are currently no opportunities matching your filter criteria in the database."
        />
      )}

      {/* Modal: Post Opportunity */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Post Academician Collaboration Opportunity"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Summer Faculty R&D Sabbatical in Distributed Systems"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Module *</label>
              <select
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              >
                <option value="FACULTY_INTERNSHIP">Faculty Internship</option>
                <option value="INDUSTRIAL_TRAINING">Industrial Training</option>
                <option value="FDP">FDP (Faculty Development)</option>
                <option value="CONSULTANCY">Consultancy</option>
                <option value="RESEARCH">Research Collaboration</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="GUEST_LECTURE">Guest Lecture</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="LIVE_PROJECT">Live Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mode *</label>
              <select
                value={createForm.mode}
                onChange={(e) => setCreateForm({ ...createForm, mode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              >
                <option value="HYBRID">Hybrid</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline / On-Campus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Outline objectives, deliverables, domain areas, and expectations..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / City</label>
              <input
                type="text"
                placeholder="e.g., Bangalore, India or Remote"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g., 6 Weeks, 3 Months, 5 Days"
                value={createForm.duration}
                onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remuneration / Stipend / Grant</label>
              <input
                type="text"
                placeholder="e.g., ₹45,000 / month or ₹2.5 Lakhs Grant"
                value={createForm.remunerationOrStipend}
                onChange={(e) => setCreateForm({ ...createForm, remunerationOrStipend: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <input
                type="text"
                placeholder="e.g., Computer Science & AI Faculty"
                value={createForm.targetAudience}
                onChange={(e) => setCreateForm({ ...createForm, targetAudience: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCreate}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
            >
              {submittingCreate ? 'Posting...' : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Apply / Register */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title={`Apply: ${activeOpportunity?.title || ''}`}
      >
        <form onSubmit={handleSubmitApply} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900">
            <p className="font-semibold">Role: {activeOpportunity?.type?.replace('_', ' ')}</p>
            <p className="mt-0.5 text-amber-800">
              Initiator: {activeOpportunity?.initiatorInfo?.name} ({activeOpportunity?.initiatorRole})
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Statement of Interest / Proposal *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Introduce your academic background, relevant domain experience, proposed collaboration scope, and expected outcomes..."
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingApply}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
            >
              {submittingApply ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Review Applicants */}
      <Modal
        isOpen={isApplicantsOpen}
        onClose={() => setIsApplicantsOpen(false)}
        title={`Applicants: ${activeOpportunity?.title || ''}`}
        maxWidth="xl"
      >
        {loadingApplicants ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : applicantsList.length > 0 ? (
          <div className="space-y-4">
            {applicantsList.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {app.academician?.fullName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {app.academician?.designation} &bull; {app.academician?.department} &bull;{' '}
                      {app.academician?.institutionName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Email: {app.academician?.user?.email} &bull; Exp:{' '}
                      {app.academician?.yearsOfExperience || 'N/A'} yrs
                    </p>
                  </div>
                  <Badge
                    variant={
                      app.status === 'ACCEPTED'
                        ? 'success'
                        : app.status === 'REJECTED'
                        ? 'danger'
                        : 'amber'
                    }
                    size="sm"
                  >
                    {app.status}
                  </Badge>
                </div>

                {app.proposal && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Statement of Interest:
                    </span>
                    {app.proposal}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateApplicantStatus(app.id, 'ACCEPTED')}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateApplicantStatus(app.id, 'REJECTED')}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No applicants yet"
            description="Academicians will appear here as soon as they submit applications."
          />
        )}
      </Modal>
    </div>
  );
};
