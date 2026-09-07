import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  Building2,
  BookOpen,
  Briefcase,
  TrendingUp,
  Sparkles,
  CalendarCheck,
  FileText,
  Users,
  Award,
  AlertTriangle,
  GraduationCap,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AcademicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/academician/dashboard'),
      api.get('/academician/recommendations').catch(() => ({ data: null })),
    ])
      .then(([dashRes, recRes]) => {
        setData(dashRes.data);
        setRecommendations(recRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-brand-600 p-6 sm:p-8 text-white shadow-lg shadow-amber-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur border border-white/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Academician Faculty & Research Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {data?.academician?.fullName || user?.profile?.fullName || 'Faculty Member'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
              {data?.academician?.designation || 'Professor'} &bull; {data?.academician?.department} &bull;{' '}
              {data?.academician?.institutionName}
            </p>
          </div>

          <Link
            to="/academician/profile"
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-amber-900 bg-white hover:bg-amber-50 rounded-2xl shadow-md transition-all shrink-0"
          >
            Update Faculty Profile
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Open Opportunities"
          value={data?.stats?.totalOpportunities || 0}
          subtitle="Across 9 modules"
          icon={Sparkles}
          color="amber"
        />
        <StatCard
          title="My Participations"
          value={data?.stats?.myParticipationsCount || 0}
          subtitle="Applied & registered"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Confirmed Engagements"
          value={data?.stats?.acceptedParticipationsCount || 0}
          subtitle="Accepted engagements"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="FDP & Workshops"
          value={(data?.stats?.fdpCount || 0) + (data?.stats?.workshopCount || 0)}
          subtitle="Training offerings"
          icon={BookOpen}
          color="purple"
        />
      </div>

      {/* 9 Modules Quick Access */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Academician Collaboration Modules</h2>
            <p className="text-xs text-slate-500">Explore and register across all 9 academician programs</p>
          </div>
          <Link
            to="/academician/opportunities"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { key: 'FACULTY_INTERNSHIP', label: 'Faculty Internships', count: data?.stats?.facultyInternships || 0 },
            { key: 'INDUSTRIAL_TRAINING', label: 'Industrial Training', count: data?.stats?.industrialTraining || 0 },
            { key: 'FDP', label: 'FDPs', count: data?.stats?.fdpCount || 0 },
            { key: 'CONSULTANCY', label: 'Consultancy', count: data?.stats?.consultancyCount || 0 },
            { key: 'RESEARCH', label: 'Research Collab', count: data?.stats?.researchCount || 0 },
            { key: 'WORKSHOP', label: 'Workshops', count: data?.stats?.workshopCount || 0 },
            { key: 'GUEST_LECTURE', label: 'Guest Lectures', count: data?.stats?.guestLectureCount || 0 },
            { key: 'MENTORSHIP', label: 'Mentorship', count: data?.stats?.mentorshipCount || 0 },
            { key: 'LIVE_PROJECT', label: 'Live Projects', count: data?.stats?.liveProjectCount || 0 },
          ].map((mod) => (
            <Link
              key={mod.key}
              to={`/academician/opportunities?type=${mod.key}`}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50 hover:border-amber-200 transition-all text-left group"
            >
              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 leading-tight">
                {mod.label}
              </p>
              <p className="text-[11px] text-slate-500 group-hover:text-amber-700 mt-1">
                {mod.count} Open
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Personalized Academic Recommendations & Intelligence */}
      {recommendations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Research Student Matches */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                  Top Student Talent For Research
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-achieving students in your institution matching your academic discipline.
                </p>
              </div>
            </div>

            {recommendations.topResearchStudents?.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No student talent identified yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recommendations.topResearchStudents.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{s.fullName}</span>
                      <span className="text-[11px] text-slate-500">
                        {s.degree} &bull; {s.department}
                      </span>
                      {s.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.skills.map((sk: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                        CGPA: {s.cgpa || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Curriculum Gaps */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Department Curriculum Gaps
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High industry demand skills with limited course coverage in your domain.
                  </p>
                </div>
              </div>

              {recommendations.curriculumGaps?.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  Curriculum aligned with industry demand.
                </p>
              ) : (
                <div className="space-y-2.5 mt-3">
                  {recommendations.curriculumGaps.map((gap: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{gap.skillName}</span>
                        <span className="text-[11px] text-slate-500">
                          Demanded in {gap.demandCount} industry postings
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-800">
                        {gap.courseCount} courses available
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                to="/academician/courses"
                className="text-amber-700 hover:text-amber-800 font-bold"
              >
                Propose New Course / Workshop &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
