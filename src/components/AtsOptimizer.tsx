import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Lightbulb, 
  Award, 
  RotateCcw, 
  Briefcase,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AtsEvaluation } from "../types";

// High-quality resume drafting templates loaded with realistic details for demonstration:
const MOCK_RESUMES = {
  unoptimized: `ABHISHEK K.
Junior Software Developer | abhi.k@email.com | (555) 019-2831

OBJECTIVE:
Highly motivated, hardworking and dedicated Software Engineering student trying to learn things. Reliable team player with great communication skills looking for a beginner developer job in a good organization.

TECHNICAL SKILLS:
- Languages: Python, Java, Basic HTML/CSS, SQL
- Tools: Git, VS Code, Windows

EXPERIENCE:
Computer Science Club - Developer Assistant
June 2025 - Present
- Assisted club members in learning basic coding, Java syntax and setting up SQL databases.
- Helped design a database structure to store club attendance logs.
- Worked on coordinates of assignments and writing basic manuals.
- Created local programs to calculate scores.

Personal Projects:
Stock Trend App
- Built a standard stock prediction calculator using historically trends in Python.
- Displayed information on simple charts.
- Learned how to write code and fix compile errors quickly.`,

  optimized: `SARA CHEN
ML & Backend Systems Specialist | sara.chen@email.com | (555) 890-1234 | GitHub: github.com/sarachen

PROFESSIONAL SUMMARY:
Analytical Systems Engineer with 3+ years of expertise designing and deploying distributed microservices, neural network training pipelines, and optimized cloud data stores.

TECHNICAL STACK:
- Languages & Core: Python, JavaScript, TypeScript, SQL, C++
- Data & Machine Learning: PyTorch, Pandas, NumPy, scikit-learn, Redis
- Infrastructure: AWS (S3, EC2), Docker, Kubernetes, CI/CD, Git, PostgreSQL

PROFESSIONAL EXPERIENCE:
QuantStream Technologies - Systems Automation Lead
September 2024 - Present
- Architected and deployed an automated, parallel financial scraping pipeline in Python, increasing ingestion rate by 42% while decreasing localized API throttling failures by 15%.
- Fine-tuned transformer models using PyTorch on custom domain-level datasets, elevating signal search recall score from 71% to 88% across 10M+ vectorized reports.
- Mentored 4 junior technical members, establishing TypeScript strict guidelines and strict code test coverage, which accelerated standard deployment velocity by 25%.

Apex Cloud Solutions - Junior Backend Developer
May 2023 - August 2024
- Migrated legacy SQL queries to optimized composite indexing structures, achieving a 30% reduction in query execution times for high-volume transactions.
- Containerized 12+ distributed microservices utilizing Docker and successfully managed orchestrations on AWS ECS, saving $14K+ in annual hosting operational expenses.
- Maintained 99.98% web platform uptime metrics by establishing robust CI/CD Github action workflows and unit test assertion suites.`
};

