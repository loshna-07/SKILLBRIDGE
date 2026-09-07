import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Laptop,
  CheckCircle2,
  Award,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  Tag,
  GraduationCap,
  CheckSquare,
} from 'lucide-react';

export const StudentCourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses/' + id);
      setCourse(res.data);
      if (res.data.modules && res.data.modules.length > 0) {
        setOpenModuleIds(new Set([res.data.modules[0].id]));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await api.post('/courses/' + id + '/enroll');
      navigate('/student/my-courses/' + id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading course details...</div>;
  }

  if (error || !course) {
    return (
      <div className="p-8 text-center max-w-md mx-auto bg-white rounded-3xl border border-slate-200 mt-8">
        <p className="text-sm font-semibold text-rose-600">{error || 'Course not found'}</p>
        <Link to="/student/courses" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const isEnrolled = Boolean(course.enrollment);
  const totalLessons = course.modules ? course.modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <Link to="/student/courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            <BookOpen className="w-3.5 h-3.5" /> {course.category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 uppercase tracking-wider">
            {course.skillLevel}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          {course.title}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-6">
          {course.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-8">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Duration</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {course.duration}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Delivery Mode</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Laptop className="w-3.5 h-3.5 text-slate-500" /> {course.mode}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Curriculum</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> {course.modules?.length || 0} Modules ({totalLessons} Lessons)
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Certificate</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> {course.certificateAvailable ? 'Available' : 'None'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">Offered by</span>
            <span className="font-bold text-sm text-slate-900">{course.providerName}</span>
            <span className="text-xs text-slate-500 ml-2">({course.providerRole})</span>
          </div>

          {isEnrolled ? (
            <Link
              to={'/student/my-courses/' + course.id}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Go to Classroom ({course.enrollment.progressPercentage}% done)
            </Link>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-brand-500/20"
            >
              <GraduationCap className="w-4 h-4" /> {enrolling ? 'Enrolling...' : 'Enroll in Course'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {course.learningOutcomes && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" /> What You Will Learn
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {course.learningOutcomes}
              </p>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" /> Course Curriculum & Syllabus
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {course.modules?.length || 0} Modules &bull; {totalLessons} Lessons
              </span>
            </div>

            {!course.modules || course.modules.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">Syllabus is currently being finalized by the provider.</p>
            ) : (
              <div className="space-y-3">
                {course.modules.map((m: any, mIdx: number) => {
                  const isOpen = openModuleIds.has(m.id);
                  return (
                    <div key={m.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleModule(m.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
                            Module {mIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{m.lessons?.length || 0} Lessons</span>
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && m.lessons && m.lessons.length > 0 && (
                        <div className="divide-y divide-slate-100 bg-white">
                          {m.lessons.map((l: any, lIdx: number) => {
                            const isDone = course.completedLessonIds?.includes(l.id);
                            return (
                              <div key={l.id} className="p-3 px-4 flex items-center justify-between text-xs text-slate-700 hover:bg-slate-50/50">
                                <div className="flex items-center gap-2.5">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                  <span>{lIdx + 1}. {l.title}</span>
                                </div>
                                {l.durationMinutes && (
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {l.durationMinutes} mins
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {course.skills && course.skills.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Skills Covered</h3>
              <div className="flex flex-wrap gap-1.5">
                {course.skills.map((s: any) => (
                  <span key={s.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
                    <Tag className="w-3 h-3" /> {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {course.prerequisites && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Prerequisites</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {course.prerequisites}
              </p>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Provider Information</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                {course.providerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{course.providerName}</h4>
                <span className="text-[11px] text-slate-400">{course.providerRole}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Verified educational contributor on SkillBridge. Curriculums align with academic credits and industry standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};