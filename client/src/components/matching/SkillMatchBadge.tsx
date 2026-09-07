import React, { useState } from 'react';
import { MatchingResult } from '../../types';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles, Award } from 'lucide-react';

interface SkillMatchBadgeProps {
  matchResult?: MatchingResult;
  compact?: boolean;
}

export const SkillMatchBadge: React.FC<SkillMatchBadgeProps> = ({ matchResult, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (!matchResult) {
    return null;
  }

  const matchPercentage = matchResult.matchPercentage ?? matchResult.matchScore;
  const {
    matchedSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    cgpaEligible,
    degreeEligible,
    eligibility,
    skillGaps,
    explanation,
  } = matchResult;

  // Determine badge color theme
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';
  if (matchPercentage < 50) {
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (matchPercentage < 75) {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {matchPercentage}% Match
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
            <Sparkles className="w-3.5 h-3.5" />
            {matchPercentage}% Compatibility
          </span>
          <span className="text-slate-500 font-medium">
            {matchedSkills.length} skill{matchedSkills.length === 1 ? '' : 's'} matched
          </span>
          {eligibility && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                eligibility.isEligible
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {eligibility.isEligible ? 'Eligible' : 'Eligibility Incomplete'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
        >
          {expanded ? 'Hide Analysis' : 'Skill Breakdown'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5">
          <p className="text-slate-600 italic">{explanation}</p>

          {/* Matched skills */}
          {matchedSkills.length > 0 && (
            <div>
              <span className="font-semibold text-emerald-700 block mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Matched Competencies:
              </span>
              <div className="flex flex-wrap gap-1.5 pl-4">
                {matchedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium"
                  >
                    <Award className="w-3 h-3 text-emerald-600" />
                    {s.name} ({s.proficiency})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skill gaps */}
          {skillGaps && skillGaps.length > 0 ? (
            <div>
              <span className="font-semibold text-amber-700 block mb-1 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                Identified Skill Gaps & Recommendations:
              </span>
              <div className="space-y-1.5 pl-4">
                {skillGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{gap.name}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                          gap.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : gap.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {gap.severity} PRIORITY
                      </span>
                    </div>
                    <p className="text-slate-500">{gap.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            (missingRequiredSkills.length > 0 || missingPreferredSkills.length > 0) && (
              <div>
                <span className="font-semibold text-amber-700 block mb-1 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-amber-600" />
                  Identified Skill Gaps:
                </span>
                <div className="flex flex-wrap gap-1.5 pl-4">
                  {missingRequiredSkills.map((name, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center bg-rose-100/70 text-rose-800 px-2 py-0.5 rounded text-[11px] font-medium"
                    >
                      Missing Required: {name}
                    </span>
                  ))}
                  {missingPreferredSkills.map((name, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center bg-amber-100/70 text-amber-800 px-2 py-0.5 rounded text-[11px] font-medium"
                    >
                      Missing Preferred: {name}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Eligibility badges */}
          <div className="flex items-center gap-3 pt-1 pl-1 text-[11px]">
            <span className={`inline-flex items-center gap-1 ${cgpaEligible ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
              {cgpaEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              CGPA Criteria
            </span>
            <span className={`inline-flex items-center gap-1 ${degreeEligible ? 'text-emerald-700' : 'text-slate-500'}`}>
              {degreeEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              Degree Match
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
