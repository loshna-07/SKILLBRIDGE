import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Building,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Star,
  Layers,
  ArrowRight,
  Target,
  GraduationCap,
  MessageSquare,
  Award,
  BookOpen,
} from 'lucide-react';

const INITIATIVE_TYPES = [
  { value: 'ALL', label: 'All Initiatives' },
  { value: 'LIVE_PROJECT', label: 'Live Projects' },
  { value: 'INNOVATION_CHALLENGE', label: 'Innovation Challenges' },
  { value: 'MENTORSHIP', label: 'Mentorship' },
  { value: 'WORKSHOP', label: 'Workshops' },
  { value: 'GUEST_LECTURE', label: 'Guest Lectures' },
  { value: 'INDUSTRY_VISIT', label: 'Industry Visits' },
  { value: 'RESEARCH_PROJECT', label: 'Research Projects' },
];

export const StudentCollaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'explore' | 'mentors' | 'my'>('recommended');
  const [recommendedCollabs, setRecommendedCollabs] = useState<any[]>([]);
  const [recommendedMentors, setRecommendedMentors] = useState<any[]>([]);
  const [allCollaborations, setAllCollaborations] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Explore Tab
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<any>(null);
  const [proposal, setProposal] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  // Mentorship request modal
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [mentorGoal, setMentorGoal] = useState('');
  const [submittingMentor, setSubmittingMentor] = useState(false);

  // Feedback modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackCollab, setFeedbackCollab] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recCollabsRes, recMentorsRes, collabsRes, appsRes] = await Promise.all([
        api.get('/student/recommended-collaborations'),
        api.get('/student/recommended-mentors'),
        api.get('/collaboration', {
          params: {
            type: selectedType,
            mode: selectedMode,
            search: searchQuery || undefined,
          },
        }),
        api.get('/collaboration/my/applications'),
      ]);
      setRecommendedCollabs(recCollabsRes.data || []);
      setRecommendedMentors(recMentorsRes.data || []);
      setAllCollaborations(collabsRes.data || []);
      setMyApplications(appsRes.data || []);
    } catch (err) {
      console.error('Failed to load collaborations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType, selectedMode, searchQuery]);

  const handleOpenApply = (collab: any) => {
    setSelectedCollab(collab);
    setProposal('');
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollab) return;
    setSubmittingApply(true);
    try {
      await api.post(`/collaboration/${selectedCollab.id}/apply`, { proposal });
      alert('Application submitted successfully!');
      setApplyModalOpen(false);
      fetchData();
      setActiveTab('my');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleOpenMentorRequest = (mentor: any) => {
    setSelectedMentor(mentor);
    setMentorGoal('');
    setMentorModalOpen(true);
  };

  const handleSubmitMentorRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    setSubmittingMentor(true);
    try {
      if (selectedMentor.type === 'INDUSTRY') {
        await api.post(`/collaboration/mentorship/${selectedMentor.id}/request`, {
          statementOfPurpose: mentorGoal,
        });
      } else {
        // Academician mentorship connection
        await api.post('/collaboration', {
          title: `Mentorship Guidance Request with ${selectedMentor.name}`,
          type: 'MENTORSHIP',
          description: mentorGoal,
          mode: 'ONLINE',
        });
      }
      alert('Mentorship guidance request submitted to mentor!');
      setMentorModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit mentorship request.');
    } finally {
      setSubmittingMentor(false);
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          Academia-Industry Collaboration & Mentorship Hub
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Industry & Academic Collaborations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Participate in live industrial capstone projects, innovation hackathons, guest seminars, expert mentorship, and industry visits.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'recommended'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Recommended For You ({recommendedCollabs.length})
        </button>
        <button
          onClick={() => setActiveTab('mentors')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'mentors'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Faculty & Industry Mentors ({recommendedMentors.length})
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'explore'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Explore All Initiatives ({allCollaborations.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'my'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          My Applications & Projects ({myApplications.length})
        </button>
      </div>

      {/* Body Content based on activeTab */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : activeTab === 'recommended' ? (
        recommendedCollabs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedCollabs.map((collab) => (
              <div
                key={collab.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900">{collab.title}</h3>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      {collab.matchScore}% Match
                    </span>
                  </div>

                  {collab.reason && (
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{collab.reason}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                    {collab.description || 'Industry-driven live capstone project with hands-on mentoring.'}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl mb-3">
                    <p>
                      <span className="font-semibold text-slate-700">Type: </span>
                      {collab.type?.replace('_', ' ')} &bull;{' '}
                      <span className="font-semibold text-slate-700">Mode: </span>
                      {collab.mode}
                    </p>
                    {collab.duration && (
                      <p>
                        <span className="font-semibold text-slate-700">Duration: </span>
                        {collab.duration}
                      </p>
                    )}
                  </div>

                  {/* Skills Developed */}
                  {collab.skillsCanDevelop && collab.skillsCanDevelop.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Competencies You Will Develop:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {collab.skillsCanDevelop.map((sk: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200"
                          >
                            + {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant="purple" size="sm">
                    {collab.type?.replace('_', ' ')}
                  </Badge>

                  <button
                    type="button"
                    onClick={() => handleOpenApply(collab)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Apply / Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No collaborative projects matching your pathway"
            description="Collaborative live projects and challenges tailored to your career focus will appear here."
            actionText="Explore All Initiatives"
            onAction={() => setActiveTab('explore')}
          />
        )
      ) : activeTab === 'mentors' ? (
        // MENTORS TAB
        recommendedMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{mentor.name}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {mentor.designation}
                      </p>
                      <p className="text-[11px] text-slate-400">{mentor.organization}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                      {mentor.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                    "{mentor.reason}"
                  </p>

                  {/* Expertise */}
                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Domain Expertise:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.slice(0, 3).map((exp: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Can Help Learn */}
                  {mentor.canHelpLearn && mentor.canHelpLearn.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">
                        Can Help You Bridge:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {mentor.canHelpLearn.map((sk: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenMentorRequest(mentor)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Request Mentorship Guidance
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No mentors currently matched"
            description="Mentors specializing in your career discipline will appear here as faculty and industry advisors join."
          />
        )
      ) : activeTab === 'explore' ? (
        // EXPLORE TAB
        <div>
          {/* Filter / Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between mb-6">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, required skills, company, or domain..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {INITIATIVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="ALL">All Modes</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>

          {allCollaborations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allCollaborations.map((collab) => (
                <div
                  key={collab.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-900">{collab.title}</h3>
                      <Badge variant="purple" size="sm">
                        {collab.type?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                      {collab.description}
                    </p>

                    <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl">
                      <p>
                        <span className="font-semibold text-slate-700">Host / Partner: </span>
                        {collab.initiatorInfo?.name || collab.initiatorRole}
                      </p>
                      {collab.duration && (
                        <p>
                          <span className="font-semibold text-slate-700">Duration: </span>
                          {collab.duration} &bull; Mode: {collab.mode}
                        </p>
                      )}
                      {collab.remunerationOrStipend && (
                        <p className="text-emerald-700 font-semibold">
                          Stipend / Grant: {collab.remunerationOrStipend}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {collab.applicantCount || 0} enrolled
                    </span>

                    {collab.hasApplied ? (
                      <Badge variant="success" size="sm">
                        Applied
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenApply(collab)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Layers}
              title="No collaboration initiatives found"
              description="Adjust your search criteria or check back soon for newly posted live projects."
            />
          )}
        </div>
      ) : (
        // MY APPLICATIONS TAB
        myApplications.length > 0 ? (
          <div className="space-y-4">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{app.collaboration?.title}</h3>
                    <Badge variant="purple" size="sm">
                      {app.collaboration?.type?.replace('_', ' ')}
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

                  <p className="text-xs text-slate-500">
                    Host:{' '}
                    <strong className="text-slate-700">
                      {app.collaboration?.initiatorInfo?.name || app.collaboration?.initiatorRole}
                    </strong>{' '}
                    &bull; Mode: {app.collaboration?.mode} &bull; Applied:{' '}
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </p>

                  {app.proposal && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-2xl">
                      "{app.proposal}"
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {app.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      onClick={() => handleOpenFeedback(app.collaboration)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all border border-amber-200"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      Give Feedback
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Send}
            title="No applications yet"
            description="Explore live projects, innovation challenges, and mentorship above to apply and collaborate."
            actionText="Explore Initiatives"
            onAction={() => setActiveTab('recommended')}
          />
        )
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${selectedCollab?.title || ''}`}
      >
        <form onSubmit={handleSubmitApplication} className="space-y-4">
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900">
            <p className="font-semibold">
              Host: {selectedCollab?.initiatorInfo?.name || selectedCollab?.initiatorRole}
            </p>
            <p className="text-[11px] text-brand-700 mt-0.5">
              Highlight your relevant coursework, skills, and why you are interested in this initiative.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Statement of Interest / Proposal *
            </label>
            <textarea
              rows={4}
              required
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Describe your qualifications, skills, and expectations for this collaboration..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingApply}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submittingApply ? 'Submitting...' : 'Confirm & Apply'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mentor Request Modal */}
      <Modal
        isOpen={mentorModalOpen}
        onClose={() => setMentorModalOpen(false)}
        title={`Request Mentorship with ${selectedMentor?.name || ''}`}
      >
        <form onSubmit={handleSubmitMentorRequest} className="space-y-4">
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900">
            <p className="font-semibold">
              Mentor: {selectedMentor?.name} ({selectedMentor?.organization})
            </p>
            <p className="text-[11px] text-brand-700 mt-0.5">
              Describe your learning goals, current projects, and what specific guidance you are seeking.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Statement of Purpose / Guidance Objectives *
            </label>
            <textarea
              rows={4}
              required
              value={mentorGoal}
              onChange={(e) => setMentorGoal(e.target.value)}
              placeholder="e.g. Seeking industry guidance on microservices architecture, capstone project review, and interview preparation..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setMentorModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingMentor}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submittingMentor ? 'Sending...' : 'Send Mentorship Request'}
            </button>
          </div>
        </form>
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
              placeholder="What did you learn? How was the industry interaction and mentorship?"
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
