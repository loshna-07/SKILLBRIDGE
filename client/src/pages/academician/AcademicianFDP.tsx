import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { LearningProgram } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export const AcademicianFDP: React.FC = () => {
  const [fdps, setFdps] = useState<LearningProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/learning?type=FDP')
      .then((res) => setFdps(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Development Programs (FDPs)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Accredited pedagogy and advanced technology programs delivered by industry leaders for academic faculty.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : fdps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fdps.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                  <Badge variant="amber" size="sm">
                    FDP Accredited
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{p.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {p.duration || '1-2 Weeks'} &bull; {p.mode}
                  </span>
                  <span className="font-bold text-emerald-700">{p.price}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Start: {p.startDate || 'Upcoming Cohort'}</span>
                <button
                  type="button"
                  onClick={() => alert('FDP registration request recorded!')}
                  className="px-3.5 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm"
                >
                  Register for FDP
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No FDP programs scheduled yet"
          description="Industry partners and institutions post upcoming faculty development courses here."
        />
      )}
    </div>
  );
};
