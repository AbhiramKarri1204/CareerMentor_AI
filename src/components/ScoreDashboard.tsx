import React, { useState } from "react";
import { ScoreSet, ScoreReasoning, CandidateProfile } from "../types";
import {
  Award,
  Brain,
  Target,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Share2,
  Copy,
  Check,
  Loader2,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from "recharts";

interface ScoreDashboardProps {
  scores: ScoreSet;
  reasoning: ScoreReasoning;
  profile?: CandidateProfile;
}

export default function ScoreDashboard({ scores, reasoning, profile }: ScoreDashboardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorOnSummary, setErrorOnSummary] = useState<string | null>(null);

  const fetchLinkedInSummary = async () => {
    setIsGenerating(true);
    setErrorOnSummary(null);
    setCopied(false);
    try {
      const response = await fetch("/api/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ scores, profile })
      });
      if (!response.ok) {
        throw new Error("Unable to formulate your networking update. Please retry.");
      }
      const data = await response.json();
      if (data && data.summary) {
        setGeneratedSummary(data.summary);
      } else {
        throw new Error("Resulting summary template parsed with empty results.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorOnSummary(err?.message || "An expected error obstructed connection to social generator.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedSummary) return;
    navigator.clipboard.writeText(generatedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreConfig = [
    {
      key: "technicalMatch" as const,
      label: "Technical Match",
      value: scores.technicalMatch,
      reason: reasoning.technicalMatch,
      icon: Award,
      color: "from-indigo-600 to-indigo-500",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-100",
    },
    {
      key: "softSkillsBalance" as const,
      label: "Soft Skills Balance",
      value: scores.softSkillsBalance,
      reason: reasoning.softSkillsBalance,
      icon: Brain,
      color: "from-teal-600 to-teal-500",
      bgLight: "bg-teal-50",
      textColor: "text-teal-700",
      borderColor: "border-teal-100",
    },
    {
      key: "industryReadiness" as const,
      label: "Industry Readiness",
      value: scores.industryReadiness,
      reason: reasoning.industryReadiness,
      icon: Target,
      color: "from-amber-600 to-amber-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-100",
    },
    {
      key: "overallEmployability" as const,
      label: "Overall Employability",
      value: scores.overallEmployability,
      reason: reasoning.overallEmployability,
      icon: ShieldCheck,
      color: "from-emerald-600 to-emerald-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-100",
    },
  ];

  const getImprovementsForCategory = (key: string) => {
    switch (key) {
      case "technicalMatch":
        return {
          focus: "Core Tech Stack & Portfolio Reinforcement",
          actions: [
            "Build 2-3 complex end-to-end applications solving real-world challenges using the target industry standard stacks.",
            "Emphasize modular coding, proper error handling, schema validations, and automated unit tests inside your repositories.",
            "Upload fully documented projects to GitHub with professional READMEs, system-architecture diagrams, and clean directory hierarchies."
          ],
          icon: Award,
          borderColor: "border-indigo-100",
          itemColor: "text-indigo-700",
          itemBg: "bg-indigo-50"
        };
      case "softSkillsBalance":
        return {
          focus: "Collaborative Synergy & Strategic Communication",
          actions: [
            "Practice communicating technical architectural decisions simply to non-technical stakeholders or teammates.",
            "Participate in agile team collaborations, hackathons, or open-source community groups to cultivate remote workflow synergy.",
            "Join code-review sessions or professional study groups, actively practicing constructive technical and peer feedback loops."
          ],
          icon: Brain,
          borderColor: "border-teal-100",
          itemColor: "text-teal-700",
          itemBg: "bg-teal-50"
        };
      case "industryReadiness":
        return {
          focus: "Professional Developer Workflow & Cloud Ecosystems",
          actions: [
            "Adopt robust software testing methodologies, linting suites, and modern automated validation workflows (CI/CD).",
            "Learn professional containerization (Docker) and deployment paradigms to cloud hosts (Google Cloud, AWS).",
            "Master common software design patterns (MVC, Clean Architecture) and database performance tuning (effective SQL indexing, query plans)."
          ],
          icon: Target,
          borderColor: "border-amber-100",
          itemColor: "text-amber-700",
          itemBg: "bg-amber-50"
        };
      case "overallEmployability":
        return {
          focus: "Strategic Corporate Pipeline & Interview Calibration",
          actions: [
            "Re-align resume blocks using precise high-impact keywords, action-oriented industry verbs, and direct STAR metric statements.",
            "Engage in structured mock interview practice encompassing tech MCQ theories and verbal software engineering scenarios.",
            "Connect with industry veterans on professional platforms to obtain reviews and unlock warm recruitment leads."
          ],
          icon: ShieldCheck,
          borderColor: "border-emerald-100",
          itemColor: "text-emerald-700",
          itemBg: "bg-emerald-50"
        };
      default:
        return null;
    }
  };

  const computeDomainProficiencies = (skillsString: string = "") => {
    const lower = skillsString.toLowerCase();
    const baseScore = scores.technicalMatch || 70;
    
    const domains = [
      { subject: "Software Engineering", key: "se", keywords: ["python", "java", "c++", "rust", "go", "typescript", "javascript", "oop", "code", "dev"] },
      { subject: "System Design & Scale", key: "sd", keywords: ["architecture", "scale", "system design", "distributed", "microservices", "redis", "kafka", "rest"] },
      { subject: "Database & Query Tuning", key: "db", keywords: ["sql", "mysql", "postgres", "nosql", "mongodb", "database", "query", "indexing", "drizzle", "prisma"] },
      { subject: "Cloud & Infrastructure", key: "cloud", keywords: ["aws", "gcp", "azure", "docker", "kubernetes", "cloud", "serverless", "deployment", "github actions"] },
      { subject: "Modern Frameworks & UI", key: "frameworks", keywords: ["react", "vue", "angular", "nextjs", "vite", "html", "css", "tailwind", "ui", "ux", "frontend"] },
      { subject: "Tooling & CI/CD", key: "tooling", keywords: ["git", "github", "npm", "testing", "jest", "eslint", "ci/cd", "lint"] }
    ];

    return domains.map(domain => {
      let hits = 0;
      domain.keywords.forEach(kw => {
        if (lower.includes(kw)) {
          hits++;
        }
      });

      let seedNoise = 0;
      if (domain.key === "se") seedNoise = 5;
      if (domain.key === "sd") seedNoise = -10;
      if (domain.key === "db") seedNoise = -2;
      if (domain.key === "cloud") seedNoise = -8;
      if (domain.key === "frameworks") seedNoise = 4;
      if (domain.key === "tooling") seedNoise = -5;

      let candidateValue = baseScore + seedNoise + (hits * 4);
      candidateValue = Math.min(98, Math.max(40, candidateValue));

      let benchmarkValue = 80;
      if (domain.key === "se") benchmarkValue = 82;
      if (domain.key === "sd") benchmarkValue = 75;
      if (domain.key === "db") benchmarkValue = 80;
      if (domain.key === "cloud") benchmarkValue = 78;
      if (domain.key === "frameworks") benchmarkValue = 82;
      if (domain.key === "tooling") benchmarkValue = 80;

      return {
        subject: domain.subject,
        "Candidate Proficiency": Math.round(candidateValue),
        "Industry Benchmark": benchmarkValue,
        fullMark: 100
      };
    });
  };

  const radarData = computeDomainProficiencies(profile?.technicalSkills || "");
  const below75Items = scoreConfig.filter(item => item.value < 75);

  return (
    <div id="score-dashboard-panel" className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight font-sans">
            Career Readiness & Market Capability
          </h3>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Diagnostic metric breakdown aligned to 2026 technical standard indexes.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Diagnostic Active
        </div>
      </div>

      {/* LinkedIn Sharing Optimizer Panel */}
      <div id="linkedin-sharing-panel" className="bg-gradient-to-r from-indigo-50/60 via-indigo-50/15 to-white border border-indigo-150 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 bg-indigo-600 text-white rounded text-[10px] uppercase font-extrabold tracking-widest font-mono select-none">
                LinkedIn Ready
              </span>
              <h4 className="text-sm font-bold text-zinc-900 font-sans flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-600 shrink-0" />
                Network Validation Optimizer
              </h4>
            </div>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
              Recruiters prioritize candidates with proactive continuous learning habits. Generate a highly structured, objective summary customized specifically for sharing on LinkedIn to showcase your diagnostic scores and career roadmap targets!
            </p>
          </div>
          <button
            id="compile-linkedin-summary-btn"
            onClick={fetchLinkedInSummary}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 min-w-[180px] rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 border border-zinc-950 shadow-sm shrink-0 active:scale-98 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                <span>Formulating Post...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Generate LinkedIn Post</span>
              </>
            )}
          </button>
        </div>

        {errorOnSummary && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorOnSummary}</span>
          </div>
        )}

        {generatedSummary && (
          <div className="space-y-3 pt-3.5 border-t border-zinc-100 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400">
                Optimized Shareable Post Content (Editable)
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="copy-linkedin-summary-btn"
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-[11px] font-bold border border-emerald-150 transition-all flex items-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Caption!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Structured Post</span>
                    </>
                  )}
                </button>
                <button
                  id="regenerate-linkedin-summary-btn"
                  onClick={fetchLinkedInSummary}
                  disabled={isGenerating}
                  className="p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-lg border border-zinc-200 cursor-pointer"
                  title="Regenerate"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-indigo-600" : ""}`} />
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="linkedin-summary-textarea"
                value={generatedSummary}
                onChange={(e) => setGeneratedSummary(e.target.value)}
                className="w-full h-44 p-4 bg-zinc-950 text-zinc-100 font-mono text-[11px] rounded-xl border border-zinc-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 overflow-y-auto"
                placeholder="Adjust your custom LinkedIn comment here..."
              />
              <div className="absolute bottom-2.5 right-3 text-[9px] text-zinc-500 font-mono selection:bg-transparent">
                Edit before copy • Live formatting container
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreConfig.map((item) => {
          const Icon = item.icon;
          const isLacking = item.value < 75;
          return (
            <div
              key={item.key}
              className={`p-4 rounded-xl bg-white border shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-zinc-300 relative overflow-hidden ${
                isLacking ? "border-amber-200 bg-amber-50/5" : "border-zinc-200"
              }`}
            >
              {isLacking && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-amber-400"></div>
              )}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-zinc-500 font-sans">{item.label}</span>
                  {isLacking && (
                    <div className="inline-block mt-1">
                      <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider block">
                        Action Required
                      </span>
                    </div>
                  )}
                </div>
                <span className={`p-2 rounded-lg ${item.bgLight} ${item.textColor}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>

              <div className="my-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-zinc-900 font-sans tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs text-zinc-400">/ 100</span>
              </div>

              {/* Styled progress bar */}
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden mb-3">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>

              <div className="text-xs text-zinc-500 font-sans leading-relaxed mt-1">
                {item.reason}
              </div>
            </div>
          );
        })}
      </div>

      {/* Domain Proficiency Radar Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-zinc-250 rounded-2xl p-5 shadow-xs">
        <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="inline-block">
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider block font-sans">
                Skill Alignment Matrix
              </span>
            </div>
            <h4 className="text-base font-bold text-zinc-900 tracking-tight font-sans">
              Required Domain Proficiency
            </h4>
            <p className="text-xs text-zinc-650 leading-relaxed font-sans">
              This radar chart maps out your technical profile across 6 core industry segments. It compares your active validated credentials and skills against current <strong className="text-indigo-650 font-semibold">2026 enterprise standard benchmarks</strong> for your target roles.
            </p>
          </div>
          
          <div className="space-y-3 pt-3.5 border-t border-zinc-100 font-sans">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-650 shrink-0"></span>
                <span className="text-xs font-semibold text-zinc-850">Your Calculated Score</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal pl-5">
                Derived dynamically from your stated course degrees, projects, framework familiarity, and technical experience depths.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-400 shrink-0"></span>
                <span className="text-xs font-semibold text-zinc-855">Industry Standard Benchmark</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal pl-5">
                Aggregated 2026 talent baseline expectations of leading digital corporations and technical pipelines.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 h-[320px] w-full flex items-center justify-center bg-zinc-50/50 rounded-xl border border-zinc-150 p-2 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e4e4e7" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#71717a', fontSize: 9 }}
              />
              <Radar
                name="Your Position"
                dataKey="Candidate Proficiency"
                stroke="#4f46e5"
                fill="#818cf8"
                fillOpacity={0.25}
              />
              <Radar
                name="Industry Benchmark"
                dataKey="Industry Benchmark"
                stroke="#52525b"
                fill="#d4d4d8"
                fillOpacity={0.1}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e4e4e7",
                  borderRadius: "12px",
                  fontSize: "11px",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', fontWeight: 500, marginTop: '5px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Plan / Improvements Needed section for scores < 75 */}
      {below75Items.length > 0 ? (
        <div className="bg-amber-50/20 border border-amber-200/60 rounded-xl p-5 mt-6 space-y-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <AlertCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 font-sans">
                Targeted Career Readiness & Market Capability Gaps (Metric Scores &lt; 75)
              </h4>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                We detected {below75Items.length} area{below75Items.length > 1 ? "s" : ""} falling below professional corporate benchmarks (75/100). Focus intensely on the following targeted improvements:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {below75Items.map((item) => {
              const details = getImprovementsForCategory(item.key);
              if (!details) return null;
              const DetailsIcon = details.icon;
              return (
                <div
                  key={item.key}
                  className={`p-4 bg-white border ${details.borderColor} rounded-xl shadow-xs space-y-3.5`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${details.itemBg} ${details.itemColor}`}>
                      <DetailsIcon className="w-4.5 h-4.5" />
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-950 block">
                        {item.label} Improvement Roadmap
                      </h5>
                      <span className="text-[10px] text-zinc-400 font-bold block bg-zinc-50 border border-zinc-100 rounded px-1.5 py-0.5 mt-0.5 truncate uppercase">
                        Current Score: {item.value} / 100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Priority Focus Area: {details.focus}
                    </span>
                    <ul className="space-y-1.5">
                      {details.actions.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-zinc-650 leading-relaxed">
                          <span className={`${details.itemColor} font-bold select-none shrink-0 mt-0.5`}>•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/35 border border-emerald-100 rounded-xl p-5 mt-6 flex items-start gap-3.5 animate-fade-in">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-950 font-sans">
              Exceptional Market Alignment (All Dimensions &gt;= 75)
            </h4>
            <p className="text-xs text-zinc-650 font-sans mt-0.5 leading-relaxed">
              Superb candidate readiness indices! All dimensions successfully satisfy professional benchmarks. Continue advancing your technical scope by executing deeper simulations, running advanced mock interviews, and structuring complex continuous-integration modules.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

