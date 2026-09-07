import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { LearningProgram, Skill } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  BookOpen,
  PlusCircle,
  Users,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Tag,
} from 'lucide-react';

export const IndustryLearningPrograms: React.FC = () => {
  const [programs, setPrograms] = useState<LearningProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkillName, setNewSkillName] = useState('');

  // New program state
  const [form, setForm] = useState({
    title: '',
    type: 'TRAINING',
    description: '',
    duration: '4 Weeks',
    url: '',
    mode: 'ONLINE',
    price: 'Free',
    startDate: '',
  });

  const fetchPrograms = () => {
    setLoading(true);
    api
      .get('/learning/my/created')
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchSkills = () => {
    api
      .get('/assessments/categories')
      .then((res) => {
        const flattened = res.data.flatMap((c: any) => c.skills || []);
        setAvailableSkills(flattened);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPrograms();
    fetchSkills();
  }, []);

  const handleToggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleAddCustomSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      const res = await api.post('/assessments/skills', {
        name: newSkillName.trim(),
      });
      setAvailableSkills([...availableSkills, res.data]);
      setSelectedSkills([...selectedSkills, res.data.id]);
      setNewSkillName('');
    } catch (err: any) {
      alert('Failed to add skill: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/learning', {
        ...form,
        skillIds: selectedSkills,
      });
      alert('Learning program published successfully!');
      setModalOpen(false);
      setForm({
        title: '',
        type: 'TRAINING',
        description: '',
        duration: '4 Weeks',
        url: '',
        mode: 'ONLINE',
        price: 'Free',
        startDate: '',
      });
      setSelectedSkills([]);
      fetchPrograms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create program.');
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await api.put(`/learning/${id}/publish`);
      fetchPrograms();
    } catch (err: any) {
      alert('Failed to update publish state.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this learning program?')) return;
    try {
      await api.delete(`/learning/${id}`);
      fetchPrograms();
    } catch (err: any) {
      alert('Failed to delete program.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Industry Learning Programs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Offer company trainings, bootcamps, certifications, workshops, and mentorship to prepare students with industry-demanded skills.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create Program
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{prog.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="purple" size="sm">
                        {prog.type}
                      </Badge>
                      <Badge variant={prog.isPublished ? 'success' : 'default'} size="sm">
                        {prog.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {prog.description}
                </p>

                {/* Skills covered */}
                {prog.skills && prog.skills.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Skills Covered:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prog.skills.map((s: any) => (
                        <span
                          key={s.id}
                          className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium border border-purple-100"
                        >
                          {s.skill?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {prog.duration} &bull; {prog.mode}
                  </span>
                  <span className="font-bold text-slate-900">{prog.price}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <strong>{prog._count?.enrollments || 0}</strong> Registered
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(prog.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title={prog.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {prog.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(prog.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Delete Program"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No training programs created yet"
          description="Publish training, certifications, bootcamps, workshops, or mentorship initiatives to prepare students for your company's skill requirements."
          actionText="Create Learning Program"
          onAction={() => setModalOpen(true)}
        />
      )}

      {/* Create Program Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Industry Learning Program">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Program Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Industrial Phytomedicine & Formulation Bootcamp"
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
                <option value="TRAINING">Industrial Training</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="BOOTCAMP">Bootcamp</option>
                <option value="MENTORSHIP">Mentorship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Mode</label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="ONLINE">Online Virtual</option>
                <option value="OFFLINE">On-Premises</option>
                <option value="HYBRID">Hybrid</option>
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
              placeholder="Topics covered, curriculum modules, hands-on lab sessions..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
          </div>

          {/* Skills Covered Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Skills Covered / Competencies Taught *</span>
              <span className="text-[10px] text-purple-600 font-normal">
                {selectedSkills.length} selected
              </span>
            </label>

            {availableSkills.length > 0 && (
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5 flex flex-wrap gap-1.5 mb-2 bg-slate-50/50">
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleToggleSkill(skill.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick add custom skill */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Or specify custom skill name..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200"
              >
                Add Skill
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g., 40 Hours / 4 Weeks"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fee / Price</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Free / Sponsored"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="text"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                placeholder="e.g., November 2026 / Rolling"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting / Portal URL</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
            >
              Publish Program
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
