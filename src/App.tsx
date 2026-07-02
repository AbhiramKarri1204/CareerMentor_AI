import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Briefcase,
  Cpu,
  Code,
  Compass,
  ArrowRight,
  History,
  Trash2,
  Sparkles,
  RotateCcw,
  BookOpen,
  Send,
  AlertCircle,
  HelpCircle,
  Download,
} from "lucide-react";
import { CandidateProfile, AssessmentReport } from "./types";

import ScoreDashboard from "./components/ScoreDashboard";
import CareerPathways from "./components/CareerPathways";
import RoadmapTimeline from "./components/RoadmapTimeline";
import CounselLetter from "./components/CounselLetter";
import ReportMarkdownView from "./components/ReportMarkdownView";
import InterviewSimulator from "./components/InterviewSimulator";
import AtsOptimizer from "./components/AtsOptimizer";
import { UserCheck } from "lucide-react";
import { generateAssessmentPDF } from "./utils/pdfGenerator";


const STANDARD_DEGREE_OPTIONS = [
  "B.Tech",
  "M.Tech",
  "MCA",
  "B.Sc",
  "M.Sc",
  "B.E.",
  "M.S.",
  "BBA",
  "MBA",
  "Ph.D."
];

const GRADUATION_YEAR_OPTIONS = [
  "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"
];

