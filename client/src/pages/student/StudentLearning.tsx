import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { LearningProgram } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SkillMatchBadge } from '../../components/matching/SkillMatchBadge';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Target,
  Search,
  Users,
  Award,
  Calendar,
  Layers,
} from 'lucide-react';

const FILTER_TYPES = [
  'ALL',
  'RECOMMENDED',
  'TRAINING',
  'CERTIFICATION',
  'WORKSHOP',
  'BOOTCAMP',
  'MENTORSHIP',
];

export const StudentLearning: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('RECOMMENDED');
  const [search, setSearch] = useState('');

  // Details Modal
  const [selectedProg, setSelectedProg] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const fetchPrograms = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType === 'RECOMMENDED') {
      params.set('recommendations', 'true');
    } else if (filterType !== 'ALL') {
      params.set('type', filterType);
    }
    if (search.trim()) {
      params.set('search', search.trim());
    }

    api
      .get(`/learning?${params.toString()}`)
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrograms();
  }, [filterType, search]);

  const handleEnroll = async (programId: string) => {
    setEnrolling(true);
    try {
      await api.post(`/learning/${programId}/enroll`);
      alert('Enrolled successfully! You can access materials and sessions.');
      if (selectedProg && selectedProg.id === programId) {
        setSelectedProg({ ...selectedProg, isEnrolled: true });
      }
      fetchPrograms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to enroll.');
    } finally {
      setEnrolling(false);
    }
  };

  const openDetails = (prog: any) => {
    setSelectedProg(prog);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skill Bridging & Learning Programs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Industry training, bootcamps, workshops, certifications, and mentorship initiatives personalized to bridge your skill gaps.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search programs or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {FILTER_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === type
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type === 'ALL'
              ? 'All Programs'
              : type === 'RECOMMENDED'
              ? '🎯 Recommended For Me'
              : type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className={`p-6 rounded-2xl bg-white border flex flex-col justify-between transition-all hover:shadow-md ${
                prog.addressesGap ? 'border-brand-300 ring-1 ring-brand-400/30' : 'border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant={prog.addressesGap ? 'purple' : 'default'} size="sm">
                    {prog.type}
                  </Badge>
                  {prog.addressesGap && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                      <Target className="w-3 h-3 text-brand-600" />
                      Bridges Identified Gap
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">{prog.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                  {prog.description}
                </p>

                {/* Targeted skills */}
                {prog.skills && prog.skills.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Skills Covered:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prog.skills.map((s: any, idx: number) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded"
                        >
                          {s.skill?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {prog.duration || 'Self-paced'} &bull; {prog.mode}
                  </span>
                  <span className="font-bold text-slate-900">{prog.price}</span>
                </div>

                {prog.matchResult && (
                  <div className="mb-4">
                    <SkillMatchBadge matchResult={prog.matchResult} />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openDetails(prog)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                >
                  View Details
                </button>

                {prog.isEnrolled ? (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3" />
                    Enrolled
                  </Badge>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleEnroll(prog.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No learning programs available"
          description={
            filterType === 'RECOMMENDED'
              ? 'No learning programs directly matching your identified skill gaps were found yet. Check back as new industry modules are published.'
              : 'Learning programs published by industry and academic partners will appear here.'
          }
        />
      )}

      {/* Program Details Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedProg?.title || 'Program Details'}>
        {selectedProg && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="purple">{selectedProg.type}</Badge>
              <Badge variant="default">{selectedProg.mode}</Badge>
              <span className="text-xs font-bold text-slate-700 ml-auto">{selectedProg.price}</span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">About This Program</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {selectedProg.description}
              </p>
            </div>

            {/* Skills Covered in Detail */}
            {selectedProg.skills && selectedProg.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1.5">Competencies Developed</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProg.skills.map((s: any) => (
                    <div
                      key={s.id}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs font-medium border border-purple-200 flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      {s.skill?.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-700 block">Duration:</span>
                {selectedProg.duration || 'Flexible'}
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Start Date:</span>
                {selectedProg.startDate || 'Immediate / Open Enrollment'}
              </div>
            </div>

            {selectedProg.url && (
              <div>
                <a
                  href={selectedProg.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Official Program Curriculum & Portal Link
                </a>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>

              {selectedProg.isEnrolled ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Already Registered
                </span>
              ) : (
                <button
                  type="button"
                  disabled={enrolling}
                  onClick={() => handleEnroll(selectedProg.id)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm"
                >
                  {enrolling ? 'Enrolling...' : 'Confirm & Register'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
