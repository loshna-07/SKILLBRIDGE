import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Opportunity } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Briefcase, Building, MapPin, Calendar, ExternalLink } from 'lucide-react';

export const AcademicianInternships: React.FC = () => {
  const [internships, setInternships] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/opportunities?type=INTERNSHIP')
      .then((res) => setInternships(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Industry Internships & Sabbaticals</h1>
        <p className="text-xs text-slate-500 mt-1">
          Opportunities for academicians to engage in summer sabbaticals and industrial immersion with corporate technology teams.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : internships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internships.map((opp) => (
            <div
              key={opp.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                  <Badge variant="amber" size="sm">
                    {opp.workMode}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {opp.industry?.companyName} &bull; {opp.location || 'India'}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{opp.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Duration: {opp.duration || '2-3 Months'}</span>
                <span className="font-bold text-amber-700">Open for Faculty Engagement</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No faculty internships posted yet"
          description="Corporate partners will post sabbatical and faculty training positions here."
        />
      )}
    </div>
  );
};
