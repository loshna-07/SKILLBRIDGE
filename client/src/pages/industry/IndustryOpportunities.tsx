import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Opportunity } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  PlusCircle,
  Users,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  MapPin,
  Edit,
} from 'lucide-react';

export const IndustryOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpps = () => {
    setLoading(true);
    api
      .get('/opportunities/my/created')
      .then((res) => setOpportunities(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const handleTogglePublish = async (opp: any) => {
    try {
      await api.put(`/opportunities/${opp.id}`, {
        isPublished: !opp.isPublished,
      });
      fetchOpps();
    } catch (err: any) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await api.delete(`/opportunities/${id}`);
      fetchOpps();
    } catch (err: any) {
      alert('Failed to delete.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Published Postings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, update, publish/unpublish, and screen talent for your corporate opportunities.
          </p>
        </div>

        <Link
          to="/industry/opportunities/create"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Position
        </Link>
      </div>

      {opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {opp.location || 'Remote'} &bull; {opp.workMode}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={opp.isPublished ? 'success' : 'default'} size="sm">
                      {opp.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="purple" size="sm">
                      {opp.type}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {opp.description}
                </p>

                {/* Skills Badges */}
                {opp.skills && opp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {opp.skills.map((s: any) => (
                      <span
                        key={s.id}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          s.isRequired ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {s.skill?.name} {s.isRequired ? '(Req)' : ''}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <strong>{opp._count?.applications || 0}</strong> Applicants
                  </span>
                  <span>Openings: {opp.numberOfOpenings}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/industry/applicants?opportunityId=${opp.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800"
                >
                  <Users className="w-3.5 h-3.5" />
                  Screen Applicants ({opp._count?.applications || 0})
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/industry/opportunities/edit/${opp.id}`}
                    className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    title="Edit Opportunity"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(opp)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title={opp.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {opp.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(opp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Delete Position"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No opportunities posted yet"
          description="Create your first internship or job listing to start receiving qualified candidates ranked by the SkillBridge matching engine."
          actionText="Post Your First Opportunity"
          onAction={() => window.location.assign('/industry/opportunities/create')}
        />
      )}
    </div>
  );
};
