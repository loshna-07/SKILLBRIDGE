import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TrendingUp, PlusCircle, CalendarCheck, FileText, CheckCircle2 } from 'lucide-react';

export const AcademicianResearch: React.FC = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'RESEARCH',
    description: '',
    targetAudience: 'Corporate R&D Labs & Academic Scholars',
    budget: '',
    startDate: '',
    endDate: '',
  });

  const fetchProposals = () => {
    setLoading(true);
    api
      .get('/academician/collaborations')
      .then((res) => setProposals(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/academician/collaborations', form);
      alert('Research collaboration proposal submitted!');
      setModalOpen(false);
      setForm({
        title: '',
        type: 'RESEARCH',
        description: '',
        targetAudience: 'Corporate R&D Labs & Academic Scholars',
        budget: '',
        startDate: '',
        endDate: '',
      });
      fetchProposals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit proposal.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research & Industrial Consultancy</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish academic research proposals, patent collaborations, and technical consultancy services for industry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Propose Research
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : proposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <Badge variant="amber" size="sm">
                    {item.type}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{item.description}</p>
                {item.budget && (
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Expected Grant: {item.budget}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Initiator: {item.initiatorRole}</span>
                <Badge variant="success" size="sm">
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No research proposals active"
          description="Initiate a joint project with corporate R&D divisions."
          actionText="Submit Proposal"
          onAction={() => setModalOpen(true)}
        />
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Research Proposal">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proposal Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Deep Learning in Edge IoT Devices for Smart Grid Health"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="RESEARCH">Joint Applied Research</option>
              <option value="CONSULTANCY">Industrial Consultancy</option>
              <option value="PATENT">Patent Commercialization</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Abstract & Scope *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Key hypotheses, industrial relevance, anticipated milestones..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Budget / Grant</label>
            <input
              type="text"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="e.g., ₹5,00,000 / Joint Grant"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
            >
              Submit Proposal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
