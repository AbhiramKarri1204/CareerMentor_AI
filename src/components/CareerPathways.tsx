import React, { useState } from "react";
import { RecommendedPathway } from "../types";
import { CheckCircle2, AlertCircle, DollarSign, Activity, HelpCircle, Layers, TrendingUp, Sparkles, BookOpen } from "lucide-react";

interface CareerPathwaysProps {
  pathways: RecommendedPathway[];
}

function getSkillSuggestion(skillName: string): string {
  const name = skillName.toLowerCase();
  if (name.includes("python")) return "Build complex data frameworks, REST APIs via FastAPI/Django, and script automated operations.";
  if (name.includes("typescript") || name.includes("javascript")) return "Master modern modular patterns, TSConfig strictness, generic utilities, and asynchronous event streams.";
  if (name.includes("react") || name.includes("next.js") || name.includes("nextjs") || name.includes("frontend") || name.includes("ui")) return "Explore responsive single-page layouts, custom hook composability, state management, and edge routing integrations.";
  if (name.includes("docker") || name.includes("kubernetes") || name.includes("k8s") || name.includes("cloud") || name.includes("aws") || name.includes("gcp") || name.includes("ci/cd") || name.includes("automation") || name.includes("devops")) return "Implement multi-stage container assets, helm packaging, local pod orchestration, and robust automated workflows.";
  if (name.includes("sql") || name.includes("postgres") || name.includes("query") || name.includes("database") || name.includes("nosql")) return "Study indexing strategies, query execution planners, schema migrations, Drizzle/Prisma schemas, and advanced caching layers.";
  if (name.includes("system design") || name.includes("architecture")) return "Design decoupled message-driven pub/sub pipelines, load-balanced ingress proxies, and structured fault-tolerance boundaries.";
  if (name.includes("testing") || name.includes("jest") || name.includes("cypress") || name.includes("tdd")) return "Author comprehensive unit/integration test sweeps, mock third-party API dependencies, and enforce pre-commit lint blocks.";
  return "Review formal specifications, formulate 2-3 local playground sandboxes, and integrate the credential within high-profile portfolio bullet points.";
}

