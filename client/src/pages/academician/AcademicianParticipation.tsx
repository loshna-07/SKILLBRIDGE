import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  Sparkles,
  Award,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const AcademicianParticipation: React.FC = () => {
  const [participations, setParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academician/participations');
      setParticipations(res.data);
    } catch (err) {
      console.error('Failed to load participations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipations();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw your participation?')) return;
    try {
      await api.post(`/academician/participations/${applicationId}/withdraw`);
      alert('Participation withdrawn.');
      fetchParticipations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw participation.');
    }
  };

  const totalRegistered = participations.length;
  const acceptedCount = participations.filter((p) => p.status === 'ACCEPTED').length;
  const completedCount = participations.filter((p) => p.status === 'COMPLETED').length;
  const pendingCount = participations.filter((p) => p.status === 'APPLIED' || p.status === 'UNDER_REVIEW').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="success" size="sm">Accepted / Active</Badge>;
      case 'COMPLETED':
        return <Badge variant="purple" size="sm">Completed</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" size="sm">Not Selected</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="default" size="sm">Withdrawn</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="info" size="sm">Under Review</Badge>;
      default:
        return <Badge variant="amber" size="sm">Applied / Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Participation & Sabbatical Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track applications, invitations, and active faculty engagements across corporate programs.
          </p>
        </div>

        <Link
          to="/academician/opportunities"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Browse Opportunities
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered"
          value={totalRegistered}
          subtitle="All program applications"
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="Accepted / Active"
          value={acceptedCount}
          subtitle="Confirmed faculty placements"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          subtitle="Finished sabbaticals & FDPs"
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Under Review"
          value={pendingCount}
          subtitle="Awaiting partner decision"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Participations List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : participations.length > 0 ? (
        <div className="space-y-4">
          {participations.map((part) => {
            const opp = part.collaboration;
            const canWithdraw = part.status === 'APPLIED' || part.status === 'UNDER_REVIEW';

            return (
              <div
                key={part.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <Badge variant="amber" size="sm">
                        {opp?.type?.replace('_', ' ')}
                      </Badge>
                      <Badge variant="default" size="sm">
                        {opp?.mode}
                      </Badge>
                      {getStatusBadge(part.status)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{opp?.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">
                        {opp?.initiatorInfo?.name || 'Authorized Partner'}
                      </span>
                      <span>&bull;</span>
                      <span>{opp?.initiatorRole}</span>
                      {opp?.location && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {opp.location}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400">
                      Applied: {new Date(part.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{opp?.description}</p>

                {part.proposal && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Your Submitted Statement / Proposal:
                    </span>
                    {part.proposal}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                    {opp?.duration && <span>Duration: {opp.duration}</span>}
                    {opp?.remunerationOrStipend && <span>Grant/Stipend: {opp.remunerationOrStipend}</span>}
                  </div>

                  {canWithdraw && (
                    <button
                      onClick={() => handleWithdraw(part.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      Withdraw Application
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No participations found"
          description="You haven't applied or registered for any faculty programs, sabbaticals, or FDPs yet."
        />
      )}
    </div>
  );
};