export default function App() {
  // Input states
  const [degree, setDegree] = useState("B.Tech");
  const [degreeChoice, setDegreeChoice] = useState("B.Tech");

  const handleUpdateDegreeState = (val: string) => {
    setDegree(val);
    if (STANDARD_DEGREE_OPTIONS.includes(val)) {
      setDegreeChoice(val);
    } else if (val === "") {
      setDegreeChoice("");
    } else {
      setDegreeChoice("Other");
    }
  };
  const [major, setMajor] = useState("Computer Science");
  const [graduationYear, setGraduationYear] = useState("2028");
  const [gradYearChoice, setGradYearChoice] = useState("2028");

  const handleUpdateGradYearState = (val: string) => {
    setGraduationYear(val);
    if (GRADUATION_YEAR_OPTIONS.includes(val)) {
      setGradYearChoice(val);
    } else if (val === "") {
      setGradYearChoice("");
    } else {
      setGradYearChoice("Other");
    }
  };
  const [gpa, setGpa] = useState("3.85");
  const [technicalSkills, setTechnicalSkills] = useState(
    "Python, Java, Basic HTML/CSS, Git, SQL, PyTorch basics, Pandas"
  );
  const [softSkills, setSoftSkills] = useState(
    "Critical thinking, Active collaboration, Team leadership, Strong documentation, Prompt communication"
  );
  const [primaryDomains, setPrimaryDomains] = useState(
    "AI Engineering, Backend Cloud Systems, Distributed architecture"
  );
  const [expectedCareerGoals, setExpectedCareerGoals] = useState(
    "Securing an elite ML/software engineering internship for next year and researching model optimizations."
  );

  // Application engine states
  const [mainTab, setMainTab] = useState<"pathfinder" | "interview" | "ats">("pathfinder");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorString, setErrorString] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<AssessmentReport | null>(null);
  const [reportHistory, setReportHistory] = useState<AssessmentReport[]>([]);
  const [activeTab, setActiveTab] = useState<"visual" | "markdown">("visual");
  const [subSection, setSubSection] = useState<"scores" | "pathways" | "roadmap" | "letter">("scores");

  // Loading helper labels
  const steps = [
    "Contacting CareerMentor Intellect engine...",
    "Benchmarking academics against 2026 global curriculum standards...",
    "Correlating technical skills with market requirements...",
    "Assessing soft skills for collaborative leadership capability...",
    "Estimating 2026 salary scales and target growth pathways...",
    "Drafting personalized cover advice from senior counselor Council...",
    "Finalizing highly structured Assessment Report...",
  ];

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("careermentor_history");
      if (stored) {
        setReportHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load stored history: ", e);
    }
  }, []);

  // Sync history to localStorage
  const saveHistory = (updated: AssessmentReport[]) => {
    setReportHistory(updated);
    try {
      localStorage.setItem("careermentor_history", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not write history to storage: ", e);
    }
  };

  // Timer loop for loading steps
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1800);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Quick select pre-defined profiles
  const handleSelectExample = (profileData: CandidateProfile) => {
    handleUpdateDegreeState(profileData.academicBackground.degree);
    setMajor(profileData.academicBackground.major);
    handleUpdateGradYearState(profileData.academicBackground.graduationYear);
    setGpa(profileData.academicBackground.gpa);
    setTechnicalSkills(profileData.technicalSkills);
    setSoftSkills(profileData.softSkills);
    setPrimaryDomains(profileData.primaryDomains);
    setExpectedCareerGoals(profileData.expectedCareerGoals);
    setErrorString(null);
  };

  // Reset inputs
  const handleReset = () => {
    handleUpdateDegreeState("");
    setMajor("");
    handleUpdateGradYearState("");
    setGpa("");
    setTechnicalSkills("");
    setSoftSkills("");
    setPrimaryDomains("");
    setExpectedCareerGoals("");
    setErrorString(null);
  };

  // Invoke server analysis endpoint
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!degree || !major) {
      setErrorString("Please fill in both Degree and Major to initialize academic records.");
      return;
    }

    setLoading(true);
    setErrorString(null);

    const payload = {
      academicBackground: { degree, major, graduationYear, gpa },
      technicalSkills,
      softSkills,
      primaryDomains,
      expectedCareerGoals,
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Server could not synthesize profile metrics.");
      }

      const reportData = await res.json();
      
      const newReport: AssessmentReport = {
        id: `rpt_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        profile: payload,
        educationDigest: reportData.educationDigest || "Ingested credentials summary active.",
        scores: reportData.scores,
        scoresReasoning: reportData.scoresReasoning,
        recommendedPathways: reportData.recommendedPathways,
        learningRoadmap: reportData.learningRoadmap,
        counselLetter: reportData.counselLetter,
        markdownReport: reportData.markdownReport,
      };

      setCurrentReport(newReport);
      saveHistory([newReport, ...reportHistory]);
      setActiveTab("visual");
      setSubSection("scores");
    } catch (err: any) {
      console.error(err);
      setErrorString(err.message || "An unexpected network or gateway error occurred during compilation.");
    } finally {
      setLoading(false);
    }
  };

  // Load a prior report
  const handleLoadPriorReport = (report: AssessmentReport) => {
    setCurrentReport(report);
    // Populate form so they can iterate or see values
    handleSelectExample(report.profile);
    setErrorString(null);
  };

  // Delete a prior report from list
  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reportHistory.filter((r) => r.id !== id);
    saveHistory(updated);
    if (currentReport?.id === id) {
      setCurrentReport(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 flex flex-col">
      {/* Top Professional Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded-xl text-white shadow-xs">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 leading-tight font-sans tracking-tight">
              CareerMentor AI
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
              Academic Counselor & Technical Scout // 2026 Edition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-zinc-400 font-mono">SCOUT ENGINE GATEWAY</span>
            <span className="text-xs font-semibold text-emerald-600 font-sans flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Gemini-3.5-Flash Online
            </span>
          </div>
        </div>
      </header>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl w-full mx-auto px-4 flex items-center justify-start gap-1">
          <button
            onClick={() => setMainTab("pathfinder")}
            className={`py-3 px-4 text-xs font-bold font-sans flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              mainTab === "pathfinder"
                ? "border-zinc-900 text-zinc-950 bg-zinc-50/40"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Academic Pathfinder Suite</span>
          </button>

          <button
            onClick={() => setMainTab("ats")}
            className={`py-3 px-4 text-xs font-bold font-sans flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              mainTab === "ats"
                ? "border-zinc-900 text-zinc-950 bg-zinc-50/40"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>ATS Resume Suite & Parser</span>
          </button>

          <button
            onClick={() => setMainTab("interview")}
            className={`py-3 px-4 text-xs font-bold font-sans flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              mainTab === "interview"
                ? "border-zinc-900 text-zinc-950 bg-zinc-50/40"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>AI Mock Interview Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:py-8">
        {mainTab === "interview" ? (
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
            <InterviewSimulator 
              userDegree={degree} 
              userMajor={major} 
              userTechnicalSkills={technicalSkills} 
            />
          </div>
        ) : mainTab === "ats" ? (
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
            <AtsOptimizer />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form Panel: Intake Questionnaire */}
            <section className="lg:col-span-5 space-y-6">

          <div className="bg-white border border-zinc-250 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight font-sans">
                Profile Intake Questionnaire
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Fill in your academic and professional background parameters to analyze.
              </p>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleAnalyze} className="space-y-5">
              {/* Educational Degree */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-750 block w-full">Degree Selection</label>
                <select
                  value={degreeChoice}
                  required
                  onChange={(e) => {
                    const val = e.target.value;
                    setDegreeChoice(val);
                    if (val !== "Other") {
                      setDegree(val);
                    } else {
                      setDegree("");
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select degree...</option>
                  {STANDARD_DEGREE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Other">Other (Custom degree)</option>
                </select>

                {degreeChoice === "Other" && (
                  <div className="mt-2.5 space-y-1.5 animate-fade-in">
                    <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Specify Custom Degree</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.Sc. (Hons)"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Major Concentration */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-750 block">Major Concentration</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors"
                />
              </div>

              {/* Graduation Year */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-750 block">Graduation (Year)</label>
                <select
                  value={gradYearChoice}
                  required
                  onChange={(e) => {
                    const val = e.target.value;
                    setGradYearChoice(val);
                    if (val !== "Other") {
                      setGraduationYear(val);
                    } else {
                      setGraduationYear("");
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select graduation year...</option>
                  {GRADUATION_YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                  <option value="Other">Other (Custom Year)</option>
                </select>

                {gradYearChoice === "Other" && (
                  <div className="mt-2.5 space-y-1.5 animate-fade-in">
                    <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">Specify Custom Year</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2014 or 2031"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Current GPA */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-750 block">Current GPA</label>
                <input
                  type="text"
                  placeholder="e.g. 3.85 / N/A"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors"
                />
              </div>

              {/* Technical skills list */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-750 block">Technical Skills List</label>
                  <span className="text-xs text-zinc-400 font-mono">Comma-separated</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. Python, SQL, Javascript, git, PyTorch, Pandas..."
                  value={technicalSkills}
                  onChange={(e) => setTechnicalSkills(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors font-mono"
                ></textarea>
              </div>

              {/* Soft skills list */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-750 block">Soft Skills List</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Critical thinking, Collaboration, Active communication, Presentation..."
                  value={softSkills}
                  onChange={(e) => setSoftSkills(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors"
                ></textarea>
              </div>

              {/* Primary Domains */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-750 block">Domains & Interests</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Engineering, FinTech, Robotics"
                    value={primaryDomains}
                    onChange={(e) => setPrimaryDomains(e.target.value)}
                    className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-750 block">Expected Career Goals</label>
                  <input
                    type="text"
                    placeholder="e.g. Securing a machine learning internship"
                    value={expectedCareerGoals}
                    onChange={(e) => setExpectedCareerGoals(e.target.value)}
                    className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm bg-white focus:outline-hidden focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>

              {errorString && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorString}</span>
                </div>
              )}

              {/* Submit / Reset Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-3 border border-zinc-200 text-zinc-500 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors"
                  title="Clear Inputs"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Processing Profile...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Synthesize Individual Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Local storage archives stack */}
          {reportHistory.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-150 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                  <History className="w-4 h-4" />
                  Prior Assessment Archives ({reportHistory.length})
                </h3>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100">
                {reportHistory.map((rpt, index) => (
                  <div
                    key={rpt.id}
                    onClick={() => handleLoadPriorReport(rpt)}
                    className={`pt-2.5 pb-2.5 px-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                      currentReport?.id === rpt.id ? "bg-zinc-50" : ""
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="font-bold text-xs truncate text-zinc-900 group-hover:text-indigo-600 transition-colors">
                        {rpt.profile.academicBackground.degree} in {rpt.profile.academicBackground.major}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {rpt.timestamp} ({rpt.profile.academicBackground.gpa ? `GPA: ${rpt.profile.academicBackground.gpa}` : "No GPA Listed"})
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteReport(rpt.id, e)}
                      className="p-1 px-1.5 text-zinc-400 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Panel: Interactive Assessment Center */}
        <section className="col-span-1 lg:col-span-12 xl:col-span-7 space-y-6">
          {loading ? (
            /* Premium Active Loader Overlay */
            <div className="bg-white border border-zinc-200 rounded-2xl p-10 min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
              </div>

              <div className="space-y-2 text-center max-w-sm">
                <h3 className="text-lg font-bold text-zinc-900 font-sans tracking-tight">
                  Running Academic Diagnostics
                </h3>
                <p className="text-xs text-zinc-500 font-sans h-8 leading-relaxed">
                  {steps[loadingStep]}
                </p>
              </div>

              <div className="w-full max-w-xs bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : currentReport ? (
            /* Results Presentation Dashboard */
            <div className="space-y-6">
              {/* Dual presentation control toggles */}
              <div className="bg-white border border-zinc-200 rounded-xl p-2 flex items-center justify-between flex-wrap gap-2 shadow-xs">
                {/* Visual vs direct markdown */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveTab("visual")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      activeTab === "visual"
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    Scouting Center (Visual Dashboard)
                  </button>
                  <button
                    onClick={() => setActiveTab("markdown")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      activeTab === "markdown"
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    Raw Report View (Markdown Format)
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="download-report-pdf-btn"
                    onClick={() => generateAssessmentPDF(currentReport)}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-150 transition-all flex items-center gap-1.5 active:scale-98 cursor-pointer shadow-xs"
                    title="Download fully structured assessment report as a printable PDF document"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download as PDF</span>
                  </button>

                  <div className="text-[10px] text-zinc-400 font-mono text-right scale-95 pr-2 hidden sm:block">
                    STAMP: {currentReport.timestamp}
                  </div>
                </div>
              </div>

              {activeTab === "visual" ? (
                /* Interactive Dashboard Sections */
                <div className="space-y-6">
                  {/* Executive digest synopsis */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-zinc-50 border border-zinc-150 text-zinc-800 rounded-xl hidden sm:block">
                        <GraduationCap className="w-6.5 h-6.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs uppercase tracking-wider font-bold text-zinc-400">
                          Education & Profile Digest
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 font-sans tracking-tight leading-none pt-0.5">
                          {currentReport.profile.academicBackground.degree} in {currentReport.profile.academicBackground.major}
                        </h3>
                        {currentReport.profile.academicBackground.gpa && (
                          <div className="text-xs font-bold text-zinc-500 font-sans pt-0.5">
                            Grade Performance Average: <span className="text-zinc-800">{currentReport.profile.academicBackground.gpa}</span>
                          </div>
                        )}
                        <p className="text-xs text-zinc-650 leading-relaxed font-sans pt-1">
                          {currentReport.educationDigest}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-selectors */}
                  <div className="border-b border-zinc-200 flex overflow-x-auto gap-2">
                    <button
                      onClick={() => setSubSection("scores")}
                      className={`pb-2.5 px-3.5 text-xs font-bold whitespace-nowrap cursor-pointer relative -mb-[1px] transition-all ${
                        subSection === "scores"
                          ? "text-zinc-950 border-b-2 border-zinc-950"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      Readiness Scores
                    </button>
                    <button
                      onClick={() => setSubSection("pathways")}
                      className={`pb-2.5 px-3.5 text-xs font-bold whitespace-nowrap cursor-pointer relative -mb-[1px] transition-all ${
                        subSection === "pathways"
                          ? "text-zinc-950 border-b-2 border-zinc-950"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      Top recommended Pathways
                    </button>
                    <button
                      onClick={() => setSubSection("roadmap")}
                      className={`pb-2.5 px-3.5 text-xs font-bold whitespace-nowrap cursor-pointer relative -mb-[1px] transition-all ${
                        subSection === "roadmap"
                          ? "text-zinc-950 border-b-2 border-zinc-950"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      Interactive 6-Month Roadmap
                    </button>
                    <button
                      onClick={() => setSubSection("letter")}
                      className={`pb-2.5 px-3.5 text-xs font-bold whitespace-nowrap cursor-pointer relative -mb-[1px] transition-all ${
                        subSection === "letter"
                          ? "text-zinc-950 border-b-2 border-zinc-950"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      Senior Counselor Brief
                    </button>
                  </div>

                  {/* Visual subsections */}
                  <div className="pt-2 animate-fade-in">
                    {subSection === "scores" && (
                      <ScoreDashboard
                        scores={currentReport.scores}
                        reasoning={currentReport.scoresReasoning}
                        profile={currentReport.profile}
                      />
                    )}

                    {subSection === "pathways" && (
                      <CareerPathways pathways={currentReport.recommendedPathways} />
                    )}

                    {subSection === "roadmap" && (
                      <RoadmapTimeline phases={currentReport.learningRoadmap} />
                    )}

                    {subSection === "letter" && (
                      <CounselLetter letterText={currentReport.counselLetter} />
                    )}
                  </div>
                </div>
              ) : (
                /* Strict Markdown Report Output Column */
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
                  <ReportMarkdownView markdown={currentReport.markdownReport} />
                </div>
              )}
            </div>
          ) : (
            /* Empty State: Prompt user to fill profile details */
            <div className="bg-white border border-zinc-250 rounded-2xl p-10 min-h-[500px] flex flex-row items-center justify-center text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 shadow-inner">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-zinc-900 font-sans tracking-tight">
                    Assessment Workspace Ready
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Fill in your background details at the left, then press "Synthesize Individual Assessment" to initiate corporate diagnostics.
                  </p>
                </div>
                <div className="flex justify-center gap-1.5 pt-1">
                  <span className="text-[10px] bg-zinc-100 text-zinc-500 font-mono px-2 py-1 rounded-md">
                    2026 CY Indexes Active
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-2 py-1 rounded-md border border-indigo-100">
                    Gemini-3.5 Intelligence
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      )}
    </main>

      {/* Corporate Footnote branding */}
      <footer className="bg-white border-t border-zinc-200 mt-auto py-4 px-6 text-center text-xs text-zinc-450 flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div>
          © 2026 CareerMentor AI. Deep talent analytics for academic development.
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono tracking-tight">
          <span>PORT INGRESS ROUTING 3000 SSL</span>
          <span>•</span>
          <span>VERIFIED ENCRYPTED SANDBOX SCHEMA</span>
        </div>
      </footer>
    </div>
  );
}
