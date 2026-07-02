import React, { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";

interface ReportMarkdownViewProps {
  markdown: string;
}

export default function ReportMarkdownView({ markdown }: ReportMarkdownViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy report text: ", err);
    }
  };

  return (
    <div id="markdown-viewer-panel" className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight font-sans">
            Strict Markdown Individual Report
          </h3>
          <p className="text-xs text-zinc-400 font-sans">
            Unaltered standard markdown conforming directly to CareerMentor assessment models.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Markdown</span>
            </>
          )}
        </button>
      </div>

      <div className="relative rounded-xl border border-zinc-200 bg-zinc-950 font-mono text-xs overflow-hidden">
        {/* Top title bar */}
        <div className="px-4 py-2 bg-zinc-900 text-zinc-400 flex items-center justify-between border-b border-zinc-850">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>individual_assessment_report.md</span>
          </span>
          <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wider text-zinc-500">
            Strict MD Schema v1.1
          </span>
        </div>

        {/* Markdown Source box */}
        <pre className="p-4 overflow-x-auto text-zinc-300 max-h-[500px] leading-relaxed whitespace-pre-wrap select-all font-mono scrollbar-custom">
          {markdown || "Loading report template..."}
        </pre>
      </div>
    </div>
  );
}
