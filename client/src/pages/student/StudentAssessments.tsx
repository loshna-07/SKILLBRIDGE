import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Assessment } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
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

  const timerRef = useRef<any>(null);

  const fetchAssessments = () => {
    setLoading(true);
    api
      .get('/student/skill-assessment')
      .then((res) => setAssessments(res.data))
      .catch(() => {
        api.get('/assessments').then((res) => setAssessments(res.data));
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
      setTimeLeftSeconds((res.data.durationMinutes || 25) * 60);
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

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const filteredAssessments = assessments.filter((test) => {
    if (activeTab === 'RECOMMENDED') return test.isDomainMatch;
    if (activeTab === 'AYURVEDA') return test.category?.includes('Ayurveda') || test.domain === 'AYURVEDA';
    if (activeTab === 'ENGINEERING') return test.category?.includes('Engineering') || test.domain === 'ENGINEERING';
    if (activeTab === 'COMMERCE') return test.category?.includes('Commerce') || test.domain === 'COMMERCE';
    return true;
  });

  const currentQuestion = activeTest?.questions ? activeTest.questions[currentQuestionIndex] : null;
  const totalQuestions = activeTest?.questions ? activeTest.questions.length : 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Standardized Skill Benchmarking
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Skill Assessments</h1>
          <p className="text-sm text-slate-600 mt-1">
            Validate your clinical, technological, and corporate competencies through standardized assessments.
            Results directly calculate your skill profile scores and unlock targeted job recommendations.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/skill-mapping')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-sm transition-all shrink-0"
        >
          <TrendingUp className="w-4 h-4 text-brand-400" />
          <span>View Skill Mapping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'All Assessments' },
          { id: 'RECOMMENDED', label: 'Recommended for You' },
          { id: 'AYURVEDA', label: 'Ayurveda & Healthcare' },
          { id: 'ENGINEERING', label: 'Engineering & Tech' },
          { id: 'COMMERCE', label: 'Commerce & Business' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {test.isDomainMatch && (
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                  Career Match
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="info" size="sm">
                    {test.category}
                  </Badge>
                  {test.latestAttempt && (
                    <Badge variant={test.latestAttempt.passed ? 'success' : 'danger'} size="sm">
                      {test.latestAttempt.passed ? 'Passed' : 'Needs Retake'} ({test.latestAttempt.percentage}%)
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{test.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {test.description || 'Comprehensive evaluation covering core principles and applied knowledge.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl mb-6 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{test.durationMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{test.questionsCount || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Passing Score: {test.passingScore}%</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStartTest(test.id)}
                className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                  test.latestAttempt
                    ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                    : 'text-white bg-brand-600 hover:bg-brand-700'
                }`}
              >
                <span>{test.latestAttempt ? 'Retake Assessment' : 'Take Assessment'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No assessments found"
          description="There are currently no assessments matching the selected filter."
        />
      )}

      {/* Interactive Step-by-Step Test Runner Modal */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => {
          if (window.confirm('Are you sure you want to exit? Your progress will not be saved.')) {
            setTestModalOpen(false);
          }
        }}
        title={activeTest?.title || 'Skill Assessment'}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Runner Top Status Bar */}
          <div className="p-3 bg-slate-900 rounded-xl text-white flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Progress:</span>
              <span className="font-bold text-white">
                {answeredCount} / {totalQuestions} Answered
              </span>
            </div>
            <div className={`flex items-center gap-1.5 font-mono font-bold px-3 py-1 rounded-lg ${
              timeLeftSeconds < 300 ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-800 text-brand-300'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* Question Index Navigator */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100">
            {activeTest?.questions?.map((q: any, idx: number) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = Boolean(selectedAnswers[q.id]);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-brand-600 text-white ring-2 ring-brand-500 ring-offset-1'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Panel */}
          {currentQuestion ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {currentQuestion.difficulty}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {currentQuestion.weightage} pt{currentQuestion.weightage === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {currentQuestion.questionText}
                </p>

                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options?.map((opt: any) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/70 text-brand-900 font-semibold ring-1 ring-brand-600/30'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
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

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitTest}
                      className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      {submitting ? 'Submitting & Evaluating...' : 'Submit Assessment'}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">
              No questions found for this assessment.
            </p>
          )}
        </div>
      </Modal>

      {/* Test Results Breakdown Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Assessment Result & Skill Mapping"
        maxWidth="lg"
      >
        {testResult && (
          <div className="space-y-6 text-center">
            <div
              className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border ${
                testResult.passed
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}
            >
              {testResult.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {testResult.passed ? 'Assessment Passed Successfully!' : 'Assessment Completed'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your skill competencies and profile scores have been updated in PostgreSQL.
              </p>
              <div className="mt-4 inline-flex items-baseline gap-2 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-2xl">
                <span className="text-3xl font-extrabold text-slate-900">{testResult.percentage}%</span>
                <span className="text-xs text-slate-500">
                  ({testResult.score} / {testResult.totalScore} Points)
                </span>
              </div>
            </div>

            {/* Per-Skill Breakdown */}
            {testResult.skillBreakdown && testResult.skillBreakdown.length > 0 && (
              <div className="text-left space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">
                  Skill Competency Evaluation:
                </span>
                <div className="space-y-2">
                  {testResult.skillBreakdown.map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{item.skill}</span>
                        <span className="text-[10px] text-slate-500 block">Level: {item.level}</span>
                      </div>
                      <span className={`text-xs font-bold ${item.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="text-left space-y-4 pt-2 border-t border-slate-100">
              {testResult.strengths && testResult.strengths.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-emerald-700 block mb-1.5">
                    Demonstrated Strengths (Score ≥ 70%):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {testResult.strengths.map((str: string, i: number) => (
                      <span
                        key={i}
                        className="bg-emerald-100 text-emerald-800 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {str}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {testResult.weaknesses && testResult.weaknesses.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-amber-700 block mb-1.5">
                    Areas for Improvement:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {testResult.weaknesses.map((w: string, i: number) => (
                      <span
                        key={i}
                        className="bg-amber-100 text-amber-800 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {testResult.skillGaps && testResult.skillGaps.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Identified Competency Gaps:
                  </span>
                  <div className="space-y-1 pt-1">
                    {testResult.skillGaps.map((gap: any, i: number) => (
                      <p key={i} className="text-[11px] text-rose-700">
                        • <span className="font-semibold">{gap.skill}</span>: {gap.description}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setResultModalOpen(false);
                  navigate('/student/skill-mapping');
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Explore Skill Mapping & Pathways</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setResultModalOpen(false)}
                className="py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
