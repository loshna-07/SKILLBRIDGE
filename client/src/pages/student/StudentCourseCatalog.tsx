import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  Search,
  Sparkles,
  Clock,
  Laptop,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Tag,
  GraduationCap,
  Building,
  School,
  Briefcase,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export const StudentCourseCatalog: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [providerRole, setProviderRole] = useState('ALL');
  const [skillLevel, setSkillLevel] = useState('ALL');
  const [mode, setMode] = useState('ALL');

  useEffect(() => {
    fetchCourses();
    fetchRecommendations();
  }, [providerRole, skillLevel, mode]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (providerRole !== 'ALL') params.append('providerRole', providerRole);
      if (skillLevel !== 'ALL') params.append('skillLevel', skillLevel);
      if (mode !== 'ALL') params.append('mode', mode);

      const res = await api.get('/courses?' + params.toString());
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecLoading(true);
      const res = await api.get('/courses/recommendations');
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const getProviderBadge = (role: string) => {
    switch (role) {
      case 'INDUSTRY':
        return {
          label: 'Industry Verified',
          icon: Briefcase,
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'ACADEMICIAN':
        return {
          label: 'Academic Faculty',
          icon: Building,
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'INSTITUTION':
        return {
          label: 'National Institute',
          icon: School,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      default:
        return {
          label: 'Course Provider',
          icon: GraduationCap,
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-700 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            SkillBridge Learning Hub
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Certified Courses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Industry masterclasses, academic curricula, and institutional certifications mapped to career skills.
          </p>
        </div>
        <Link
          to="/student/my-courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors border border-brand-200 self-start md:self-auto"
        >
          <GraduationCap className="w-4 h-4" />
          My Enrolled Courses
        </Link>
      </div>

      <div className="bg-gradient-to-br from-brand-50/70 via-sky-50/40 to-slate-50 p-6 sm:p-8 rounded-3xl border border-brand-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended for Your Skill Gaps</h2>
            <p className="text-xs text-slate-500">
              Matched automatically against your competency evaluations and industry market demand.
            </p>
          </div>
        </div>

        {recLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            Analyzing skill gap recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="mt-4 p-6 rounded-2xl bg-white/80 border border-slate-200/80 text-center">
            <p className="text-xs font-semibold text-slate-700">No courses currently match your identified skill gaps.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Take more assessments or browse the complete course catalog below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-brand-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {rec.matchPercentage}% Match
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {rec.course.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {rec.course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rec.course.description}</p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-1">Target Gaps Addressed:</span>
                    <div className="flex flex-wrap gap-1">
                      {rec.addressedGaps.map((gap: string, gIdx: number) => (
                        <span
                          key={gIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-brand-200 text-brand-700 font-semibold text-[10px]"
                        >
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[140px]">
                    By {rec.course.providerName}
                  </span>
                  <Link
                    to={'/student/courses/' + rec.course.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course title, skill, provider, or category..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Filters:</span>
          <select
            value={providerRole}
            onChange={(e) => setProviderRole(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Providers</option>
            <option value="INDUSTRY">Industry Partners</option>
            <option value="ACADEMICIAN">Academic Faculty</option>
            <option value="INSTITUTION">National Institutions</option>
          </select>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Skill Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Delivery Modes</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline / Campus</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          {(providerRole !== 'ALL' || skillLevel !== 'ALL' || mode !== 'ALL' || search) && (
            <button
              onClick={() => {
                setProviderRole('ALL');
                setSkillLevel('ALL');
                setMode('ALL');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">All Published Courses ({courses.length})</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading course catalog...</div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses available yet."
            description="There are currently no published courses matching your filter criteria. Check back soon as course providers publish new curriculums."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const badge = getProviderBadge(course.providerRole);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ' + badge.className}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {course.skillLevel}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 mb-4">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {course.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <Laptop className="w-3 h-3 text-slate-400" />
                        {course.mode}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        {course.totalLessons} Lessons
                      </span>
                    </div>
                    {course.skills && course.skills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Skills Gained:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {course.skills.slice(0, 3).map((s: any) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-semibold"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {s.name}
                            </span>
                          ))}
                          {course.skills.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                              +{course.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Provider</p>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                        {course.providerName}
                      </p>
                    </div>
                    {course.isEnrolled ? (
                      <Link
                        to={'/student/my-courses/' + course.id}
                        className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        In Progress ({course.enrollmentProgress}%)
                      </Link>
                    ) : (
                      <Link
                        to={'/student/courses/' + course.id}
                        className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                      >
                        View Course
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};