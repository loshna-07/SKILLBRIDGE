import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const InstitutionSkills: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Configurable weights modal
  const [weightsModalOpen, setWeightsModalOpen] = useState(false);
  const [weights, setWeights] = useState({
    skillWeight: 0.50,
    assessmentWeight: 0.20,
    cgpaWeight: 0.15,
    academicWeight: 0.15,
  });

  // Create assessment modal
  const [createTestModalOpen, setCreateTestModalOpen] = useState(false);
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    passingScore: 60,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, weightsRes] = await Promise.all([
        api.get('/institution/dashboard'),
        api.get('/stats/weights'),
      ]);
      setAnalytics(dashRes.data.analytics);
      if (weightsRes.data) {
        setWeights(weightsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/stats/weights', weights);
      alert('Matching algorithm weights updated successfully!');
      setWeightsModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update weights.');
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assessments', testForm);
      alert('Assessment created! Questions can now be added.');
      setCreateTestModalOpen(false);
      setTestForm({ title: '', description: '', durationMinutes: 30, passingScore: 60 });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create assessment.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skill Mapping & Demand Gap Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare student competencies against active corporate hiring requirements and calibrate algorithm parameters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setCreateTestModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Assessment
          </button>

          <button
            type="button"
            onClick={() => setWeightsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            Configure Algorithm Weights
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Student Competency Supply VS Corporate Industry Demand
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time differential indicating high-demand technologies, surpluses, and curricular shortages.
          </p>
        </div>

        {analytics?.skillComparison && analytics.skillComparison.length > 0 ? (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3">Skill / Technology</th>
                  <th className="pb-3">Industry Postings Requiring</th>
                  <th className="pb-3">Students Assessed & Verified</th>
                  <th className="pb-3">Deficit / Surplus</th>
                  <th className="pb-3">Strategic Diagnosis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.skillComparison.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900">{item.skill}</td>
                    <td className="py-3 font-semibold text-purple-700">{item.industryDemand} Listings</td>
                    <td className="py-3 font-semibold text-slate-700">{item.studentCount} Students</td>
                    <td className="py-3">
                      {item.gap > 0 ? (
                        <span className="font-bold text-rose-600">-{item.gap} (Shortage)</span>
                      ) : (
                        <span className="font-bold text-emerald-600">+{Math.abs(item.gap)} (Surplus)</span>
                      )}
                    </td>
                    <td className="py-3">
                      {item.isShortage ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Curricular Shortage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Meets Market Demand
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Award}
            title="No skill comparisons available yet"
            description="When industry postings and student assessments are entered into the database, automatic demand-gap diagnostics will generate here."
          />
        )}
      </div>

      {/* Weights Modal */}
      <Modal
        isOpen={weightsModalOpen}
        onClose={() => setWeightsModalOpen(false)}
        title="Configure Matching Engine Weights"
      >
        <form onSubmit={handleUpdateWeights} className="space-y-4">
          <p className="text-xs text-slate-600">
            Customize the relative weights used by the matching engine when computing student-to-opportunity compatibility percentages. The weights must sum to 1.0 (100%).
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Skill Overlap & Required Competencies</span>
                <span className="text-emerald-700">{Math.round(weights.skillWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={weights.skillWeight}
                onChange={(e) => setWeights({ ...weights, skillWeight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Assessment Proficiency Scores</span>
                <span className="text-emerald-700">{Math.round(weights.assessmentWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={weights.assessmentWeight}
                onChange={(e) => setWeights({ ...weights, assessmentWeight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Academic Performance (CGPA)</span>
                <span className="text-emerald-700">{Math.round(weights.cgpaWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={weights.cgpaWeight}
                onChange={(e) => setWeights({ ...weights, cgpaWeight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Degree & Department Qualification</span>
                <span className="text-emerald-700">{Math.round(weights.academicWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={weights.academicWeight}
                onChange={(e) => setWeights({ ...weights, academicWeight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWeightsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={createTestModalOpen}
        onClose={() => setCreateTestModalOpen(false)}
        title="Create Standardized Assessment"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              value={testForm.title}
              onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
              placeholder="e.g., Core Data Structures and Algorithms Assessment"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="10"
                value={testForm.durationMinutes}
                onChange={(e) => setTestForm({ ...testForm, durationMinutes: parseInt(e.target.value, 10) || 30 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Score (%)</label>
              <input
                type="number"
                min="30"
                max="100"
                value={testForm.passingScore}
                onChange={(e) => setTestForm({ ...testForm, passingScore: parseFloat(e.target.value) || 60 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={testForm.description}
              onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
              placeholder="Syllabus, topics tested, and intended semester cohort..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateTestModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              Create Assessment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
