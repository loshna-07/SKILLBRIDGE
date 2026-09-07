import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Skill } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  PlusCircle,
  Sparkles,
  AlertCircle,
  Check,
  ArrowRight,
  Save,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Clock,
  Award,
  Layers,
  ShieldCheck,
  Lock,
  FileQuestion,
} from 'lucide-react';

interface QuestionOptionState {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionState {
  id: string; // temporary or database id
  skillId: string;
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  options: QuestionOptionState[];
}

export const CreateOpportunity: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    type: 'INTERNSHIP',
    description: '',
    degree: '',
    department: '',
    minCgpa: '',
    experience: '',
    location: '',
    workMode: 'ON_SITE',
    stipendOrSalary: '',
    applicationDeadline: '',
    numberOfOpenings: 2,
    duration: '3 Months',
    startDate: '',
    responsibilities: '',
    selectionProcess: 'Resume Screening -> Technical Skill Assessment -> Technical Interview',
  });

  // Selected Skills: array of { skillId: string, isRequired: boolean }
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skillId: string; isRequired: boolean }>>([]);
  const [newSkillName, setNewSkillName] = useState('');

  // Assessment Configuration State
  const [assessmentRequired, setAssessmentRequired] = useState(true);
  const [assessmentLocked, setAssessmentLocked] = useState(false);
  const [assessmentMeta, setAssessmentMeta] = useState({
    title: '',
    description: '',
    duration: 30,
    passingScore: 75,
    instructions: 'Please answer all questions. Each question tests specific core competencies required for this role. There is no negative marking. The assessment will auto-submit when the timer expires.',
  });

  const [questions, setQuestions] = useState<QuestionState[]>([
    {
      id: 'temp-1',
      skillId: '',
      questionText: '',
      difficulty: 'MEDIUM',
      marks: 10,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  ]);

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

  useEffect(() => {
    api.get('/assessments/categories').then((res) => {
      setCategories(res.data);
      const flattened = res.data.flatMap((c: any) => c.skills || []);
      setAllSkills(flattened);
    });
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      api
        .get(`/opportunities/${id}`)
        .then((res) => {
          const opp = res.data;
          setForm({
            title: opp.title || '',
            type: opp.type || 'INTERNSHIP',
            description: opp.description || '',
            degree: opp.degree || '',
            department: opp.department || '',
            minCgpa: opp.minCgpa != null ? String(opp.minCgpa) : '',
            experience: opp.experience || '',
            location: opp.location || '',
            workMode: opp.workMode || 'ON_SITE',
            stipendOrSalary: opp.stipendOrSalary || '',
            applicationDeadline: opp.applicationDeadline ? opp.applicationDeadline.split('T')[0] : '',
            numberOfOpenings: opp.numberOfOpenings || 2,
            duration: opp.duration || '',
            startDate: opp.startDate || '',
            responsibilities: opp.responsibilities || '',
            selectionProcess: opp.selectionProcess || '',
          });

          setAssessmentRequired(opp.assessmentRequired ?? true);

          if (opp.skills && Array.isArray(opp.skills)) {
            setSelectedSkills(
              opp.skills.map((s: any) => ({
                skillId: s.skillId,
                isRequired: s.isRequired !== undefined ? s.isRequired : true,
              }))
            );
          }

          if (opp.assessment) {
            setAssessmentLocked(Boolean(opp.assessment.isLocked));
            setAssessmentMeta({
              title: opp.assessment.title || '',
              description: opp.assessment.description || '',
              duration: opp.assessment.duration || 30,
              passingScore: opp.assessment.passingScore || 60,
              instructions: opp.assessment.instructions || '',
            });

            if (opp.assessment.questions && opp.assessment.questions.length > 0) {
              setQuestions(
                opp.assessment.questions.map((q: any) => ({
                  id: q.id,
                  skillId: q.skillId || '',
                  questionText: q.questionText || '',
                  difficulty: q.difficulty || 'MEDIUM',
                  marks: q.marks || 10,
                  options: (q.options || []).map((o: any) => ({
                    id: o.id,
                    text: o.optionText || o.text || '',
                    isCorrect: Boolean(o.isCorrect),
                  })),
                }))
              );
            }
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to load opportunity details.');
        });
    }
  }, [id, isEdit]);

  // Sync default assessment title when opportunity title changes if not edited
  useEffect(() => {
    if (!isEdit && form.title && !assessmentMeta.title) {
      setAssessmentMeta((prev) => ({
        ...prev,
        title: `${form.title} Technical Assessment`,
        description: `Comprehensive evaluation of required competencies and problem-solving abilities for ${form.title}.`,
      }));
    }
  }, [form.title, isEdit]);

  const handleToggleSkill = (skillId: string, isRequired: boolean) => {
    const existingIndex = selectedSkills.findIndex((s) => s.skillId === skillId);
    if (existingIndex >= 0) {
      const copy = [...selectedSkills];
      if (copy[existingIndex].isRequired === isRequired) {
        copy.splice(existingIndex, 1);
      } else {
        copy[existingIndex].isRequired = isRequired;
      }
      setSelectedSkills(copy);
    } else {
      setSelectedSkills([...selectedSkills, { skillId, isRequired }]);
      if (questions.length > 0 && !questions[0].skillId) {
        const updatedQ = [...questions];
        updatedQ[0].skillId = skillId;
        setQuestions(updatedQ);
      }
    }
  };

  const handleCreateCustomSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      let categoryId = categories[0]?.id;
      if (!categoryId) {
        const catRes = await api.post('/assessments/categories', { name: 'General Domain' });
        categoryId = catRes.data.id;
      }
      const skillRes = await api.post('/assessments/skills', {
        categoryId,
        name: newSkillName.trim(),
      });
      setAllSkills([...allSkills, skillRes.data]);
      setSelectedSkills([...selectedSkills, { skillId: skillRes.data.id, isRequired: true }]);
      setNewSkillName('');
    } catch (err: any) {
      alert('Failed to add skill: ' + (err.response?.data?.message || err.message));
    }
  };

  // Question manipulation helpers
  const handleAddQuestion = () => {
    const defaultSkillId = selectedSkills[0]?.skillId || allSkills[0]?.id || '';
    setQuestions([
      ...questions,
      {
        id: `temp-${Date.now()}`,
        skillId: defaultSkillId,
        questionText: '',
        difficulty: 'MEDIUM',
        marks: 10,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('An assessment must have at least one question.');
      return;
    }
    const copy = [...questions];
    copy.splice(index, 1);
    setQuestions(copy);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuestionState>) => {
    const copy = [...questions];
    copy[index] = { ...copy[index], ...updates };
    setQuestions(copy);
  };

  const handleAddOption = (qIndex: number) => {
    const copy = [...questions];
    if (copy[qIndex].options.length >= 6) return;
    copy[qIndex].options.push({ text: '', isCorrect: false });
    setQuestions(copy);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const copy = [...questions];
    if (copy[qIndex].options.length <= 2) {
      alert('Each question must have at least 2 options.');
      return;
    }
    const wasCorrect = copy[qIndex].options[oIndex].isCorrect;
    copy[qIndex].options.splice(oIndex, 1);
    if (wasCorrect && copy[qIndex].options.length > 0) {
      copy[qIndex].options[0].isCorrect = true;
    }
    setQuestions(copy);
  };

  const handleSetCorrectOption = (qIndex: number, oIndex: number) => {
    const copy = [...questions];
    copy[qIndex].options = copy[qIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === oIndex,
    }));
    setQuestions(copy);
  };

  const handleUpdateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const copy = [...questions];
    copy[qIndex].options[oIndex].text = text;
    setQuestions(copy);
  };

  // Skill Coverage calculation
  const totalAssessmentMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const coveredSkillIds = new Set(questions.map((q) => q.skillId).filter(Boolean));
  const selectedReqSkillIds = selectedSkills.filter((s) => s.isRequired).map((s) => s.skillId);
  const coveredRequiredCount = selectedReqSkillIds.filter((id) => coveredSkillIds.has(id)).length;
  const coveragePercentage =
    selectedReqSkillIds.length > 0
      ? Math.round((coveredRequiredCount / selectedReqSkillIds.length) * 100)
      : 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedSkills.length === 0) {
      setError('Please select or specify at least one skill requirement for accurate matching.');
      return;
    }

    // Validate assessment if required
    if (assessmentRequired) {
      if (!assessmentMeta.title.trim()) {
        setError('Please provide a title for the candidate assessment.');
        return;
      }
      if (questions.length === 0) {
        setError('Please add at least one question to the candidate assessment.');
        return;
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim()) {
          setError(`Question #${i + 1} text cannot be empty.`);
          return;
        }
        if (!q.skillId) {
          setError(`Please select a mapped skill for Question #${i + 1}.`);
          return;
        }
        if (q.options.length < 2) {
          setError(`Question #${i + 1} must have at least 2 options.`);
          return;
        }
        const hasEmptyOption = q.options.some((o) => !o.text.trim());
        if (hasEmptyOption) {
          setError(`Question #${i + 1} contains blank options. Please fill or remove them.`);
          return;
        }
        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          setError(`Please select the correct answer for Question #${i + 1}.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        ...form,
        minCgpa: form.minCgpa ? parseFloat(form.minCgpa) : null,
        skillIds: selectedSkills,
        assessmentRequired,
      };

      if (assessmentRequired) {
        payload.assessment = {
          title: assessmentMeta.title || `${form.title} Technical Assessment`,
          description: assessmentMeta.description,
          duration: Number(assessmentMeta.duration) || 30,
          passingScore: 75,
          instructions: assessmentMeta.instructions,
          questions: questions.map((q) => ({
            id: q.id.startsWith('temp-') ? undefined : q.id,
            skillId: q.skillId,
            questionText: q.questionText,
            difficulty: q.difficulty,
            marks: Number(q.marks) || 10,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              isCorrect: o.isCorrect,
            })),
          })),
        };
      }

      if (isEdit && id) {
        await api.put(`/opportunities/${id}`, payload);
        alert('Opportunity and Assessment updated successfully!');
      } else {
        await api.post('/opportunities', payload);
        alert('Opportunity and Candidate Assessment published successfully!');
      }
      navigate('/industry/opportunities');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save opportunity.');
    } finally {
      setLoading(false);
    }
  };

  const getSkillName = (skillId: string) => {
    return allSkills.find((s) => s.id === skillId)?.name || 'Select Skill';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Industrial Opportunity & Assessment' : 'Post New Industrial Opportunity'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isEdit
            ? 'Update vacancy details, mandatory competencies, and role-specific candidate assessments.'
            : 'Specify technical criteria, academic qualifications, and configure tailored skill assessments for candidate screening.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-10">
        {/* Core Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
            1. Core Position Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Junior Full Stack Developer (React & Node.js)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="JOB">Full-Time Job</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="LIVE_PROJECT">Live Industrial Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode *</label>
              <select
                value={form.workMode}
                onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="ON_SITE">On-Site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description *</label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="High-level description of what the candidate will be building and team structure..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Skills Mapping Engine Criteria */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Required & Preferred Competencies (Skill Engine)
            </h3>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              {selectedSkills.length} Selected
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Select skills from the directory or type to add custom competencies. The candidate assessment and match compatibility will be evaluated against these.
          </p>

          {/* Add custom skill */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add new skill (e.g. React, Node.js, Panchakarma, Docker)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
            <button
              type="button"
              onClick={handleCreateCustomSkill}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
            >
              Add Skill
            </button>
          </div>

          {/* Available Skills Badges */}
          {allSkills.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Click to add as Required (Green) or Preferred (Blue):
              </span>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {allSkills.map((s) => {
                  const sel = selectedSkills.find((item) => item.skillId === s.id);
                  return (
                    <div
                      key={s.id}
                      className={`inline-flex items-center rounded-xl text-xs overflow-hidden border transition-all ${
                        sel
                          ? sel.isRequired
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-sky-500 bg-sky-50 text-sky-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(s.id, true)}
                        className={`px-2.5 py-1 text-xs hover:bg-black/5 ${
                          sel?.isRequired ? 'bg-emerald-600 text-white' : ''
                        }`}
                        title="Require this skill"
                      >
                        {sel?.isRequired && <Check className="w-3 h-3 inline mr-1" />}
                        {s.name} (Req)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(s.id, false)}
                        className={`px-2 py-1 text-[11px] border-l border-black/10 hover:bg-black/5 ${
                          sel && !sel.isRequired ? 'bg-sky-600 text-white' : 'text-slate-400'
                        }`}
                        title="Make skill preferred"
                      >
                        Pref
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Industry-Created Candidate Assessment Section */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                3. Industry Vacancy Skill Assessment
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configure customized technical questions that applicants must complete upon applying.
              </p>
            </div>

            {/* Assessment Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Require Assessment:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={assessmentRequired}
                  onChange={(e) => setAssessmentRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {assessmentLocked && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-800">
              <Lock className="w-4 h-4 shrink-0 text-amber-600" />
              <div>
                <span className="font-bold block">Assessment is Locked</span>
                <span>
                  Candidates have already submitted attempts for this evaluation. Questions and point values cannot be deleted or re-weighted to preserve historical application scores.
                </span>
              </div>
            </div>
          )}

          {assessmentRequired && (
            <div className="space-y-6 bg-slate-50/70 p-6 rounded-3xl border border-purple-100">
              {/* Assessment Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={assessmentMeta.title}
                    onChange={(e) => setAssessmentMeta({ ...assessmentMeta, title: e.target.value })}
                    placeholder="e.g., Full Stack Development Candidate Screening"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    required
                    value={assessmentMeta.duration}
                    onChange={(e) =>
                      setAssessmentMeta({ ...assessmentMeta, duration: parseInt(e.target.value, 10) || 30 })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Passing Cutoff (Fixed)
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-purple-200 bg-purple-50 text-purple-800">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>75% Minimum Benchmark</span>
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Candidate Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={assessmentMeta.instructions}
                    onChange={(e) =>
                      setAssessmentMeta({ ...assessmentMeta, instructions: e.target.value })
                    }
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Real-time Assessment Skill Coverage Summary */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Assessment Competency Coverage
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 font-medium">
                      Questions: <strong className="text-slate-900">{questions.length}</strong>
                    </span>
                    <span className="text-slate-600 font-medium">
                      Total Marks: <strong className="text-purple-700">{totalAssessmentMarks}</strong>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        coveragePercentage === 100
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      Coverage: {coveragePercentage}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                  {selectedSkills.map((sk) => {
                    const skillName = getSkillName(sk.skillId);
                    const qCount = questions.filter((q) => q.skillId === sk.skillId).length;
                    const isCovered = qCount > 0;
                    return (
                      <span
                        key={sk.skillId}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border ${
                          isCovered
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sk.isRequired
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isCovered ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        {skillName}: {qCount} {qCount === 1 ? 'Q' : 'Qs'}
                        {sk.isRequired && !isCovered && ' (Uncovered Req)'}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Questions & Answer Keys ({questions.length})
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview Assessment
                    </button>

                    {!assessmentLocked && (
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add Question
                      </button>
                    )}
                  </div>
                </div>

                {questions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 transition-all"
                  >
                    {/* Question Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                          {qIndex + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Question #{qIndex + 1}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Skill selection */}
                        <select
                          disabled={assessmentLocked}
                          value={q.skillId}
                          onChange={(e) => handleUpdateQuestion(qIndex, { skillId: e.target.value })}
                          className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                        >
                          <option value="">-- Map to Skill --</option>
                          {/* First show selected skills */}
                          {selectedSkills.map((s) => (
                            <option key={s.skillId} value={s.skillId}>
                              {getSkillName(s.skillId)} (Vacancy Skill)
                            </option>
                          ))}
                          {/* Then show other skills */}
                          {allSkills
                            .filter((s) => !selectedSkills.some((sel) => sel.skillId === s.id))
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                        </select>

                        {/* Difficulty */}
                        <select
                          disabled={assessmentLocked}
                          value={q.difficulty}
                          onChange={(e) =>
                            handleUpdateQuestion(qIndex, {
                              difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD',
                            })
                          }
                          className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>

                        {/* Marks */}
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <span>Marks:</span>
                          <input
                            type="number"
                            disabled={assessmentLocked}
                            min="1"
                            max="50"
                            value={q.marks}
                            onChange={(e) =>
                              handleUpdateQuestion(qIndex, { marks: parseInt(e.target.value, 10) || 5 })
                            }
                            className="w-14 px-2 py-1 text-xs rounded-lg border border-slate-200 text-center bg-white"
                          />
                        </div>

                        {!assessmentLocked && questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                            title="Remove Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Question Prompt / Problem Statement *
                      </label>
                      <textarea
                        rows={2}
                        required
                        disabled={assessmentLocked}
                        value={q.questionText}
                        onChange={(e) => handleUpdateQuestion(qIndex, { questionText: e.target.value })}
                        placeholder="e.g., Which data structure provides O(1) average lookup time and how is collision resolved in hash maps?"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Options (Select the correct answer radio button):
                        </span>
                        {!assessmentLocked && q.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIndex)}
                            className="text-[11px] text-purple-700 font-semibold hover:underline"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIndex) => (
                          <div
                            key={oIndex}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              opt.isCorrect
                                ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-option-${qIndex}`}
                              checked={opt.isCorrect}
                              disabled={assessmentLocked}
                              onChange={() => handleSetCorrectOption(qIndex, oIndex)}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              required
                              disabled={assessmentLocked}
                              value={opt.text}
                              onChange={(e) =>
                                handleUpdateOptionText(qIndex, oIndex, e.target.value)
                              }
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}...`}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border-0 bg-transparent focus:ring-0 focus:outline-none font-medium text-slate-800"
                            />
                            {!assessmentLocked && q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIndex, oIndex)}
                                className="text-slate-300 hover:text-rose-500 px-1"
                                title="Delete option"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Academic & Compensation Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
            4. Academic Eligibility & Compensation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Degree</label>
              <input
                type="text"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                placeholder="e.g., B.Tech / B.E. / BAMS"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g., Computer Science / IT / Kayachikitsa"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={form.minCgpa}
                onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
                placeholder="e.g., 7.5"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, State"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stipend or Salary</label>
              <input
                type="text"
                value={form.stipendOrSalary}
                onChange={(e) => setForm({ ...form, stipendOrSalary: e.target.value })}
                placeholder="e.g., ₹25,000 / month"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Openings</label>
              <input
                type="number"
                min="1"
                value={form.numberOfOpenings}
                onChange={(e) => setForm({ ...form, numberOfOpenings: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g., 6 Months"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                value={form.applicationDeadline}
                onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="text"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                placeholder="e.g., Immediate / July 2026"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Responsibilities & Selection Process */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
            5. Execution & Selection Process
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Responsibilities</label>
              <textarea
                rows={3}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                placeholder="Day-to-day duties and project scope..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selection Process</label>
              <textarea
                rows={3}
                value={form.selectionProcess}
                onChange={(e) => setForm({ ...form, selectionProcess: e.target.value })}
                placeholder="Stages of evaluation..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/industry/opportunities')}
            className="px-5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 disabled:opacity-50"
          >
            {isEdit ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {isEdit
              ? loading
                ? 'Saving Changes...'
                : 'Save Changes'
              : loading
              ? 'Publishing...'
              : 'Publish Opportunity & Assessment'}
          </button>
        </div>
      </form>

      {/* Candidate Assessment Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Candidate Assessment Preview (Interactive Test Simulation)"
        maxWidth="3xl"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{assessmentMeta.title || 'Vacancy Assessment'}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{form.title || 'Industrial Position'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-purple-700">
                <Clock className="w-3.5 h-3.5" />
                {assessmentMeta.duration} Mins
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-emerald-700">
                Passing: {assessmentMeta.passingScore}%
              </div>
            </div>
          </div>

          {/* Instructions */}
          {assessmentMeta.instructions && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-700 block mb-0.5">Instructions to Candidate:</span>
              {assessmentMeta.instructions}
            </div>
          )}

          {/* Question Stepper */}
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPreviewQuestionIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  previewQuestionIndex === idx
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Question Display */}
          {questions[previewQuestionIndex] && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="purple">
                    Question {previewQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <Badge variant="info">
                    {getSkillName(questions[previewQuestionIndex].skillId)}
                  </Badge>
                  <Badge variant="default">
                    {questions[previewQuestionIndex].difficulty}
                  </Badge>
                </div>
                <span className="text-xs font-bold text-purple-700">
                  +{questions[previewQuestionIndex].marks} Marks
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-900 leading-relaxed pt-1">
                {questions[previewQuestionIndex].questionText || '(No question text provided)'}
              </div>

              <div className="space-y-2 pt-2">
                {questions[previewQuestionIndex].options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      opt.isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300 font-semibold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] bg-white">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt.text || '(Empty option)'}</span>
                    </div>
                    {opt.isCorrect && (
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                        Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={previewQuestionIndex === 0}
              onClick={() => setPreviewQuestionIndex((p) => Math.max(0, p - 1))}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40"
            >
              Previous Question
            </button>
            <button
              type="button"
              disabled={previewQuestionIndex === questions.length - 1}
              onClick={() => setPreviewQuestionIndex((p) => Math.min(questions.length - 1, p + 1))}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-40"
            >
              Next Question
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