export default function CareerPathways({ pathways }: CareerPathwaysProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!pathways || pathways.length === 0) return null;

  // Aggregate skill gaps across all pathways
  const aggregateGaps = () => {
    const gapMap: { [key: string]: { count: number; roles: string[] } } = {};
    
    pathways.forEach((path) => {
      path.skillsNeed?.forEach((skill) => {
        const trimmed = skill.trim();
        const key = trimmed.toLowerCase();
        
        // Match minor duplicates
        let matchedKey = Object.keys(gapMap).find(k => k === key);
        if (!matchedKey) {
          matchedKey = Object.keys(gapMap).find(k => k.includes(key) || key.includes(k));
        }
        
        const finalKey = matchedKey || trimmed;
        
        if (!gapMap[finalKey]) {
          gapMap[finalKey] = { count: 0, roles: [] };
        }
        gapMap[finalKey].count += 1;
        if (!gapMap[finalKey].roles.includes(path.title)) {
          gapMap[finalKey].roles.push(path.title);
        }
      });
    });

    const list = Object.entries(gapMap).map(([rawSkill, details]) => {
      // Capitalize first letters for clean table layout
      const skillName = rawSkill.charAt(0).toUpperCase() + rawSkill.slice(1);
      let rating: "Critical" | "High" | "Medium" = "Medium";
      if (details.count >= 4) rating = "Critical";
      else if (details.count >= 2) rating = "High";
      
      return {
        skill: skillName,
        frequency: details.count,
        roles: details.roles,
        rating,
        suggestion: getSkillSuggestion(rawSkill)
      };
    });

    // Sort by frequency (highest first)
    return list.sort((a, b) => b.frequency - a.frequency);
  };

  const aggregatedGapsList = aggregateGaps();

  return (
    <div id="recommended-pathways-panel" className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 tracking-tight font-sans">
          Top 5 Recommended Career Pathways
        </h3>
        <p className="text-xs text-zinc-500 font-sans mt-0.5">
          AI-mapped corporate targeting matched precisely to your qualifications and goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pathway List Tabs */}
        <div className="lg:col-span-4 space-y-2">
          {pathways.slice(0, 5).map((path, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                activeTab === idx
                  ? "bg-zinc-900 text-white border-zinc-950 shadow-sm"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <div className="space-y-1 pr-1">
                <div className={`text-xs font-semibold uppercase tracking-wider ${
                  activeTab === idx ? "text-indigo-400" : "text-zinc-400"
                }`}>
                  Rank #{idx + 1}
                </div>
                <div className="font-semibold text-sm group-hover:translate-x-0.5 transition-transform duration-150">
                  {path.title}
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold leading-none ${
                  activeTab === idx ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-850"
                }`}>
                  {path.matchPercentage}% Match
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Pathway Detail Panel */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          {pathways[activeTab] && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Recommended Pathway Details
                  </span>
                  <h4 className="text-2xl font-bold text-zinc-900 mt-2 font-sans tracking-tight">
                    {pathways[activeTab].title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right sm:text-left">
                    <span className="text-xs text-zinc-400 block font-sans">Index Fit</span>
                    <span className="text-lg font-bold text-zinc-800">
                      {pathways[activeTab].matchPercentage}% Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Salary & Demand Meta block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-850">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-700 font-sans block font-medium">Estimated Salary Range</span>
                    <span className="text-sm font-bold text-emerald-900 select-all">
                      {pathways[activeTab].salaryRange}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-850">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-indigo-700 font-sans block font-medium">Market Demand Rating (2026)</span>
                    <span className="text-sm font-bold text-indigo-900">
                      {pathways[activeTab].demandFactor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description fits */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Role Alignment Analytics
                </h5>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed bg-zinc-50/70 p-4 rounded-xl border border-zinc-100">
                  {pathways[activeTab].whyItFits}
                </p>
              </div>

              {/* Core Skill Alignments checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Skills they have */}
                <div className="p-4 rounded-xl border border-emerald-150 bg-emerald-50/5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    Recognized Skills Match
                  </div>
                  <ul className="space-y-1.5">
                    {pathways[activeTab].skillsHave?.map((skill, sIdx) => (
                      <li key={sIdx} className="text-zinc-700 text-xs font-sans flex items-center justify-between p-2 rounded-lg bg-emerald-50/20 border border-emerald-100/50">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold select-none">•</span>
                          <span className="font-semibold text-zinc-800">{skill}</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                          POSSESSED
                        </span>
                      </li>
                    ))}
                    {(!pathways[activeTab].skillsHave || pathways[activeTab].skillsHave.length === 0) && (
                      <li className="text-xs text-zinc-400 italic">No exact matching skills indexed.</li>
                    )}
                  </ul>
                </div>

                {/* Gaps to bridge */}
                <div className="p-4 rounded-xl border border-amber-150 bg-amber-50/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                    Gap to Bridge (Urgent)
                  </div>
                  <ul className="space-y-1.5">
                    {pathways[activeTab].skillsNeed?.map((skill, sIdx) => (
                      <li key={sIdx} className="text-zinc-700 text-xs font-sans flex items-center justify-between p-2 rounded-lg bg-amber-50/20 border border-amber-100/50">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-600 font-bold select-none">•</span>
                          <span className="font-semibold text-zinc-900">{skill}</span>
                        </div>
                        <span className="bg-amber-100/80 text-amber-800 border border-amber-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                          GAP (MISSING)
                        </span>
                      </li>
                    ))}
                    {(!pathways[activeTab].skillsNeed || pathways[activeTab].skillsNeed.length === 0) && (
                      <li className="text-xs text-zinc-400 italic">No significant skill gaps flagged.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aggregate cross-role skill gaps matrix */}
      {aggregatedGapsList.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-zinc-100 text-zinc-800 rounded-xl shrink-0">
              <Layers className="w-5.5 h-5.5 text-zinc-900" />
            </div>
            <div>
              <div className="inline-block">
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider block font-sans">
                  Cross-Pathway Matrix
                </span>
              </div>
              <h4 className="text-base font-bold text-zinc-900 tracking-tight font-sans mt-1">
                Aggregated Skill Gaps & Prioritized Learning Index
              </h4>
              <p className="text-xs text-zinc-500 font-sans mt-0.5 leading-relaxed">
                We analyzed and aggregated all target requirements across your Top 5 matched careers. Focus prioritizing your efforts on skills required by multiple fields to maximize your 2026 hiring value.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-150 rounded-xl">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead className="bg-zinc-50/80 text-zinc-600 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-150">
                <tr>
                  <th className="p-4 font-semibold">Skill Gap Area</th>
                  <th className="p-4 font-semibold text-center">Frequency (Roles)</th>
                  <th className="p-4 font-semibold text-center">Importance Rating</th>
                  <th className="p-4 font-semibold">Prioritized Learning Area Suggestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {aggregatedGapsList.slice(0, 8).map((item, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-zinc-50/50 transition-all duration-150">
                      <td className="p-4">
                        <span className="font-bold text-zinc-900 text-sm block">{item.skill}</span>
                        <span className="text-[10px] text-zinc-400 font-medium block mt-0.5 max-w-xs truncate" title={item.roles.join(', ')}>
                          Gapped Roles: {item.roles.join(', ')}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold font-mono text-zinc-800 text-sm">
                        {item.frequency} / 5
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                          item.rating === "Critical" 
                            ? "bg-red-50 text-red-750 border border-red-200" 
                            : item.rating === "High" 
                              ? "bg-amber-50 text-amber-750 border border-amber-200" 
                              : "bg-blue-50 text-blue-750 border border-blue-200"
                        }`}>
                          {item.rating}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-550 leading-relaxed max-w-md">
                        <div className="flex gap-1.5 items-start">
                          <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{item.suggestion}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
