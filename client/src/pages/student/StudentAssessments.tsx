import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  CheckSquare,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  RotateCcw,
  BookOpen,
  Check,
} from 'lucide-react';

export const StudentAssessments: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Active taking test state
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Test result modal
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Practice / Reassessment Modal
  const [reassessModalOpen, setReassessModalOpen] = useState(false);
  const [subSkillOptions, setSubSkillOptions] = useState<any[]>([]);
  const [selectedReassessSubSkillId, setSelectedReassessSubSkillId] = useState<string>('');
  const [reassessScoreInput, setReassessScoreInput] = useState<number>(85);
  const [reassessing, setReassessing] = useState(false);
  const [reassessMessage, setReassessMessage] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  const fetchAssessments = () => {
    setLoading(true);
    Promise.all([
      api.get('/student/skill-assessment').catch(() => api.get('/assessments')),
      api.get('/student/granular-skills').catch(() => ({ data: { subSkillScores: [] } })),
    ])
      .then(([assessRes, skillsRes]) => {
        setAssessments(assessRes.data || []);
        setSubSkillOptions(skillsRes.data?.subSkillScores || []);
        if (skillsRes.data?.subSkillScores?.length > 0) {
          setSelectedReassessSubSkillId(skillsRes.data.subSkillScores[0].subSkillId);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Timer countdown management
  useEffect(() => {
    if (testModalOpen && timeLeftSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testModalOpen, timeLeftSeconds]);

  const handleStartTest = async (id: string) => {
    try {
      const res = await api.get(`/assessments/${id}`);
      setActiveTest(res.data);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setTimeLeftSeconds((res.data.durationMinutes || 30) * 60);
      setTestModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start assessment.');
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Submitting your answers automatically.');
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const responses = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    setSubmitting(true);
    try {
      const res = await api.post(`/assessments/${activeTest.id}/submit`, { responses });
      setTestResult(res.data);
      setTestModalOpen(false);
      setResultModalOpen(true);
      fetchAssessments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteReassess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReassessSubSkillId) return;
    setReassessing(true);
    try {
      const res = await api.post('/student/reassess-skill', {
        subSkillId: selectedReassessSubSkillId,
        scorePercentage: Number(reassessScoreInput),
        questionsAttempted: 10,
        questionsCorrect: Math.round((Number(reassessScoreInput) / 100) * 10),
      });

      setReassessMessage(`✓ Skill successfully reassessed! New score: ${res.data.scorePercentage}% (+${res.data.growthDelta}% delta). Proficiency: ${res.data.proficiencyLevel}`);
      setTimeout(() => {
        setReassessModalOpen(false);
        fetchAssessments();
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit reassessment');
    } finally {
      setReassessing(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const filteredAssessments = assessments.filter((test) => {
    if (activeTab === 'AYURVEDA') return test.category?.includes('Ayurveda') || test.domain === 'AYURVEDA';
    if (activeTab === 'ENGINEERING') return test.category?.includes('Engineering') || test.domain === 'ENGINEERING';
    if (activeTab === 'COMMERCE') return test.category?.includes('Commerce') || test.domain === 'COMMERCE';
    return true;
  });

  const currentQuestion = activeTest?.questions ? activeTest.questions[currentQuestionIndex] : null;
  const totalQuestions = activeTest?.questions ? activeTest.questions.length : 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  const getTierBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'EXPERT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">EXPERT</span>;
      case 'ADVANCED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">ADVANCED</span>;
      case 'INTERMEDIATE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">INTERMEDIATE</span>;
      case 'DEVELOPING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">DEVELOPING</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50">BEGINNER</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Technical Assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700/50 mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Granular Skill Question-to-Subskill Benchmarking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Industry & Technical Assessments
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Every question directly maps to granular sub-skills and topics. Complete assessments to generate instant diagnostic roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setReassessModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Practice / Reassess Skill</span>
          </button>
          <button
            onClick={() => navigate('/student/skill-mapping')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-900/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Roadmap View &rarr;</span>
          </button>
        </div>
      </div>

      {/* Domain Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['ALL', 'AYURVEDA', 'ENGINEERING', 'COMMERCE'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab === 'ALL' ? 'All Assessments' : tab === 'AYURVEDA' ? 'Ayurveda & Health' : tab === 'ENGINEERING' ? 'Engineering & IoT' : 'Commerce & Biz'}
          </button>
        ))}
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssessments.map((test) => (
          <div
            key={test.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  {test.category?.name || test.category || 'Technical Screening'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  {test.durationMinutes || 30} mins
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{test.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {test.description || test.instructions}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Passing Threshold: <strong className="text-slate-800 dark:text-slate-200">{test.passingScore || 75}%</strong></span>
                <span>Questions: <strong className="text-slate-800 dark:text-slate-200">{test.questions?.length || 7}</strong></span>
              </div>
            </div>

            <button
              onClick={() => handleStartTest(test.id)}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Taking Test Modal */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => {
          if (window.confirm('Are you sure you want to exit? Your current progress will be lost.')) {
            setTestModalOpen(false);
          }
        }}
        title={activeTest?.title || 'Technical Assessment'}
      >
        <div className="space-y-6">
          {/* Test Header with Timer & Progress */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-brand-600 dark:text-brand-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span>{answeredCount} Answered</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-200 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* Current Question Body */}
          {currentQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700/50">
                    Sub-Skill: {currentQuestion.subSkill?.name || currentQuestion.skill?.name || 'Core Concept'}
                  </span>
                  {currentQuestion.topicName && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Topic: {currentQuestion.topicName}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Difficulty: {currentQuestion.difficulty}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed pt-1">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQuestion.options?.map((opt: any) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-900/40 border-brand-500 text-brand-900 dark:text-white ring-1 ring-brand-500/50'
                          : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="leading-relaxed">{opt.optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitTest}
                className="px-6 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Post-Submission Granular Diagnostic Results Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Assessment Results & Granular Diagnostic"
      >
        {testResult && (
          <div className="space-y-6">
            {/* Score Banner */}
            <div className={`p-6 rounded-2xl border text-center space-y-2 ${
              testResult.passed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
            }`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                {testResult.passed ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASSED ASSESSMENT
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> BENCHMARK NOT REACHED
                  </span>
                )}
              </div>

              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {testResult.percentage}%
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Score Earned: {testResult.score} / {testResult.totalScore} points
              </p>
            </div>

            {/* Granular Sub-Skill Breakdown Table */}
            {testResult.granularAnalysis?.subSkillScores && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Granular Sub-Skill Performance Breakdown
                </h3>

                <div className="space-y-2">
                  {testResult.granularAnalysis.subSkillScores.map((sub: any) => (
                    <div
                      key={sub.subSkillId}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{sub.subSkillName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{sub.skillName} • {sub.questionsCorrect}/{sub.questionsTotal} correct</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-white">{sub.scorePercentage}%</span>
                        {getTierBadge(sub.proficiencyLevel)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Immediate AI Roadmap Next Step */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant AI Roadmap Updated
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your skill profile and customized learning phases have been dynamically recalibrated.
                </p>
              </div>

              <button
                onClick={() => {
                  setResultModalOpen(false);
                  navigate('/student/skill-mapping');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shrink-0"
              >
                View AI Roadmap &rarr;
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setResultModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Close Results
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Practice / Reassess Skill Modal */}
      <Modal
        isOpen={reassessModalOpen}
        onClose={() => setReassessModalOpen(false)}
        title="Practice & Reassess Granular Sub-Skill"
      >
        <form onSubmit={handleExecuteReassess} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Select a sub-skill to test your progress, simulate a practice assessment, and compute your latest growth delta.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Sub-Skill to Reassess
            </label>
            <select
              value={selectedReassessSubSkillId}
              onChange={(e) => setSelectedReassessSubSkillId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {subSkillOptions.map((s) => (
                <option key={s.subSkillId} value={s.subSkillId}>
                  {s.subSkillName} ({s.skillName}) - Current: {s.scorePercentage}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Practice / Reassessment Score (0 – 100%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={reassessScoreInput}
              onChange={(e) => setReassessScoreInput(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-bold"
              required
            />
          </div>

          {reassessMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold">
              {reassessMessage}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setReassessModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reassessing}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl disabled:opacity-50"
            >
              {reassessing ? 'Evaluating...' : 'Submit Reassessment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default StudentAssessments;
