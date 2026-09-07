import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { School, Building2, Mail, Phone, MapPin } from 'lucide-react';

export const InstitutionAcademicians: React.FC = () => {
  const [academicians, setAcademicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/institution/academicians')
      .then((res) => setAcademicians(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Academician Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered faculty members, designations, and departmental domains.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : academicians.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {academicians.map((fac) => (
            <div
              key={fac.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">{fac.fullName}</h3>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                  {fac.designation} &bull; {fac.department}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Experience: {fac.yearsOfExperience || 'N/A'} Years &bull; Institution: {fac.institutionName}
                </p>
                {fac.areasOfExpertise && (
                  <p className="text-[11px] text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Expertise: </span>
                    {fac.areasOfExpertise}
                  </p>
                )}
              </div>

              {fac.location && (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{fac.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={School}
          title="No faculty members registered yet"
          description="Academicians from your institution will appear here when they create accounts."
        />
      )}
    </div>
  );
};
