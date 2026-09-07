import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Award,
} from 'lucide-react';

export const StudentCourseStudyRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [toggling, setToggling] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    if (id) fetchStudyRoom();
  }, [id]);

  const fetchStudyRoom = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses/' + id + '/study');
      setData(res.data);
      if (res.data.enrollment?.certificate) {
        setCertificate(res.data.enrollment.certificate);
      }
      if (res.data.course.modules && res.data.course.modules.length > 0) {
        for (const m of res.data.course.modules) {
          if (m.lessons && m.lessons.length > 0) {
            const firstUncompleted = m.lessons.find((l: any) => !l.isCompleted);
            setActiveLesson(firstUncompleted || m.lessons[0]);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load study room', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLesson = async () => {
    if (!activeLesson) return;
    try {
      setToggling(true);
      const newStatus = !activeLesson.isCompleted;
      await api.post('/courses/' + id + '/lessons/' + activeLesson.id + '/toggle', {
        isCompleted: newStatus,
      });
      setActiveLesson((prev: any) => ({ ...prev, isCompleted: newStatus }));
      const refresh = await api.get('/courses/' + id + '/study');
      setData(refresh.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update lesson progress.');
    } finally {
      setToggling(false);
    }
  };

  const handleClaimCertificate = async () => {
    try {
      setClaiming(true);
      const res = await api.post('/courses/' + id + '/certificate/request');
      setCertificate(res.data.certificate);
      setShowCertModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request certificate.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-500 font-medium">Entering interactive study classroom...</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-center max-w-md mx-auto bg-white rounded-3xl border border-slate-200 mt-8">
        <p className="text-sm font-semibold text-rose-600">You are not enrolled in this course or course not found.</p>
        <Link to="/student/courses" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="w-4 h-4" /> Browse Catalog
        </Link>
      </div>
    );
  }

  const course = data.course;
  const stats = data.stats;
  const is100Percent = stats.progressPercentage === 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/student/my-courses" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              &larr; My Courses
            </Link>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{course.category}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{course.title}</h1>
        </div>

        <div className="flex items-center gap-4 self-start md:self-auto">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 block">
              {stats.progressPercentage}% Completed
            </span>
            <span className="text-[11px] text-slate-400">
              {stats.completedLessons} of {stats.totalLessons} lessons finished
            </span>
          </div>
          <div className="w-24 h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={'h-full rounded-full transition-all duration-300 ' + (is100Percent ? 'bg-emerald-500' : 'bg-brand-600')}
              style={{ width: stats.progressPercentage + '%' }}
            />
          </div>
          {is100Percent && (
            <button
              onClick={certificate ? () => setShowCertModal(true) : handleClaimCertificate}
              disabled={claiming}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-500/20"
            >
              <Award className="w-4 h-4" />
              {certificate ? 'View Certificate' : 'Claim Certificate'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 max-h-[80vh] overflow-y-auto">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-4 h-4 text-brand-600" /> Course Modules & Lessons
          </h2>
          <div className="space-y-3">
            {course.modules.map((m: any, mIdx: number) => (
              <div key={m.id} className="border border-slate-200/70 rounded-2xl overflow-hidden bg-slate-50/40">
                <div className="p-3 bg-slate-100/60 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>Module {mIdx + 1}: {m.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {m.lessons?.length || 0} lessons
                  </span>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {m.lessons.map((l: any, lIdx: number) => {
                    const isActive = activeLesson?.id === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setActiveLesson(l)}
                        className={'w-full flex items-center justify-between p-3 text-left transition-colors text-xs ' + (isActive ? 'bg-brand-50/80 text-brand-900 font-semibold' : 'text-slate-700 hover:bg-slate-50')}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          {l.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{lIdx + 1}. {l.title}</span>
                        </div>
                        {l.durationMinutes && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {l.durationMinutes}m
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeLesson ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block">
                    Active Lesson
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{activeLesson.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={handleToggleLesson}
                  disabled={toggling}
                  className={'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm self-start sm:self-auto ' + (activeLesson.isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-brand-600 text-white hover:bg-brand-700')}
                >
                  {activeLesson.isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Lesson Completed (Click to Undo)
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" /> Mark as Complete
                    </>
                  )}
                </button>
              </div>

              {activeLesson.videoUrl && (
                <div className="rounded-2xl overflow-hidden bg-slate-900 p-4 text-center text-white text-xs">
                  <PlayCircle className="w-8 h-8 mx-auto mb-2 text-brand-400" />
                  <p className="font-semibold">Lecture Video Stream</p>
                  <a
                    href={activeLesson.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-[11px] text-brand-300 underline"
                  >
                    Open Video Lecture ({activeLesson.videoUrl})
                  </a>
                </div>
              )}

              <div className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                {activeLesson.content || 'No text notes attached to this lesson. Proceed with study activities and mark complete.'}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {activeLesson.durationMinutes ? activeLesson.durationMinutes + ' minutes estimated reading' : 'Self-paced lesson'}
                </span>
                <button
                  type="button"
                  onClick={handleToggleLesson}
                  disabled={toggling}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  {activeLesson.isCompleted ? 'Mark as Incomplete' : 'Done? Mark Complete →'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
              <p className="text-xs text-slate-400">Select a lesson from the left sidebar to begin studying.</p>
            </div>
          )}
        </div>
      </div>

      {showCertModal && certificate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-slate-200 shadow-2xl relative text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Certificate of Course Completion
              </span>
              <h3 className="text-xl font-bold text-slate-900">{certificate.courseTitle}</h3>
              <p className="text-xs text-slate-500">Issued to {certificate.studentName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Provider:</span>
                <span className="font-semibold text-slate-800">{certificate.providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Certificate Code:</span>
                <span className="font-mono font-bold text-slate-800">{certificate.certificateCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Status:</span>
                <span className={'font-bold px-2 py-0.5 rounded-full text-[10px] ' + (certificate.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                  {certificate.verificationStatus}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {certificate.verificationStatus === 'VERIFIED'
                ? 'This certificate has been verified and is linked to your Digital Portfolio.'
                : 'This certificate has been generated and is awaiting provider verification.'}
            </p>
            <button
              type="button"
              onClick={() => setShowCertModal(false)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};