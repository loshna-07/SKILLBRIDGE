import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Application } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Send,
  Building,
  Calendar,
  Clock,
  Video,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
  FileText,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const StudentApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // History & details modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    api
      .get('/student/applications')
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      await api.post(`/student/applications/${appId}/withdraw`);
      alert('Application withdrawn.');
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw.');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return 'success';
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return 'info';
      case 'UNDER_REVIEW':
        return 'purple';
      case 'REJECTED':
      case 'WITHDRAWN':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Application Pipeline</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track the real-time recruitment progression of your internship and job applications.
        </p>
      </div>

      {/* Celebratory Banner for Selection / Offers */}
      {applications.some((a) => a.status === 'SELECTED') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Congratulations! You have received a formal offer/selection!
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {applications
                  .filter((a) => a.status === 'SELECTED')
                  .map((a) => `${a.opportunity?.industry?.companyName} (${a.opportunity?.title})`)
                  .join(' • ')}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow-sm">
            Confirmed Selection
          </span>
        </div>
      )}

      {/* Shortlist Alert Banner */}
      {applications.some((a) => a.status === 'SHORTLISTED') && !applications.some((a) => a.status === 'SELECTED') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-brand-600 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold">You have been shortlisted for interviews!</h3>
              <p className="text-xs text-sky-100 mt-0.5">
                {applications
                  .filter((a) => a.status === 'SHORTLISTED')
                  .map((a) => `${a.opportunity?.industry?.companyName} (${a.opportunity?.title})`)
                  .join(' • ')}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 bg-white text-sky-800 text-xs font-bold rounded-xl shadow-sm">
            Shortlisted
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900">{app.opportunity?.title}</h3>
                  <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{app.opportunity?.industry?.companyName}</span>
                  <span>&bull;</span>
                  <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span className="font-bold text-brand-600">Match Score: {app.matchScore}%</span>
                </p>

                {/* Next upcoming interview alert if any */}
                {app.interviews && app.interviews.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 mt-1">
                    <Video className="w-4 h-4 text-sky-600" />
                    <span>
                      Interview Scheduled: {new Date(app.interviews[0].scheduledAt).toLocaleString()}
                    </span>
                    {app.interviews[0].meetingLink && (
                      <a
                        href={app.interviews[0].meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold underline text-sky-900 ml-1"
                      >
                        Join Meeting &rarr;
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApp(app);
                    setDetailsModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  View Timeline
                </button>

                {!['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(app.status) && (
                  <button
                    type="button"
                    onClick={() => handleWithdraw(app.id)}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Send}
          title="No applications tracked yet"
          description="You have not submitted any applications. Browse available opportunities and submit your candidacy."
          actionText="Browse Internships"
          onAction={() => window.location.assign('/student/internships')}
        />
      )}

      {/* Details & Status History Timeline Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Application Status History"
        maxWidth="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">{selectedApp.opportunity?.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedApp.opportunity?.industry?.companyName} &bull; Match Score: {selectedApp.matchScore}%
              </p>
            </div>

            {/* Timeline */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Recruitment Timeline & History
              </h5>

              {selectedApp.history && selectedApp.history.length > 0 ? (
                <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
                  {selectedApp.history.map((h: any) => (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-600 border-2 border-white" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{h.status}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {h.notes && <p className="text-xs text-slate-600 mt-1">{h.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No status history recorded yet.</p>
              )}
            </div>

            {/* Interviews */}
            {selectedApp.interviews && selectedApp.interviews.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-sky-600" />
                  Scheduled Interviews
                </h5>
                <div className="space-y-2">
                  {selectedApp.interviews.map((iv: any) => (
                    <div key={iv.id} className="p-3 rounded-xl bg-sky-50/60 border border-sky-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sky-900">
                          {new Date(iv.scheduledAt).toLocaleString()}
                        </span>
                        <Badge variant="info" size="sm">
                          {iv.status}
                        </Badge>
                      </div>
                      {iv.meetingLink && (
                        <p className="mt-1">
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-brand-600 hover:underline"
                          >
                            Meeting Link: {iv.meetingLink}
                          </a>
                        </p>
                      )}
                      {iv.notes && <p className="text-slate-600 mt-1">{iv.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
