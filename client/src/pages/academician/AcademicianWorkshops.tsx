import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { LearningProgram } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { CalendarCheck, Clock, Users, PlusCircle } from 'lucide-react';

export const AcademicianWorkshops: React.FC = () => {
  const [workshops, setWorkshops] = useState<LearningProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/learning?type=WORKSHOP')
      .then((res) => setWorkshops(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic & Technical Workshops</h1>
        <p className="text-xs text-slate-500 mt-1">
          Interactive hands-on masterclasses organized jointly with industry practitioners.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : workshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshops.map((w) => (
            <div
              key={w.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-900">{w.title}</h3>
                  <Badge variant="amber" size="sm">
                    Workshop
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{w.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {w.duration || 'Full Day'} &bull; {w.mode}
                  </span>
                  <span className="font-bold text-slate-900">{w.price}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Date: {w.startDate || 'TBA'}</span>
                <button
                  type="button"
                  onClick={() => alert('Attendance confirmed!')}
                  className="px-3 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm"
                >
                  Join Workshop
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title="No upcoming workshops scheduled yet"
          description="Industry partner workshops and hands-on technical labs will be listed here."
        />
      )}
    </div>
  );
};