export default function AtsOptimizer() {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<AtsEvaluation | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse text or document file on upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    setResumeText(""); // Clear previous text to indicate reload state

    const reader = new FileReader();
    const lcName = file.name.toLowerCase();
    const isPlain = lcName.endsWith(".txt") || lcName.endsWith(".md") || file.type === "text/plain";
    
    if (isPlain) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text.trim().length === 0) {
          setError("The uploaded plain text file appears to be empty.");
        } else {
          setResumeText(text);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the imported plain-text document content.");
      };
      reader.readAsText(file);
    } else {
      // It's a structured/binary document (PDF, DOCX, DOC, RTF)
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          if (!buffer || buffer.byteLength === 0) {
            setError("The uploaded document carries an empty body.");
            return;
          }

          // Read the array bytes to extract printable string patterns
          const view = new Uint8Array(buffer);
          let extractedText = "";
          let chunk = "";
          
          for (let i = 0; i < view.length; i++) {
            const byte = view[i];
            
            // Check for printable characters: ASCII 32 to 126, tabs, spaces, newlines, carriage returns
            if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
              chunk += String.fromCharCode(byte);
            } else {
              // Word or statement complete
              if (chunk.trim().length >= 3) {
                const cleanChunk = chunk.trim();
                // Filter out standard non-text zipped/XML boilerplate metadata from DOCX and structural PDF descriptors
                if (
                  !cleanChunk.includes("word/_rels") &&
                  !cleanChunk.includes("[Content_Types]") &&
                  !cleanChunk.includes("schemas.openxmlformats") &&
                  !cleanChunk.startsWith("PK") &&
                  !cleanChunk.startsWith("<svg") &&
                  !cleanChunk.includes("xmlns:") &&
                  !cleanChunk.includes("relationships") &&
                  !cleanChunk.includes("font-family") &&
                  !cleanChunk.includes("font-size") &&
                  !cleanChunk.includes("xml version")
                ) {
                  // Basic regex to strip stray markup tags if present in the chunk
                  const stripped = cleanChunk.replace(/<[^>]+>/g, " ").trim();
                  if (stripped.length >= 3) {
                    extractedText += stripped + "\n";
                  }
                }
              }
              chunk = "";
              
              // Prevent browser freeze for mammoth sized files
              if (extractedText.length > 200000) {
                break;
              }
            }
          }
          
          if (chunk.trim().length >= 3) {
            const stripped = chunk.trim().replace(/<[^>]+>/g, " ").trim();
            if (stripped.length >= 3) {
              extractedText += stripped + "\n";
            }
          }

          // Clean layout structural strings from PDFs
          let finalClean = extractedText
            .replace(/\/[A-Za-z0-9]+/g, " ") // PDF object keywords like /Type /Page /Font /MediaBox
            .replace(/\+\+[A-Z0-9]+/g, " ") // Dynamic PDF fonts prefix
            .replace(/\b[0-9]+\s+[0-9]+\s+obj\b/gi, "") // PDF obj layout anchors
            .replace(/\bendobj\b/gi, "")
            .replace(/\bstream\b/gi, "")
            .replace(/\bendstream\b/gi, "")
            .replace(/[^a-zA-Z0-9\s\-\.\,\@\(\)\:\;\&\/\+\=\?\!\#\%\*\_]/g, " ") // Strip any stray binary junk characters
            .replace(/\s+/g, " ") // Flatten excess whitespaces
            .trim();

          // Ensure it's not totally empty or just noise markers
          if (finalClean.length < 20) {
            // Attempt to fall back to general string-based character collection
            const simpleAsciiFallback = Array.from(view.slice(0, 45000))
              .map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : "")
              .join("")
              .replace(/\s+/g, " ");

            const matchedKeywords = ["React", "TypeScript", "Node", "Python", "SQL", "Docker", "AWS", "GitHub", "Developer", "Manager", "Analyst", "Engineer"];
            const foundKeywords = matchedKeywords.filter(k => simpleAsciiFallback.toLowerCase().includes(k.toLowerCase()));

            finalClean = `[Extracted Document Data - ${file.name}]\n\n`;
            finalClean += `Note: Extracted raw text metadata layer from resume. Verify or edit the content below.\n\n`;
            if (foundKeywords.length > 0) {
              finalClean += `Detected Core Competencies: ${foundKeywords.join(", ")}\n\n`;
            }
            finalClean += `Document Overview:\n`;
            finalClean += `- File Name: ${file.name}\n`;
            finalClean += `- Size: ${(file.size / 1024).toFixed(1)} KB\n\n`;
            finalClean += `Extracted Segment Block:\n`;
            finalClean += `${simpleAsciiFallback.slice(0, 1500).trim()}...`;
          }

          setResumeText(finalClean);
        } catch (err) {
          console.error("Binary text parsing failed:", err);
          setError("Failed to parse the file structure. Please copy and paste its text directly into our raw text view box.");
        }
      };
      reader.onerror = () => {
        setError("Failed to load binary document data.");
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadTemplate = (key: "unoptimized" | "optimized") => {
    setError(null);
    setResumeText(MOCK_RESUMES[key]);
    setFileName(key === "unoptimized" ? "abhi_resume_unoptimized.txt" : "sara_resume_calibrated.txt");
  };

  const triggerAnalysis = async () => {
    const trimmedText = (resumeText || "").trim();
    if (!trimmedText) {
      setError("Please paste your resume text or upload a document first. The active resume space cannot be empty.");
      setEvaluation(null);
      return;
    }

    setLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      const response = await fetch("/api/ats-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText: trimmedText,
          fileName: fileName || "pasted_text_resume.txt",
          targetRole: "", // Omitted: backend defaults
          targetDescription: "" // Omitted: backend defaults
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setEvaluation(data);
    } catch (err: any) {
      console.error("ATS optimization error:", err);
      setError(`Analysis connection failed: ${err.message || "Please check API backend integrations."}`);
    } finally {
      setLoading(false);
    }
  };

  const resetParserState = () => {
    setResumeText("");
    setFileName("");
    setEvaluation(null);
    setError(null);
  };

  const handleCopyRewrite = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 font-sans text-zinc-800" id="ats-resume-suite">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-150 pb-5">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-extrabold">
            Recruiter Module
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Enterprise ATS Optimization Engine
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Evaluate document parsing structures, calculate keyword alignment, and get direct STAR actionable line-item rewrites.
          </p>
        </div>
        {evaluation && (
          <button 
            onClick={resetParserState}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-650 hover:bg-zinc-50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Parser</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!evaluation ? (
          <motion.div 
            key="input-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Template Selector Card */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Quick Experience Loading
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Load pre-configured resume models to test high vs low ATS scoring patterns easily!
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLoadTemplate("unoptimized")}
                  className="px-3 py-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100/80 rounded-lg font-medium border border-amber-200/50 transition cursor-pointer"
                >
                  Load Below-80 Resume
                </button>
                <button
                  onClick={() => handleLoadTemplate("optimized")}
                  className="px-3 py-1.5 text-xs text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg font-medium border border-indigo-200/50 transition cursor-pointer"
                >
                  Load Elite 85+ Resume
                </button>
              </div>
            </div>

            {/* Document upload zone */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left col: Uploading workspace */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Resume Stream Processor
                </label>
                
                {/* Drag zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-200 hover:border-zinc-400 bg-white"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".txt,.md,.pdf,.docx,.doc,.rtf" 
                    onChange={handleFileChange} 
                  />
                  
                  <div className={`p-3 rounded-full mb-3 ${
                    isDragging ? "bg-zinc-200 text-zinc-900 animate-bounce" : "bg-zinc-50 text-zinc-450"
                  }`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  
                  <h4 className="text-xs font-bold text-zinc-800">
                    {fileName ? `Loaded: ${fileName}` : "Drag and drop resume here"}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-1 max-w-[280px]">
                    Supports PDF, DOCX, DOC, RTF, TXT, or MD formats. Click to browse local folders.
                  </p>
                </div>

                {/* Status or error feedback */}
                {error && (
                  <div className="p-3 bg-red-50 text-red-850 rounded-lg border border-red-200/60 flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Analyze Trigger */}
                <button
                  type="button"
                  disabled={loading || !resumeText.trim()}
                  onClick={triggerAnalysis}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 tracking-wide cursor-pointer transition ${
                    loading || !resumeText.trim()
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                      : "bg-zinc-950 text-white hover:bg-zinc-900 active:scale-[0.99] border border-transparent shadow-xs"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                      <span>Calibrating 2026 Engine Parser...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Analyze Resume ATS Suitability</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right col: Pasting block fallback */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Raw Text Sandbox & Pasting View
                  </label>
                  {resumeText && (
                    <button 
                      onClick={() => { setResumeText(""); setFileName(""); }} 
                      className="text-[10px] text-zinc-455 font-semibold hover:text-zinc-700"
                    >
                      Clear Content
                    </button>
                  )}
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (!fileName) setFileName("raw_pasted_data.txt");
                  }}
                  placeholder="Paste candidate resume plain text layout block here (E.g. Contacts, Educational headers, Job descriptions, skills summary) to analyze structure..."
                  className="flex-1 min-h-[240px] p-4 text-xs font-mono font-medium rounded-xl border border-zinc-200 focus:border-zinc-400 focus:outline-none focus:ring-0 leading-relaxed bg-zinc-50/20 shadow-inner"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis-results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Scoreboard Block */}
            {(() => {
              const scoreNum = evaluation.score ?? evaluation.atsScore ?? 0;
              const keywordsVal = evaluation.breakdown?.keywordDensity ?? evaluation.breakdown?.keywords ?? 0;
              const formattingVal = evaluation.breakdown?.parsability ?? evaluation.breakdown?.formatting ?? 0;
              const analyticsVal = evaluation.breakdown?.structuralImpact ?? evaluation.breakdown?.analytics ?? 0;
              const depthVal = evaluation.breakdown?.depth ?? 0;

              return (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Gauge */}
                    <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Overall Suitability Metric
                        </h3>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-5xl font-black text-zinc-900 tracking-tight">
                            {scoreNum}
                          </span>
                          <span className="text-sm font-semibold text-zinc-400">/ 100</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed mt-2.5">
                          Evaluated metrics compare candidate layout properties, core boolean match keywords, and quantifications to 2026 guidelines.
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-zinc-200">
                        <div className="flex justify-between text-xs mb-1.5 font-medium text-zinc-600">
                          <span>ATS Matching Category</span>
                          <span className={`font-bold ${scoreNum < 80 ? "text-amber-700" : "text-indigo-700"}`}>
                            {scoreNum < 80 ? "Restructure Urged" : "High Calibration"}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              scoreNum < 80 ? "bg-amber-500" : "bg-indigo-600"
                            }`} 
                            style={{ width: `${scoreNum}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sub-components metrics breakdown slider bars */}
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl lg:col-span-2 space-y-4">
                      <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Diagnostic Dimension Weightings
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Item 1 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-600 flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 scroll-py-1 shrink-0" />
                              Keyword density
                            </span>
                            <span className="font-bold text-zinc-900">{keywordsVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-800" style={{ width: `${keywordsVal}%` }} />
                          </div>
                        </div>

                        {/* Item 2 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-600 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 scroll-py-1 shrink-0" />
                              Formatting & Parsability
                            </span>
                            <span className="font-bold text-zinc-900">{formattingVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-800" style={{ width: `${formattingVal}%` }} />
                          </div>
                        </div>

                        {/* Item 3 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-600 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 scroll-py-1 shrink-0" />
                              Structural Impact & Analytics
                            </span>
                            <span className="font-bold text-zinc-900">{analyticsVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-800" style={{ width: `${analyticsVal}%` }} />
                          </div>
                        </div>

                        {/* Item 4 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-600 flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5 scroll-py-1 shrink-0" />
                              Depth density Index
                            </span>
                            <span className="font-bold text-zinc-900">{depthVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-800" style={{ width: `${depthVal}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-150 text-[11px] text-zinc-550 italic leading-relaxed mt-1">
                        Parsing diagnostics: {evaluation.parsingFeedback}
                      </div>
                    </div>
                  </div>

                  {/* Expert Diagnostic Assessment - Highlighted Warnings/Success Box */}
                  <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                    scoreNum < 80 
                      ? "bg-amber-50/30 border-amber-200/80 shadow-xs" 
                      : "bg-indigo-50/20 border-indigo-200/60 shadow-xs"
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200/40">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          scoreNum < 80 ? "bg-amber-100 text-amber-850" : "bg-indigo-100 text-indigo-850"
                        }`}>
                          {scoreNum < 80 ? (
                            <Lightbulb className="w-5.5 h-5.5 text-amber-700 font-bold" />
                          ) : (
                            <Award className="w-5.5 h-5.5 text-indigo-750 font-bold" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                              scoreNum < 80 ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
                            }`}>
                              Expert Analyst Audit
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">Calibrated to 2026 Standards</span>
                          </div>
                          <h4 className="text-sm font-bold text-zinc-900 tracking-tight font-sans mt-0.5">
                            {scoreNum < 80 
                              ? "Restructure Requested: Critical Roadblocks Found" 
                              : "Verified Professional Standard Passed"}
                          </h4>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end shrink-0">
                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                          Profile Suitability Status
                        </div>
                        <div className={`text-xs font-bold mt-0.5 flex items-center gap-1.5 ${
                          scoreNum < 80 ? "text-amber-800" : "text-indigo-800"
                        }`}>
                          {scoreNum < 80 ? (
                            <>
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                              Unresolved Filter Conflicts
                            </>
                          ) : (
                            <>
                              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
                              Enterprise Filter Approved
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score analysis text and expert assessment */}
                    <div className="space-y-4 pt-4 text-xs text-zinc-650 leading-relaxed font-sans">
                      <p>
                        As an expert ATS score analyzer, I processed your resume content against Enterprise talent pools. Your calculated suitability metric registers at <strong className="font-bold text-zinc-900">{scoreNum}/100</strong>. 
                        {scoreNum < 80 ? (
                          <span> Key automatic screening software blocks resumes scoring below <strong className="text-zinc-900 font-bold">80</strong> directly. Read our tactical step-by-step diagnostic breakdown below to immediately address parsing errors.</span>
                        ) : (
                          <span> Excellent work! You comfortably cleared the minimum <strong className="text-zinc-900 font-bold">80</strong> benchmark threshold. Incorporate our optional minor revisions below to align even closer to 95+.</span>
                        )}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Structural column */}
                        <div className="bg-white p-4 rounded-xl border border-zinc-150/80 space-y-3">
                          <h5 className="text-[10px] font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                            Core Parser Diagnostics & Risks
                          </h5>
                          <div className="space-y-2 text-zinc-500 leading-relaxed">
                            <div>
                              <strong className="text-zinc-700 block text-[11px]">Detected Job Category:</strong>
                              <span className="text-[11px] font-mono select-all font-semibold italic bg-zinc-50 px-1 py-0.5 border border-zinc-100 rounded">
                                {evaluation.detectedRole}
                              </span>
                            </div>
                            <div>
                              <strong className="text-zinc-700 block text-[11px]">Explanation:</strong>
                              <p className="text-[11px] text-zinc-550 leading-normal mt-0.5">
                                {evaluation.expertAdvice?.breakdownExplanation || (scoreNum < 80 
                                  ? "Your resume has layout or keyword gaps causing screening friction." 
                                  : "Your formatting displays chronological alignment, easing search parsers.")}
                              </p>
                            </div>
                            {evaluation.expertAdvice?.highPriorityWarnings && evaluation.expertAdvice.highPriorityWarnings.length > 0 && (
                              <div>
                                <strong className="text-amber-800 block text-[11px] font-bold mt-1.5">High-Priority Parser Alerts:</strong>
                                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/95 mt-0.5">
                                  {evaluation.expertAdvice.highPriorityWarnings.map((warn, wIdx) => (
                                    <li key={wIdx}>{warn}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Immediate corrective instructions */}
                        <div className="bg-white p-4 rounded-xl border border-zinc-150/80 space-y-3">
                          <h5 className="text-[10px] font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                            {scoreNum < 80 ? "Critical Corrective Step Plan" : "High Calibration Action Items"}
                          </h5>
                          <div className="space-y-2.5 text-[11px] text-zinc-650 leading-snug">
                            {(evaluation.expertAdvice?.actionableSuggestions || []).map((suggestion, sIdx) => (
                              <div key={sIdx} className="flex gap-2 items-start mt-0.5">
                                <span className={`${scoreNum < 80 ? "bg-amber-100 text-amber-900" : "bg-indigo-100 text-indigo-900"} font-bold text-[9px] px-1.5 py-0.5 rounded block shrink-0`}>
                                  {sIdx + 1}
                                </span>
                                <span>{suggestion}</span>
                              </div>
                            ))}
                            {(!evaluation.expertAdvice?.actionableSuggestions || evaluation.expertAdvice.actionableSuggestions.length === 0) && (
                              scoreNum < 80 ? (
                                <>
                                  <div className="flex gap-2 items-start text-zinc-550 leading-tight">
                                    <span className="bg-amber-100 text-amber-900 font-bold text-[9px] px-1 rounded block mt-0.5">1</span>
                                    <span><strong>Inject Key Tags:</strong> Ensure missing technologies (like <i>{evaluation.missingKeywords.slice(0, 2).join(", ") || "essential libs"}</i>) occupy bullet statements.</span>
                                  </div>
                                  <div className="flex gap-2 items-start text-zinc-550 leading-tight">
                                    <span className="bg-amber-100 text-amber-900 font-bold text-[9px] px-1 rounded block mt-0.5">2</span>
                                    <span><strong>Convert Duties:</strong> Remove passive assertions. Reframe items utilizing our custom STAR suggestions shown below.</span>
                                  </div>
                                  <div className="flex gap-2 items-start text-zinc-550 leading-tight">
                                    <span className="bg-amber-100 text-amber-900 font-bold text-[9px] px-1 rounded block mt-0.5">3</span>
                                    <span><strong>Flatten Tables:</strong> Eliminate intricate graphic borders, tables, or complex left/right sidebars.</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex gap-2 items-start text-zinc-550 leading-tight">
                                    <span className="bg-indigo-100 text-indigo-900 font-bold text-[9px] px-1.5 rounded block mt-0.5">✓</span>
                                    <span>Maximize credibility indexing by adding hyperlinks to production-level GitHub projects.</span>
                                  </div>
                                  <div className="flex gap-2 items-start text-zinc-550 leading-tight">
                                    <span className="bg-indigo-100 text-indigo-900 font-bold text-[9px] px-1.5 rounded block mt-0.5">✓</span>
                                    <span>Integrate missing terminology blocks <i>({evaluation.missingKeywords.slice(0, 2).join(", ")})</i> to lock down perfect search alignment.</span>
                                  </div>
                                </>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Keyword Match Pools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Detected */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3">
                <h4 className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Identified Target Keywords
                </h4>
                <p className="text-[11px] text-zinc-500">
                  The semantic agent extracted these core concepts as successfully parsed skill credentials.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {evaluation.identifiedKeywords.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 text-xs bg-zinc-50 border border-zinc-150 text-zinc-700 font-mono rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {evaluation.identifiedKeywords.length === 0 && (
                    <span className="text-xs text-zinc-400 italic">No technology tags detected in search sweep.</span>
                  )}
                </div>
              </div>

              {/* Missing keywords */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3">
                <h4 className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Missing Critical Keywords Gaps
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Consider weaving these highly matching tokens into experience sections to trigger recruiters&apos; Boolean searches.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {evaluation.missingKeywords.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 text-xs bg-amber-50/50 border border-amber-200/50 text-amber-900 font-mono rounded"
                    >
                      + {tag}
                    </span>
                  ))}
                  {evaluation.missingKeywords.length === 0 && (
                    <span className="text-xs text-zinc-400 italic">Excellent! No severe keyword gaps detected.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Negative Indicators Flagged */}
            {evaluation.redFlags.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3">
                <h4 className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="text-red-500 font-black">!</span>
                  Parsing Warning Indicators & Red Flags
                </h4>
                <div className="space-y-2">
                  {evaluation.redFlags.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600 leading-relaxed">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Actionable STAR Rewrites */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Expert STAR Line-Item Optimization
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  We scanned your resume and identified weak descriptive phrases. Replace them with these high-impact accomplishments:
                </p>
              </div>

              <div className="space-y-4">
                {evaluation.actionableRewrites.map((item, idx) => (
                  <div key={idx} className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-150 space-y-3 transition hover:shadow-xs">
                    
                    {/* Before/After panel block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      
                      {/* Before (Weak) */}
                      <div className="p-3 bg-white rounded-lg border border-red-105/60 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-red-500 font-mono tracking-wider">
                          Before (Weak Task Duty)
                        </span>
                        <p className="text-zinc-600 leading-relaxed font-mono text-[11px]">
                          &ldquo;{item.before}&rdquo;
                        </p>
                      </div>

                      {/* After (STAR Calibrated) */}
                      <div className="p-3 bg-indigo-50/20 rounded-lg border border-indigo-150/70 space-y-1 relative group">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase font-bold text-indigo-650 font-mono tracking-wider">
                            After (Quantified STAR Rewrite)
                          </span>
                          
                          <button
                            onClick={() => handleCopyRewrite(item.after, idx)}
                            className="p-1 rounded bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-500 hover:text-zinc-700 transition duration-150 cursor-pointer"
                            title="Copy to Clipboard"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-zinc-900 font-semibold leading-relaxed font-sans text-[11px] pr-6">
                          &ldquo;{item.after}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Reasoning advice */}
                    <div className="flex items-start gap-1.5 text-[11px] text-zinc-550 mt-1 leading-normal italic pl-1">
                      <span className="text-indigo-600 font-bold">&#8250;</span>
                      <span><strong>Calibration reasoning:</strong> {item.reasoning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back to upload view action button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={resetParserState}
                className="px-5 py-2.5 rounded-lg text-xs font-bold border border-zinc-200 bg-white hover:bg-zinc-50 transition tracking-wide flex items-center gap-1.5 cursor-pointer"
              >
                <span>Upload Another Document</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
