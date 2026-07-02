import React, { useState } from "react";
import { 
  Sparkles, 
  Play, 
  BookOpen, 
  ChevronRight, 
  Check, 
  HelpCircle, 
  ArrowRight,
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  RotateCcw,
  UserCheck,
  CheckCircle2,
  ListTodo,
  FileSpreadsheet,
  FileCheck,
  XCircle,
  Award,
  GraduationCap,
  FileText,
  BadgeAlert
} from "lucide-react";
import { MockQuestion, AnswerEvaluation } from "../types";

interface InterviewSimulatorProps {
  userDegree?: string;
  userMajor?: string;
  userTechnicalSkills?: string;
}

export default function InterviewSimulator({ 
  userDegree = "Bachelor of Science", 
  userMajor = "Computer Science", 
  userTechnicalSkills = "Python, PyTorch, SQL, Java" 
}: InterviewSimulatorProps) {
  const [targetRole, setTargetRole] = useState("AI Developer / Software Engineer");
  const [interviewType, setInterviewType] = useState("Mixed Technical & Behavioral");
  
  // Choose interview format mode: "combined" (blended), "verbal" (STAR open response), or "mcq" (only quiz)
  const [interviewMode, setInterviewMode] = useState<"combined" | "verbal" | "mcq">("combined");
  
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // State for verbal feedback answers
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, AnswerEvaluation>>({});
  const [evaluatingQId, setEvaluatingQId] = useState<string | null>(null);

  // State for MCQ answers
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, number>>({});
  const [submittedMcqAnswers, setSubmittedMcqAnswers] = useState<Record<string, boolean>>({});

  const [errorText, setErrorText] = useState("");

  const handleStartInterview = async () => {
    setLoading(true);
    setErrorText("");
    setQuestions([]);
    setEvaluations({});
    setUserAnswers({});
    setSelectedMcqAnswers({});
    setSubmittedMcqAnswers({});
    setCurrentIdx(0);

    try {
      const response = await fetch("/api/interview/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degree: userDegree,
          major: userMajor,
          technicalSkills: userTechnicalSkills,
          targetRole,
          interviewType,
          interviewMode
        })
      });

      if (!response.ok) {
        throw new Error("Could not formulate interview questions. Please try again.");
      }

      const val = await response.json();
      if (val.questions && val.questions.length > 0) {
        setQuestions(val.questions);
      } else {
        throw new Error("No interview configurations produced from the AI. Modify settings and retry.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An unexpected error occurred during interview setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (qId: string, qText: string, rubric: string) => {
    const answerText = userAnswers[qId];
    if (!answerText || !answerText.trim()) {
      alert("Please type a meaningful mock answer before submitting for evaluation!");
      return;
    }

    setEvaluatingQId(qId);
    setErrorText("");

    try {
      const response = await fetch("/api/interview/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: qText,
          rubric,
          userAnswer: answerText
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process answer evaluation.");
      }

      const evalData = await response.json();
      setEvaluations(prev => ({
        ...prev,
        [qId]: evalData
      }));
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An issue occurred evaluating your answer.");
    } finally {
      setEvaluatingQId(null);
    }
  };

  const handleMcqOptionSelect = (qId: string, optionIdx: number) => {
    if (submittedMcqAnswers[qId]) return; // locked in
    setSelectedMcqAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleMcqSubmit = (qId: string) => {
    if (selectedMcqAnswers[qId] === undefined) {
      alert("Please choose one option before submitting!");
      return;
    }
    setSubmittedMcqAnswers(prev => ({
      ...prev,
      [qId]: true
    }));
  };

  // Set the answer for the currently viewed questionId
  const handleAnswerChange = (qId: string, text: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: text
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const activeQuestion = questions[currentIdx];
  const activeIsMcq = activeQuestion?.type === "mcq" || (activeQuestion?.options && activeQuestion.options.length > 0);
  const activeEval = activeQuestion ? evaluations[activeQuestion.id] : null;

  // Real-time metrics helper
  const mcqQuestionsCount = questions.filter(q => q.type === "mcq" || (q.options && q.options.length > 0)).length;
  const verbalQuestionsCount = questions.filter(q => q.type === "verbal" || !(q.options && q.options.length > 0)).length;

  const solvedMcqsCount = questions.filter(q => (q.type === "mcq" || q.options) && submittedMcqAnswers[q.id]).length;
  const correctMcqsCount = questions.filter(q => {
    const isM = q.type === "mcq" || q.options;
    return isM && submittedMcqAnswers[q.id] && selectedMcqAnswers[q.id] === q.correctOptionIndex;
  }).length;

  const solvedVerbalsCount = questions.filter(q => {
    const isV = q.type === "verbal" || !q.options;
    return isV && evaluations[q.id];
  }).length;

  // Average open STAR answer score
  const verbalScores = questions
    .filter(q => q.type === "verbal" || !q.options)
    .map(q => evaluations[q.id]?.score)
    .filter(s => s !== undefined) as number[];
  const averageVerbalScore = verbalScores.length > 0 
    ? Math.round(verbalScores.reduce((a, b) => a + b, 0) / verbalScores.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Upper header summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight font-sans">
            AI Blended Interview Simulator
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Test competency through a combined sequence of rapid MCQs and deep open STAR response feedback scenarios.
          </p>
        </div>
        {questions.length > 0 && (
          <button
            onClick={handleStartInterview}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 border border-zinc-200 bg-white px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Setup / Format</span>
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        /* Configuration Parameters Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-zinc-800" />
              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">
                Configure Interview parameters
              </h3>
            </div>

            <div className="space-y-4">
              {/* Blended Mode Choices */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                  <span>Choose Assessment Matrix Formats</span>
                  <span className="text-[10px] text-zinc-400 font-normal">(Options consolidated)</span>
                </label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: COMBINED (Default) */}
                  <button
                    type="button"
                    onClick={() => setInterviewMode("combined")}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                      interviewMode === "combined"
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white hover:bg-zinc-50/70 text-zinc-700"
                    }`}
                  >
                    {interviewMode === "combined" && (
                      <div className="absolute right-3 top-3 bg-indigo-600 text-white text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold">
                        RECOMMENDED
                      </div>
                    )}
                    <div className="flex items-center gap-2 font-bold text-xs mt-0.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Consolidated Blended Assessment (MCQ + Verbal Answer Loop)</span>
                    </div>
                    <p className={`text-[11px] mt-1.5 font-normal leading-relaxed ${interviewMode === "combined" ? "text-zinc-300" : "text-zinc-400"}`}>
                      Best of both worlds. Dynamic generation of exactly <strong>3 Multiple Choice questions</strong> testing hard skills + <strong>2 detailed open-ended STAR scenarios</strong> analyzing systems logic and communication.
                    </p>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 2: ONLY VERBAL */}
                    <button
                      type="button"
                      onClick={() => setInterviewMode("verbal")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        interviewMode === "verbal"
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Interactive Verbal Only</span>
                      </div>
                      <p className={`text-[10px] mt-1 font-normal leading-normal ${interviewMode === "verbal" ? "text-zinc-300" : "text-zinc-400"}`}>
                        3 detailed STAR behavioral or engineering queries.
                      </p>
                    </button>

                    {/* Option 3: ONLY MCQ */}
                    <button
                      type="button"
                      onClick={() => setInterviewMode("mcq")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        interviewMode === "mcq"
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <ListTodo className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Multiple-Choice Only</span>
                      </div>
                      <p className={`text-[10px] mt-1 font-normal leading-normal ${interviewMode === "mcq" ? "text-zinc-300" : "text-zinc-400"}`}>
                        5 dynamic technical MCQs mapped to your stack.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Specific inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-750 block">Target Occupation / Role Focus</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Engineer, Machine Learning Specialist"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-750 block">Screening Concentration Focus</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-zinc-900"
                  >
                    <option value="Mixed Technical & Behavioral">Mixed Technical & Corporate Behavioral</option>
                    <option value="Core Technical Coding">Core Technical Coding & Algorithm optimization</option>
                    <option value="System Design & Architecture">System Design, Cloud & Scale architecture</option>
                    <option value="Executive Behavioral Leadership">Executive Leadership, Adaptability & STAR conflicts</option>
                  </select>
                </div>
              </div>

              {/* Profile card summary */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Target Candidate Bio Metadata:</span>
                </div>
                <div className="text-[11px] text-zinc-600 font-sans space-y-0.5">
                  <div><strong>Degree:</strong> {userDegree} in {userMajor}</div>
                  <div className="truncate"><strong>Technical Skill-base:</strong> {userTechnicalSkills}</div>
                </div>
              </div>

              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 rounded-xl text-xs flex gap-2">
                  <BadgeAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorText}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleStartInterview}
                disabled={loading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-350 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>AI Synthesizing Customized Blended Loop...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Initialize Combined Screening Module</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right guidance panel */}
          <div className="lg:col-span-6 flex flex-col justify-center p-6 border-l border-zinc-100 lg:pl-10 space-y-4">
            <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl max-w-md space-y-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-zinc-200 text-amber-500 shadow-2xs">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              
              <div className="space-y-1.5">
                <h4 className="font-bold text-zinc-800 text-sm">Combined Interview Format Mechanics:</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  By blending MCQ checks with open STAR responses, this module simulates modern recruitment workflows.
                </p>
              </div>

              <div className="space-y-2 text-xs text-zinc-700">
                <div className="flex items-start gap-2">
                  <div className="bg-emerald-100 text-emerald-800 font-mono text-[10px] w-5 h-5 rounded-md flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                  <span className="font-sans text-[11px] leading-relaxed">
                    <strong>Technical MCQs:</strong> Instantly check your grasp of deep system metrics, libraries, or data paradigms. Option keys highlight detailed explanations once chosen.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-amber-100 text-amber-800 font-mono text-[10px] w-5 h-5 rounded-md flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                  <span className="font-sans text-[11px] leading-relaxed">
                    <strong>STAR Situational Open-Response:</strong> Test depth by answering complex challenges. The AI grades your written code blocks or behaviors against rubrics.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Interview interaction workspace */
        <div className="space-y-5">
          {/* Progress Timeline trackers */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-100/80 p-3.5 rounded-xl border border-zinc-200 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block font-mono">ASSESSMENT SEQUENCE TIMELINE</span>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isMcq = q.type === "mcq" || (q.options && q.options.length > 0);
                  
                  // Evaluated status checking
                  const isEvaluated = isMcq 
                    ? submittedMcqAnswers[q.id]
                    : evaluations[q.id];

                  const isCorrectMcq = isMcq && submittedMcqAnswers[q.id] && selectedMcqAnswers[q.id] === q.correctOptionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                        isCurrent
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-xs"
                          : isEvaluated
                          ? isMcq
                            ? isCorrectMcq 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-800 border border-rose-150"
                            : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                          : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200"
                      }`}
                    >
                      <span className="font-mono text-[10px] opacity-75">{isMcq ? "MCQ" : "Verbal"}</span>
                      <span>Q{idx + 1}</span>
                      {isEvaluated && (
                        isMcq ? (
                          isCorrectMcq ? <span className="font-extrabold text-emerald-600">✓</span> : <span className="font-extrabold text-rose-500">✗</span>
                        ) : <span className="font-extrabold text-indigo-600">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aggregated Score Badge display */}
            <div className="flex items-center gap-2shrink-0">
              <div className="flex gap-2">
                {mcqQuestionsCount > 0 && (
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-150 rounded-lg text-emerald-800 text-[11px] font-bold font-sans flex items-center gap-1">
                    <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quiz: {correctMcqsCount} / {solvedMcqsCount} correct</span>
                  </div>
                )}
                {verbalQuestionsCount > 0 && (
                  <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-150 rounded-lg text-indigo-800 text-[11px] font-bold font-sans flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Graded: {solvedVerbalsCount} / {verbalQuestionsCount} (Avg: {averageVerbalScore}/100)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Interactive active challenge workspace */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                
                {/* Active challenge heading */}
                <div className="space-y-2 border-b border-zinc-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-150 uppercase tracking-wider">
                        Question #{currentIdx + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        activeIsMcq ? "text-emerald-800 bg-emerald-50 border border-emerald-200" : "text-indigo-800 bg-indigo-50 border border-indigo-200"
                      }`}>
                        {activeIsMcq ? "Multiple Choice" : "STAR Open Response"}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">Difficulty: {activeQuestion.difficulty}</span>
                  </div>
                  
                  <h3 className="text-base font-bold text-zinc-900 leading-snug font-sans">
                    {activeQuestion.question}
                  </h3>
                </div>

                {/* DYNAMIC WORKSPACE BODY */}
                {activeIsMcq ? (
                  /* Active question is MCQ */
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block font-mono">
                      Select the single correct engineering answer:
                    </span>
                    
                    <div className="space-y-2">
                      {activeQuestion.options?.map((option, idx) => {
                        const isSelected = selectedMcqAnswers[activeQuestion.id] === idx;
                        const isSubmitted = submittedMcqAnswers[activeQuestion.id];
                        const isCorrect = activeQuestion.correctOptionIndex === idx;

                        let styleClass = "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 text-zinc-700";
                        if (isSelected && !isSubmitted) {
                          styleClass = "border-zinc-900 bg-zinc-50 font-semibold text-zinc-950";
                        } else if (isSubmitted) {
                          if (isCorrect) {
                            styleClass = "border-emerald-500 bg-emerald-50/40 text-emerald-900 font-bold";
                          } else if (isSelected) {
                            styleClass = "border-rose-400 bg-rose-50/40 text-rose-900 font-medium";
                          } else {
                            styleClass = "opacity-50 border-zinc-250 text-zinc-400";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleMcqOptionSelect(activeQuestion.id, idx)}
                            className={`w-full p-3 border rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${styleClass}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                                isSelected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{option}</span>
                            </div>

                            {isSubmitted && isCorrect && (
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                            )}
                            {isSubmitted && isSelected && !isCorrect && (
                              <XCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {!submittedMcqAnswers[activeQuestion.id] ? (
                      <button
                        type="button"
                        onClick={() => handleMcqSubmit(activeQuestion.id)}
                        disabled={selectedMcqAnswers[activeQuestion.id] === undefined}
                        className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Lock In Choice</span>
                      </button>
                    ) : (
                      /* Submitted MCQ details */
                      <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5 mt-2 animate-fade-in text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                          <span>Dynamic Skill Proof Explanation</span>
                        </div>
                        <p className="text-zinc-650 leading-relaxed font-sans mt-1 text-[11px]">
                          {activeQuestion.justification}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Active question is open response star feedback */
                  <div className="space-y-4">
                    {/* Rubric metrics */}
                    <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 flex items-start gap-2.5">
                      <BookOpen className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider">Evaluation Checklist</span>
                        <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                          {activeQuestion.rubric || "Evaluate based on clear explanation, algorithm parameters, and technical structure."}
                        </p>
                      </div>
                    </div>

                    {/* Speech response writing block */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 block">Your STAR Response Answer</label>
                      <textarea
                        rows={7}
                        placeholder="State your technical implementation or behavioral framework. Use STAR structure (Situation, Task, Action, Result) or input commenting lines if suggesting code architecture..."
                        value={userAnswers[activeQuestion.id] || ""}
                        onChange={(e) => handleAnswerChange(activeQuestion.id, e.target.value)}
                        className="w-full text-xs font-mono p-3 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-hidden focus:border-zinc-900 leading-relaxed scrollbar-custom"
                      ></textarea>
                    </div>

                    <button
                      onClick={() => handleSubmitResponse(activeQuestion.id, activeQuestion.question, activeQuestion.rubric || "")}
                      disabled={evaluatingQId === activeQuestion.id || !(userAnswers[activeQuestion.id]?.trim())}
                      className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {evaluatingQId === activeQuestion.id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Measuring Response Vector...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Submit mock response for AI grading</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Navigation Toggles footer */}
                <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100 text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={currentIdx === 0}
                      className="px-3 py-1.5 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      Prior Q
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIdx === questions.length - 1}
                      className="px-3 py-1.5 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      Next Q
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Question {currentIdx + 1} of {questions.length} ({activeIsMcq ? "MCQ" : "Verbal"})
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamics Stats metrics dashboard & evaluation report */}
            <div className="lg:col-span-6">
              
              {activeIsMcq ? (
                /* Stats card when dealing with active MCQ */
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-2xs min-h-[440px]">
                  <div className="border-b border-zinc-150 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-800 font-sans">Interactive MCQ Progress Check</h4>
                        <p className="text-[11px] text-zinc-450">Review correct options and justifications</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full">
                      Section A: Theory
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl text-center">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Solved Question Accomp.</span>
                      <span className="text-3xl font-extrabold text-zinc-850 mt-1 block">
                        {solvedMcqsCount} <span className="text-xs text-zinc-400 font-normal">/ {mcqQuestionsCount}</span>
                      </span>
                    </div>

                    <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl text-center">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Correct Score Ratio</span>
                      <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">
                        {correctMcqsCount} <span className="text-xs text-zinc-400 font-normal">Correct</span>
                      </span>
                    </div>
                  </div>

                  {/* Summary lists */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase block font-mono">
                      Session index status:
                    </span>

                    <div className="space-y-1.5">
                      {questions.map((q, idx) => {
                        const isM = q.type === "mcq" || (q.options && q.options.length > 0);
                        if (!isM) return null;

                        const selection = selectedMcqAnswers[q.id];
                        const submitted = submittedMcqAnswers[q.id];
                        const isC = selection === q.correctOptionIndex;

                        return (
                          <div
                            key={q.id}
                            onClick={() => setCurrentIdx(idx)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              currentIdx === idx
                                ? "bg-zinc-900 border-zinc-900 text-white"
                                : "bg-zinc-50 hover:bg-zinc-100/50 text-zinc-700"
                            }`}
                          >
                            <span className="truncate pr-4 font-sans flex items-center gap-1.5">
                              <span className="font-bold font-mono">Q{idx + 1}:</span>
                              <span className="truncate">{q.question}</span>
                            </span>
                            <div className="shrink-0 flex items-center gap-1.5 pl-1">
                              {submitted ? (
                                isC ? (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">Correct</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded-md">Incorrect</span>
                                )
                              ) : selection !== undefined ? (
                                <span className="px-1 py-0.5 bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-100 rounded">Selected</span>
                              ) : (
                                <span className="text-[9px] text-zinc-400">Unanswered</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {solvedMcqsCount === mcqQuestionsCount && mcqQuestionsCount > 0 && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-250 rounded-xl space-y-1 text-center animate-fade-in text-xs">
                      <h5 className="font-bold uppercase tracking-wider flex items-center justify-center gap-1 text-emerald-800 text-[11px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        A: Technical Quiz components Solved!
                      </h5>
                      <span className="text-zinc-650 leading-relaxed font-sans block max-w-sm mx-auto text-[11px]">
                        Awesome effort. You correctly evaluated {correctMcqsCount} out of {mcqQuestionsCount} MCQ concepts. Switch questions above to complete the practical open STAR responses!
                      </span>
                    </div>
                  )}

                </div>
              ) : (
                /* STAR OPEN ANSWER DETAILED EVALUATION REPORT */
                evaluatingQId === activeQuestion.id ? (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 min-h-[440px] flex flex-col items-center justify-center text-center space-y-4 shadow-2xs">
                    <div className="w-12 h-12 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-zinc-800 text-sm">Evaluating Performance Matrix</h4>
                      <p className="text-xs text-zinc-400 max-w-xs leading-relaxed font-sans">
                        Reading your design patterns, measuring rubric alignment, assessing depth, and generating exemplary code and speech metrics...
                      </p>
                    </div>
                  </div>
                ) : activeEval ? (
                  <div className="space-y-4 animate-fade-in bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs">
                    
                    {/* Header alignment scoring */}
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div>
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">VERBAL EVALUATION GRADE</h4>
                        <div className="text-xs text-zinc-500 mt-0.5">Scored against professional corporate parameters.</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase block font-mono">COMPETENCY SCORE</div>
                        <span className="text-2xl font-extrabold text-indigo-700 font-sans">{activeEval.score} <span className="text-xs text-zinc-400 font-normal">/ 100</span></span>
                      </div>
                    </div>

                    {/* Pro/Con indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/10 space-y-2">
                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          STRENGTHS IDENTIFIED
                        </span>
                        <ul className="space-y-1">
                          {activeEval.strengthPoints?.map((item, idx) => (
                            <li key={idx} className="text-zinc-700 text-[11px] font-sans flex items-start gap-1 leading-normal">
                              <span className="text-emerald-500 font-bold shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/10 space-y-2">
                        <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1 font-mono">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          IMPROVEMENTS / GAPS
                        </span>
                        <ul className="space-y-1">
                          {activeEval.gapPoints?.map((item, idx) => (
                            <li key={idx} className="text-zinc-700 text-[11px] font-sans flex items-start gap-1 leading-normal">
                              <span className="text-amber-500 font-bold shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Advice briefly */}
                    <div className="bg-zinc-50/60 p-3.5 border border-zinc-200 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] tracking-wider font-extrabold uppercase text-zinc-400 block font-mono">Interviewer Actionable Advice</span>
                      <p className="text-zinc-650 leading-relaxed font-sans text-[11px]">{activeEval.nextStepsAdvice}</p>
                    </div>

                    {/* Model exemplar response text container */}
                    <div className="border border-zinc-200/80 rounded-xl overflow-hidden mt-1">
                      <div className="px-3.5 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center gap-1.5 text-zinc-300">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] font-bold leading-none font-sans">Model Exemplary Benchmark Answer</span>
                      </div>
                      <pre className="p-3.5 bg-zinc-950 text-emerald-400 font-mono text-[10px] leading-relaxed overflow-x-auto max-h-[170px] whitespace-pre-wrap select-all scrollbar-custom">
                        {activeEval.idealResponse}
                      </pre>
                    </div>
                  </div>
                ) : (
                  /* Standby waiting response STAR writeup */
                  <div className="bg-zinc-50/40 border border-zinc-200 rounded-2xl p-8 min-h-[440px] flex flex-col items-center justify-center text-center text-zinc-450 space-y-3 shadow-2xs">
                    <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400 shadow-2xs">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="font-bold text-zinc-700 font-sans text-xs">Section B: Conversational Feedback Diagnostics</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        Provide your answer in the STAR response text-area on the left. Once submitted, our AI logic evaluates against exact metrics, lists strong/gap attributes, and drafts the ideal model codebase answer.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {((solvedMcqsCount + solvedVerbalsCount) === questions.length) && questions.length > 0 && (
            <div className="p-5 bg-gradient-to-r from-zinc-90 w-full bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 text-white text-center animate-fade-in relative overflow-hidden">
              <div className="p-3.5 max-w-xl mx-auto space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-amber-400 mx-auto border border-white/20">
                  <Award className="w-6 h-6 animate-pulse" />
                </div>
                
                <h3 className="text-base font-bold tracking-tight">
                  Comprehensive Blended Competency Completed!
                </h3>
                
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  Excellent work navigating this simulated recruitment gate. You tackled <strong>{mcqQuestionsCount} technical theory MCQs</strong> scoring <strong>{Math.round((correctMcqsCount / (mcqQuestionsCount || 1)) * 100)}% accuracy</strong>, in tandem with <strong>{verbalQuestionsCount} practical developer scenario boards</strong> earning an average score of <strong>{averageVerbalScore} / 100</strong>.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleStartInterview}
                    className="bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs px-4  py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    Initiate Another Simulation
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
