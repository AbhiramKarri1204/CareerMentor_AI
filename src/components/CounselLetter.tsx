import React from "react";
import { Sparkles, FileText } from "lucide-react";

interface CounselLetterProps {
  letterText: string;
}

export default function CounselLetter({ letterText }: CounselLetterProps) {
  if (!letterText) return null;

  return (
    <div id="counsel-letter-panel" className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 tracking-tight font-sans">
          Senior Advisor Direct counsel
        </h3>
        <p className="text-xs text-zinc-500 font-sans mt-0.5">
          Actionable tactics and personal feedback to stand out in the 2026 hiring environment.
        </p>
      </div>

      <div className="relative bg-zinc-50 border border-zinc-200 rounded-2xl p-6 md:p-8 overflow-hidden max-w-4xl shadow-xs">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 -z-0 opacity-45"></div>
        <div className="absolute top-4 right-4 text-indigo-200">
          <FileText className="w-12 h-12" />
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
            <div className="p-1.5 bg-zinc-900 text-white rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
                Executive Counselor Brief
              </span>
              <div className="text-sm font-bold text-zinc-800">
                CareerMentor AI Corporate Scout
              </div>
            </div>
          </div>

          {/* Letter Body formatted nicely */}
          <div className="text-sm text-zinc-750 font-sans leading-relaxed whitespace-pre-wrap space-y-4">
            {letterText}
          </div>

          <div className="border-t border-zinc-200 pt-5 mt-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-xs text-zinc-400">ISSUED BY</div>
              <div className="font-bold text-sm text-zinc-900 tracking-tight">
                Senior Advisor Council
              </div>
              <div className="text-xs text-zinc-500">CareerMentor AI Global Analytics</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-zinc-400">REF DATE</div>
              <div className="font-semibold text-xs text-zinc-900">
                June 19, 2026
              </div>
              <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-100 mt-1">
                Verified Advisory Token
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
