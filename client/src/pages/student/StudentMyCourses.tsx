import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  Award,
  PlayCircle,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export const StudentMyCourses: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses/my/enrolled');
      setEnrolledCourses(res.data);
    } catch (err) {
      console.error('Failed to load enrolled courses', err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = enrolledCourses.filter((c) => c.status === 'COMPLETED').length;
  const inProgressCount = enrolledCourses.filter((c) => c.status !== 'COMPLETED').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 mb-2">
            <GraduationCap className="w-3.5 h-3.5" /> Student Learning Hub
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Enrolled Courses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real lesson completion, resume video lectures, and claim verified digital certificates.
          </p>
        </div>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm self-start md:self-auto"
        >
          <BookOpen className="w-4 h-4" /> Explore Course Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Enrolled</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{enrolledCourses.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Progress</span>
          <p className="text-2xl font-bold text-brand-600 mt-1">{inProgressCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Courses</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading your courses...</div>
      ) : enrolledCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="You have not enrolled in any courses yet."
          description="Browse our comprehensive catalog of industry and academic courses to bridge your skill gaps and earn certificates."
          actionText="Explore Courses"
          onAction={() => { window.location.href = '/student/courses'; }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((enr) => {
            const course = enr.course;
            const isCompleted = enr.status === 'COMPLETED' || enr.progressPercentage === 100;

            return (
              <div
                key={enr.enrollmentId}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                      {course.category}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        <Clock className="w-3 h-3" /> In Progress
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {course.description}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Course Progress</span>
                      <span>{enr.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={'h-full rounded-full transition-all duration-300 ' + (isCompleted ? 'bg-emerald-500' : 'bg-brand-600')}
                        style={{ width: enr.progressPercentage + '%' }}
                      />
                    </div>
                  </div>

                  {enr.certificate && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Cert: {enr.certificate.verificationStatus}</span>
                      </div>
                      <span className="font-mono font-bold text-[10px]">{enr.certificate.certificateCode}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 truncate max-w-[120px]">By {course.providerName}</span>
                  <Link
                    to={'/student/my-courses/' + course.id}
                    className={'inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ' + (isCompleted ? 'text-slate-700 bg-slate-100 hover:bg-slate-200' : 'text-white bg-brand-600 hover:bg-brand-700')}
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> {isCompleted ? 'Review Lessons' : 'Continue Study'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};