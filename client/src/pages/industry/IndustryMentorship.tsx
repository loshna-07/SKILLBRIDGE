import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Users, PlusCircle, CheckCircle2, XCircle, Clock, Calendar, Video } from 'lucide-react';

export const IndustryMentorship: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New program modal
  const [progModalOpen, setProgModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    maxMentees: 5,
    expertiseAreas: '',
  });

  const fetchRequests = () => {
    setLoading(true);
    api
      .get('/collaboration/mentorship/requests')
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/collaboration/mentorship', form);
      alert('Mentorship initiative published!');
      setProgModalOpen(false);
      setForm({ title: '', description: '', maxMentees: 5, expertiseAreas: '' });
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create mentorship initiative.');
    }
  };

  const handleRespond = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.put(`/collaboration/mentorship/requests/${requestId}/respond`, { status });
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update request.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentorship Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Offer guidance to aspiring talent, review student mentorship requests, and conduct 1-on-1 career sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setProgModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create Mentorship Offering
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Incoming Student Mentorship Requests</h2>
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{req.student?.fullName}</h3>
                  <Badge
                    variant={
                      req.status === 'ACCEPTED'
                        ? 'success'
                        : req.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {req.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {req.student?.department} &bull; {req.student?.institutionName} (CGPA: {req.student?.cgpa || 'N/A'})
                </p>
                <p className="text-[11px] text-purple-700 font-medium">Program: {req.program?.title}</p>
                {req.message && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                    "{req.message}"
                  </p>
                )}
              </div>

              {req.status === 'PENDING' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRespond(req.id, 'ACCEPTED')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                  >
                    Accept Mentee
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespond(req.id, 'REJECTED')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No mentorship requests yet"
          description="Create a mentorship initiative to let enthusiastic students connect with your senior engineering and business leaders."
          actionText="Offer Mentorship Program"
          onAction={() => setProgModalOpen(true)}
        />
      )}

      {/* Modal */}
      <Modal isOpen={progModalOpen} onClose={() => setProgModalOpen(false)} title="Offer Mentorship Program">
        <form onSubmit={handleCreateProgram} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Program Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Cloud Native & Distributed Systems Mentorship"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Mentees</label>
            <input
              type="number"
              min="1"
              max="20"
              value={form.maxMentees}
              onChange={(e) => setForm({ ...form, maxMentees: parseInt(e.target.value, 10) || 5 })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Focus & Expertise Areas</label>
            <input
              type="text"
              value={form.expertiseAreas}
              onChange={(e) => setForm({ ...form, expertiseAreas: e.target.value })}
              placeholder="Kubernetes, System Design, Career Planning, Code Reviews"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Structure of mentorship, frequency of meetings, expectations..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setProgModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
            >
              Publish Mentorship
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
