import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Navbar } from '../../components/common/Navbar';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  School,
  Building2,
  CheckCircle2,
  Target,
  BarChart3,
  Award,
  BookOpen,
  Compass,
  Users,
  Search,
  ExternalLink,
  Laptop,
  HeartPulse,
  TrendingUp,
  Layers,
  Code2,
  Cpu,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

interface PlatformStats {
  totalStudents: number;
  totalAcademicians: number;
  totalCompanies: number;
  totalInstitutions: number;
  totalCourses: number;
  totalInternships: number;
  totalJobs: number;
  totalCollaborations: number;
  totalOpportunities: number;
}

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalStudents: 0,
    totalAcademicians: 0,
    totalCompanies: 0,
    totalInstitutions: 0,
    totalCourses: 0,
    totalInternships: 0,
    totalJobs: 0,
    totalCollaborations: 0,
    totalOpportunities: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api
      .get('/stats/public')
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error('Failed to load stats', err);
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-brand-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-800 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            National Academia–Industry Skill Mapping & Placement Ecosystem
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Connect Skills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600">Opportunities</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Bridging students, academia, and industry through skills, learning, internships, and career opportunities.
            Supporting multi-disciplinary talent across Healthcare, Engineering, Technology, Commerce, and Business with verified competency mapping.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              Explore Courses
            </Link>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Briefcase className="w-4 h-4 text-slate-500" />
              Explore Opportunities
            </Link>
          </div>

          {/* Academic Disciplines Distribution Banner */}
          <div className="mt-12 max-w-3xl mx-auto bg-white/90 backdrop-blur rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-center gap-2">
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              Supported Academic Disciplines & Active Ecosystem Weight
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                    Ayurveda & Healthcare
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-900">~62%</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">BAMS, MD, Panchakarma, Dravyaguna & Clinical Trials</p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-sky-600" />
                    Engineering & Technology
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-200/70 text-sky-900">~24%</span>
                </div>
                <p className="text-[11px] text-sky-700 mt-1">B.E, B.Tech, Embedded Systems, IoT, Web & Cloud</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    Commerce & Business
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200/70 text-purple-900">~14%</span>
                </div>
                <p className="text-[11px] text-purple-700 mt-1">B.Com, Financial Analysis, Excel & Digital Marketing</p>
              </div>
            </div>
          </div>

          {/* Dynamic Platform Analytics Cards (Real-Time Database Records) */}
          <div className="mt-10 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Platform Ecosystem (Real-Time Database Records)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Database
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {/* Card 1: Students */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <GraduationCap className="w-4 h-4 text-brand-600" />
                  <span className="text-[10px] text-slate-400">Multi-Discipline</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loadingStats ? '...' : stats.totalStudents}
                </div>
                <div className="text-xs text-slate-500 font-medium">Students Registered</div>
              </div>

              {/* Card 2: Academicians */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] text-slate-400">Verified Faculty</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loadingStats ? '...' : stats.totalAcademicians}
                </div>
                <div className="text-xs text-slate-500 font-medium">Academicians & Leads</div>
              </div>

              {/* Card 3: Industry Partners */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] text-slate-400">Hiring Partners</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loadingStats ? '...' : stats.totalCompanies}
                </div>
                <div className="text-xs text-slate-500 font-medium">Industry Partners</div>
              </div>

              {/* Card 4: Partner Institutions */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <School className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] text-slate-400">Colleges & Universities</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loadingStats ? '...' : stats.totalInstitutions}
                </div>
                <div className="text-xs text-slate-500 font-medium">Partner Institutions</div>
              </div>

              {/* Card 5: Published Courses */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span className="text-[10px] text-slate-400">Learning Hub</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loadingStats ? '...' : stats.totalCourses}
                </div>
                <div className="text-xs text-slate-500 font-medium">Published Courses</div>
              </div>

              {/* Card 6: Internships */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Target className="w-4 h-4 text-teal-600" />
                  <span className="text-[10px] text-slate-400">Stipend-Backed</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loadingStats ? '...' : stats.totalInternships}
                </div>
                <div className="text-xs text-slate-500 font-medium">Internship Openings</div>
              </div>

              {/* Card 7: Career Jobs */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] text-slate-400">Entry-Level</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loadingStats ? '...' : stats.totalJobs}
                </div>
                <div className="text-xs text-slate-500 font-medium">Job Opportunities</div>
              </div>

              {/* Card 8: Industry Collaborations */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Users className="w-4 h-4 text-rose-600" />
                  <span className="text-[10px] text-slate-400">MoUs & Projects</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loadingStats ? '...' : stats.totalCollaborations}
                </div>
                <div className="text-xs text-slate-500 font-medium">Industry Collaborations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 KEY GENERAL SECTIONS */}

      {/* Section 1: Explore Courses */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Learning Hub</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Explore Courses</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                Industry-aligned interactive curricula created by verified academicians and industry partners across disciplines.
              </p>
            </div>
            <Link
              to="/courses"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Browse All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course 1: Healthcare */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ayurveda & Healthcare
                  </span>
                  <span className="text-xs font-medium text-slate-500">10 Weeks</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Panchakarma Therapy</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  Hands-on training in classical purification procedures, Abhyanga, Swedana, and clinical detoxification regimens.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Panchakarma', 'Abhyanga', 'Swedana'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Dhanvantari Wellness</span>
                <span className="text-brand-600 font-semibold flex items-center gap-1">
                  View Syllabus <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Course 2: Engineering */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                    Engineering & Technology
                  </span>
                  <span className="text-xs font-medium text-slate-500">12 Weeks</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Full Stack Web Development</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  Modern full-stack web architecture with React, Node.js REST services, relational SQL databases, and cloud deployments.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['React', 'Node.js', 'SQL', 'JavaScript'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">TechNova Solutions</span>
                <span className="text-brand-600 font-semibold flex items-center gap-1">
                  View Syllabus <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Course 3: Commerce */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                    Commerce & Business
                  </span>
                  <span className="text-xs font-medium text-slate-500">8 Weeks</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Financial Analysis & Analytics</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  Financial statement analysis, corporate valuation, DCF modeling in Excel, and quantitative business intelligence.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Accounting', 'Financial Analysis', 'Excel'].map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Prof. S. Venkatraman (SICI)</span>
                <span className="text-brand-600 font-semibold flex items-center gap-1">
                  View Syllabus <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Build Your Skill Profile */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Competency Mapping</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">Build Your Skill Profile</h2>
            <p className="text-sm text-slate-600 mt-2">
              Standardized skill evaluations mapped across core academic and industry taxonomies.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Ayurveda Fundamentals', count: '12 Skills', icon: <HeartPulse className="w-5 h-5 text-emerald-600" />, domain: 'Healthcare' },
              { title: 'Clinical Diagnostics', count: '10 Skills', icon: <Search className="w-5 h-5 text-teal-600" />, domain: 'Healthcare' },
              { title: 'Full Stack & Web Dev', count: '8 Skills', icon: <Code2 className="w-5 h-5 text-sky-600" />, domain: 'Technology' },
              { title: 'Embedded & IoT Systems', count: '7 Skills', icon: <Cpu className="w-5 h-5 text-indigo-600" />, domain: 'Technology' },
              { title: 'Corporate Finance & Valuation', count: '6 Skills', icon: <Calculator className="w-5 h-5 text-purple-600" />, domain: 'Commerce' },
              { title: 'Digital Growth & Marketing', count: '5 Skills', icon: <TrendingUp className="w-5 h-5 text-rose-600" />, domain: 'Commerce' },
              { title: 'Clinical Trials & GCP', count: '6 Skills', icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />, domain: 'Healthcare' },
              { title: 'Cloud & Infrastructure', count: '5 Skills', icon: <Laptop className="w-5 h-5 text-blue-600" />, domain: 'Technology' },
            ].map((d) => (
              <div key={d.title} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
                  {d.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.domain}</span>
                <h3 className="text-xs font-bold text-slate-900 mt-0.5">{d.title}</h3>
                <span className="text-[11px] text-slate-500 font-medium">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Find Internships & Discover Career Opportunities */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Career Marketplace</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Find Internships & Careers</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                Real-time eligibility matching, required proficiency verification, and transparent stipend packages.
              </p>
            </div>
            <Link
              to="/opportunities"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Explore All Opportunities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Opp 1: Ayurveda */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ayurveda & Healthcare
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700">INR 20,000 / mo</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Panchakarma Therapy Intern</h3>
                <p className="text-xs text-slate-500 mb-3">Dhanvantari Wellness • Chennai</p>
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">BAMS</span>
                  <span>•</span>
                  <span>Min CGPA: 7.0</span>
                  <span>•</span>
                  <span>6 Months</span>
                </div>
              </div>
              <Link
                to="/opportunities"
                className="w-full py-2 text-center text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
              >
                Check Eligibility
              </Link>
            </div>

            {/* Opp 2: Engineering */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                    Engineering & Technology
                  </span>
                  <span className="text-xs font-extrabold text-sky-700">INR 30,000 / mo</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Full Stack Development Intern</h3>
                <p className="text-xs text-slate-500 mb-3">TechNova Solutions • Bengaluru</p>
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">B.Tech / B.E.</span>
                  <span>•</span>
                  <span>Min CGPA: 7.5</span>
                  <span>•</span>
                  <span>6 Months</span>
                </div>
              </div>
              <Link
                to="/opportunities"
                className="w-full py-2 text-center text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
              >
                Check Eligibility
              </Link>
            </div>

            {/* Opp 3: Commerce */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                    Commerce & Business
                  </span>
                  <span className="text-xs font-extrabold text-purple-700">INR 22,000 / mo</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Financial Analysis Intern</h3>
                <p className="text-xs text-slate-500 mb-3">FinEdge Consulting • Mumbai</p>
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">B.Com / BBA</span>
                  <span>•</span>
                  <span>Min CGPA: 7.5</span>
                  <span>•</span>
                  <span>6 Months</span>
                </div>
              </div>
              <Link
                to="/opportunities"
                className="w-full py-2 text-center text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
              >
                Check Eligibility
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Connect Academia & Industry */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Institutional Synergies</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">Connect Academia & Industry</h2>
            <p className="text-sm text-slate-600 mt-2">
              Facilitating formal MoUs, Faculty Development Programs (FDPs), sponsored hackathons, and joint research.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                Industry Workshop
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-3 mb-2">Careers in Ayurvedic Healthcare</h3>
              <p className="text-xs text-slate-600 mb-4">
                Interactive clinical seminar connecting BAMS scholars with senior hospital leaders and clinical researchers.
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                Initiator: Dhanvantari Wellness • Budget: INR 1.5L
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                National Hackathon
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-3 mb-2">IoT Innovation Challenge</h3>
              <p className="text-xs text-slate-600 mb-4">
                Inter-collegiate innovation hackathon designing low-power smart sensors and cloud-connected telemetry systems.
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                Initiator: TechNova Solutions • Budget: INR 3.0L
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                Executive Case Study
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-3 mb-2">Business Analytics Case Competition</h3>
              <p className="text-xs text-slate-600 mb-4">
                Data-driven business analysis challenge evaluating corporate financial statements and valuation strategies.
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                Initiator: FinEdge Consulting • Budget: INR 2.5L
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Build Your Digital Portfolio */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Verified Credentials</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Build Your Digital Portfolio</h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Showcase verified skills, course certifications, clinical case studies, technical code repositories, and industry internships on a tamper-proof digital profile.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  'Verifiable Digital Course Credentials with Unique IDs',
                  'Standardized Diagnostic & Technical Assessment Scores',
                  'Verified Academic CGPA & Degree Specialization Records',
                  'Live Application Pipeline & Employer Shortlisting Status',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  to="/student/portfolio"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all"
                >
                  View Digital Portfolio Demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Student Verified Portfolio</h4>
                  <p className="text-xs text-slate-500">Multi-Discipline Credential Profile</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-800 mb-1">Issued Digital Certificate</div>
                <div className="text-slate-500 font-mono text-[11px]">ID: CERT-AYU-DRAVYA-2026-MEERA</div>
                <div className="text-[10px] text-emerald-600 mt-1">✓ Verified by Sri Dhanvantari College & Kerala Herbal</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-800 mb-1">Issued Technical Certificate</div>
                <div className="text-slate-500 font-mono text-[11px]">ID: CERT-ENG-EMBED-2026-PRIYA</div>
                <div className="text-[10px] text-emerald-600 mt-1">✓ Verified by SSN College & Embedded Systems Labs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: From Classroom to Career */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">5-Step Progression</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">From Classroom to Career</h2>
            <p className="text-sm text-slate-600 mt-2">
              A transparent, automated progression taking any student from self-assessment to industry placement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Skill Assessment', desc: 'Take standardized evaluations across discipline domains.' },
              { step: '02', title: 'Skill Profile', desc: 'Map verified proficiency levels and strengths.' },
              { step: '03', title: 'Learning Hub', desc: 'Bridge identified skill gaps with accredited courses.' },
              { step: '04', title: 'Opportunities', desc: 'Unlock 1-click applications when fully eligible.' },
              { step: '05', title: 'Placement', desc: 'Receive interview calls and formal industry offers.' },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-xl font-extrabold text-brand-600 mb-1">{s.step}</div>
                <h3 className="text-xs font-bold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-[11px] text-slate-600 leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empowering the Entire Ecosystem */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Stakeholder Portals</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">Empowering the Entire Ecosystem</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <GraduationCap className="w-6 h-6 text-brand-600 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-2">For Students</h3>
              <p className="text-xs text-slate-600">Personalized skill gap analysis, recommended courses, and matched internships.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Briefcase className="w-6 h-6 text-purple-600 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-2">For Industry</h3>
              <p className="text-xs text-slate-600">Post internships, screen pre-verified applicants, and sponsor academic workshops.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Building2 className="w-6 h-6 text-amber-600 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-2">For Academicians</h3>
              <p className="text-xs text-slate-600">Publish accredited courses, manage research grants, and mentor student cohorts.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <School className="w-6 h-6 text-emerald-600 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-2">For Institutions</h3>
              <p className="text-xs text-slate-600">Department-wise placement intelligence, syllabus alignment, and employer MoUs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p className="text-slate-200 font-semibold text-sm mb-2">
            SkillBridge Portal — Academia–Industry Collaboration Platform
          </p>
          <p className="text-slate-500 mb-4">
            A Multi-Disciplinary National Platform for Skill Mapping, Learning, Internships, and Career Placements.
          </p>
          <p className="text-slate-600">© 2026 SkillBridge Platform. Built for SIH 2026.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
