import React from "react";
import { RoadmapPhase } from "../types";
import { BookOpen, Calendar, Rocket, Sparkles, Terminal } from "lucide-react";

interface RoadmapTimelineProps {
  phases: RoadmapPhase[];
}

export default function RoadmapTimeline({ phases }: RoadmapTimelineProps) {
  if (!phases || phases.length === 0) return null;

  return (
    <div id="learning-roadmap-panel" className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 tracking-tight font-sans">
          Dynamic Learning Roadmap Blueprint
        </h3>
        <p className="text-xs text-zinc-500 font-sans mt-0.5">
          Strategic 6-Month timeline formulated for specialized modern technical and industry readiness.
        </p>
      </div>

      <div className="relative border-l border-zinc-200 ml-3.5 md:ml-6 space-y-8 pb-4">
        {phases.map((phase, idx) => (
          <div key={idx} className="relative pl-7 md:pl-10">
            {/* Timeline node circle */}
            <div className="absolute -left-[14px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xs">
              <span className="text-xs font-bold leading-none">{idx + 1}</span>
            </div>

            {/* Content card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 md:p-6 shadow-xs relative hover:border-zinc-300 transition-all duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-zinc-150 pb-3 mb-4.5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{phase.duration || "Months x-y"}</span>
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 mt-0.5 font-sans tracking-tight">
                    {phase.phaseName}
                  </h4>
                </div>
                <span className="self-start md:self-center px-3 py-1 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-lg font-mono">
                  Focus: {phase.focus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Modern Tech stacks */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    Focus Stack (2026)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.technologies?.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 bg-zinc-50 text-zinc-800 text-xs font-medium rounded-md border border-zinc-200/50"
                      >
                        {tech}
                      </span>
                    ))}
                    {(!phase.technologies || phase.technologies.length === 0) && (
                      <span className="text-xs text-zinc-400 italic">No direct stack listed.</span>
                    )}
                  </div>
                </div>

                {/* Recommended resources */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    Premium Resources
                  </div>
                  <ul className="space-y-1.5">
                    {phase.resources?.map((resource, rIdx) => (
                      <li key={rIdx} className="text-xs text-zinc-650 font-sans flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold select-none mt-0.5">→</span>
                        <span className="select-all">{resource}</span>
                      </li>
                    ))}
                    {(!phase.resources || phase.resources.length === 0) && (
                      <li className="text-xs text-zinc-400 italic">No resources specific in source.</li>
                    )}
                  </ul>
                </div>

                {/* Practice Tasks */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-widest font-mono">
                    <Rocket className="w-4 h-4 text-indigo-500" />
                    Concrete Tasks
                  </div>
                  <ul className="space-y-1.5">
                    {phase.practiceTasks?.map((task, pIdx) => (
                      <li key={pIdx} className="text-xs text-zinc-650 font-sans flex items-start gap-1.5 bg-indigo-50/20 p-2 rounded-lg border border-indigo-100/30">
                        <span className="text-indigo-500 font-bold select-none">✓</span>
                        <span>{task}</span>
                      </li>
                    ))}
                    {(!phase.practiceTasks || phase.practiceTasks.length === 0) && (
                      <li className="text-xs text-zinc-400 italic">No custom practice goals listed.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
