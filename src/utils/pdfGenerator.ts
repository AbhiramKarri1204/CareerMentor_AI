import { jsPDF } from "jspdf";
import { AssessmentReport } from "../types";

/**
 * Generates a beautiful, multi-page, professional PDF report of the career assessment data.
 * Adheres to deep negative space guidelines, utilizes rigorous line height checks to ensure
 * text never cut-offs, and adds real-time "Page X of Y" and header rule decorations.
 */
export function generateAssessmentPDF(report: AssessmentReport) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = 297;
  const margin = 20;
  const contentWidth = 170; // 210 - 2 * 20
  let currentY = 40;

  // Global paragraph printing helper with dynamic multi-page flow checks
  function printParagraph(
    text: string,
    fontSize: number = 10,
    isBold: boolean = false,
    color: [number, number, number] = [63, 63, 70],
    spacing: number = 4.8,
    indent: number = 20,
    maxWidth: number = 170
  ) {
    doc.setFont("Helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const wrappedLines: string[] = doc.splitTextToSize(text, maxWidth);
    for (const line of wrappedLines) {
      if (currentY + spacing > 270) {
        doc.addPage();
        currentY = 25; // Header buffer on inner pages
      }
      doc.text(line, indent, currentY);
      currentY += spacing;
    }
  }

  // Double check position for bulk card sections to prevent cards cutting in half
  function ensureSpace(neededHeight: number) {
    if (currentY + neededHeight > 270) {
      doc.addPage();
      currentY = 25;
    }
  }

  // ==========================================
  // PAGE 1: TITLE & COVER PAGE
  // ==========================================
  
  // Icon / Decorative Header Slate
  doc.setFillColor(31, 41, 55); // zinc-800
  doc.rect(20, currentY, 14, 14, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("CM", 27, currentY + 9, { align: "center" });

  currentY += 26;

  // Main Report Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(17, 24, 39); // zinc-900
  doc.text("CAREERMENTOR AI", 20, currentY);

  currentY += 4;

  // Visual Gradient Accent Line
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(20, currentY, 170, 1.5, "F");

  currentY += 10;

  // Elegant Subtitle
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text("INDIVIDUAL DIAGNOSTIC ASSESSMENT & ROADMAP", 20, currentY);

  currentY += 12;

  // Description / Blurb
  printParagraph(
    "Synthesized in alignment with 2026 academic standards and competitive intelligence hiring guidelines. This document aggregates candidate educational credentials, evaluates active readiness indices, suggests targeted industry pathways, and delivers a robust six-month roadmap with custom advice.",
    9,
    false,
    [100, 116, 139], // slate-500
    4.5
  );

  currentY += 12;

  // Intake Param Board Box
  ensureSpace(85);
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(20, currentY, 170, 80, 4, 4, "FD");

  // Box Panel Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(20, currentY, 170, 11, 4, 4, "F");
  // Fill square bottom corners to join body cleanly
  doc.rect(20, currentY + 7, 170, 4, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("CANDIDATE PROFILE INTELLIGENCE INDEX", 25, currentY + 7.5);

  let profileY = currentY + 18;
  const profileDetails = [
    { label: "Degree Selected:", val: report.profile.academicBackground.degree },
    { label: "Major Concentration:", val: report.profile.academicBackground.major },
    { label: "Graduation Expected:", val: report.profile.academicBackground.graduationYear },
    { label: "Performance GPA:", val: report.profile.academicBackground.gpa || "N/A" },
    { label: "Domains of Interest:", val: report.profile.primaryDomains || "N/A" },
    { label: "Desired Career Goals:", val: report.profile.expectedCareerGoals || "N/A" },
  ];

  profileDetails.forEach((item) => {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(item.label, 26, profileY);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(15, 23, 42); // slate-900
    const lines = doc.splitTextToSize(item.val, 110);
    lines.forEach((l, idx) => {
      doc.text(l, 70, profileY + (idx * 4.2));
    });

    profileY += Math.max(lines.length * 4.2 + 2, 7.5);
  });

  currentY += 92;

  // Cover Footer
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Report Compiled Server-Side. Authenticated Carrier Diagnostic Stack 2026.", 105, 260, { align: "center" });


  // ==========================================
  // PAGE 2: DIAGNOSTIC SCORES & PERFORMANCE BRIEF
  // ==========================================
  doc.addPage();
  currentY = 25;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text("EXECUTIVE DIGEST & SCORES INDEX", 20, currentY);
  currentY += 7;

  printParagraph(
    "Underwriting academic performance with corporate demand filters. Scores are calibrated on a standard 100-point index compared to global benchmark entries of continuous learning portfolios.",
    9.5,
    false,
    [100, 110, 120],
    4.5
  );
  currentY += 8;

  const scoreItems = [
    { label: "TECHNICAL SKILLS MATCH", val: report.scores.technicalMatch, color: [79, 70, 229], text: report.scoresReasoning.technicalMatch },
    { label: "SOFT SKILLS ALIGNMENT", val: report.scores.softSkillsBalance, color: [16, 185, 129], text: report.scoresReasoning.softSkillsBalance },
    { label: "INDUSTRY READY COMPLIANCE", val: report.scores.industryReadiness, color: [245, 158, 11], text: report.scoresReasoning.industryReadiness },
    { label: "OVERALL EMPLOYABILITY RATE", val: report.scores.overallEmployability, color: [239, 68, 68], text: report.scoresReasoning.overallEmployability }
  ];

  scoreItems.forEach((score) => {
    ensureSpace(36);

    // Left colored accent box
    doc.setFillColor(score.color[0], score.color[1], score.color[2]);
    doc.rect(20, currentY, 4, 25, "F");

    // Standard card background
    doc.setFillColor(248, 250, 252);
    doc.rect(24, currentY, 166, 25, "F");

    // Score Label
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(score.label, 29, currentY + 6);

    // Right score badge box
    doc.setFillColor(score.color[0], score.color[1], score.color[2]);
    doc.roundedRect(165, currentY + 3, 20, 19, 1.5, 1.5, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`${score.val}`, 175, currentY + 11, { align: "center" });
    doc.setFontSize(6.5);
    doc.text("/ 100", 175, currentY + 16.5, { align: "center" });

    // Reasoning paragraph wrap inside score cards
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const reasonedLines = doc.splitTextToSize(score.text, 130);
    reasonedLines.forEach((ln, idx) => {
      doc.text(ln, 29, currentY + 12.5 + (idx * 4));
    });

    currentY += 28.5;
  });

  // Brief Ingestion summary letter block
  ensureSpace(45);
  currentY += 3;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("Academic Diagnostics & Insight Brief", 20, currentY);
  currentY += 6;

  printParagraph(report.educationDigest, 9, false, [30, 41, 59], 4.6);


  // ==========================================
  // PAGE 3: RECOMMENDED PROFESSIONS MAP
  // ==========================================
  doc.addPage();
  currentY = 25;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text("RECOMMENDED PROFESSIONAL TARGETS", 20, currentY);
  currentY += 7;

  printParagraph(
    "These recommended pathways indicate fields where the candidate's core curricula and competencies deliver the highest active technical compatibility. Focus areas list gaps that must be prioritized.",
    9.5,
    false,
    [100, 110, 120],
    4.5
  );
  currentY += 8;

  report.recommendedPathways.forEach((pathway, idx) => {
    ensureSpace(63);

    // Card frame
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.setLineWidth(0.4);
    doc.roundedRect(20, currentY, 170, 52, 3, 3, "FD");

    // Header bar
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, currentY, 170, 10, 3, 3, "F");
    doc.rect(20, currentY + 6, 170, 4, "F");

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. ${pathway.title}`, 25, currentY + 6.5);

    // Match rate badge
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(155, currentY + 2.5, 30, 5, 1, 1, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Match: ${pathway.matchPercentage}%`, 170, currentY + 6, { align: "center" });

    // Details Row
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Avg Salary: ${pathway.salaryRange}`, 25, currentY + 16);
    doc.text(`Market Demand: ${pathway.demandFactor}`, 100, currentY + 16);

    // Alignment rationale
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Strategy Insight:", 25, currentY + 22);

    const fitLines = doc.splitTextToSize(pathway.whyItFits, 160);
    fitLines.forEach((ln, ridx) => {
      doc.text(ln, 25, currentY + 26 + (ridx * 3.8));
    });

    const bulletY = currentY + 36 + (fitLines.length > 1 ? (fitLines.length - 1) * 3.8 : 0);

    // Skills Have Column
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129); // emerald
    doc.text("Competency Highlights:", 25, bulletY);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const haveText = pathway.skillsHave ? pathway.skillsHave.join(", ") : "Listed In Ingestion";
    const haveLines = doc.splitTextToSize(haveText, 72);
    haveLines.forEach((hl, hidx) => {
      doc.text(hl, 25, bulletY + 4 + (hidx * 3.5));
    });

    // Skills Need Column
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(245, 158, 11); // amber
    doc.text("Focus Priorities & Gaps:", 105, bulletY);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const needText = pathway.skillsNeed ? pathway.skillsNeed.join(", ") : "Fully aligned";
    const needLines = doc.splitTextToSize(needText, 72);
    needLines.forEach((nl, nidx) => {
      doc.text(nl, 105, bulletY + 4 + (nidx * 3.5));
    });

    currentY += 56;
  });


  // ==========================================
  // PAGE 4: 6-MONTH ACTIONABLE ROADMAP
  // ==========================================
  doc.addPage();
  currentY = 25;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text("ACTIONABLE SIX-MONTH DEVELOPMENT TRACK", 20, currentY);
  currentY += 7;

  printParagraph(
    "A structured step-by-step track that is tailored specifically to bridge gaps between academic outputs and market performance targets.",
    9.5,
    false,
    [100, 110, 120],
    4.5
  );
  currentY += 5;

  report.learningRoadmap.forEach((phase, idx) => {
    ensureSpace(45);

    // Horizontal line connector
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1.2);
    if (idx < report.learningRoadmap.length - 1) {
      doc.line(25, currentY + 11, 25, currentY + 46);
    }

    // Dynamic bullet circle
    doc.setFillColor(79, 70, 229);
    doc.circle(25, currentY + 6, 3.5, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`${idx + 1}`, 25, currentY + 8.5, { align: "center" });

    // Phase Title Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${phase.phaseName}  (Duration: ${phase.duration})`, 32, currentY + 8);

    let detailY = currentY + 14;

    // Focus Area
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Main Objective:", 32, detailY);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const fcLines = doc.splitTextToSize(phase.focus, 138);
    fcLines.forEach((fl, flidx) => {
      doc.text(fl, 60, detailY + (flidx * 4));
    });
    
    detailY += (fcLines.length * 4) + 1.5;

    // Tech stack
    if (phase.technologies && phase.technologies.length > 0) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Tools/Tech Matrix:", 32, detailY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(phase.technologies.join("  •  "), 60, detailY);
      detailY += 4.5;
    }

    // Training assets / resources
    if (phase.resources && phase.resources.length > 0) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Primary Resources:", 32, detailY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229); // indigo
      doc.text(phase.resources.join(", "), 60, detailY);
      detailY += 4.5;
    }

    // Practice tasks milestones
    if (phase.practiceTasks && phase.practiceTasks.length > 0) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Assigned Milestones:", 32, detailY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const textTasks = phase.practiceTasks.join("  |  ");
      const wrappedTasks = doc.splitTextToSize(textTasks, 110);
      wrappedTasks.forEach((tk, tkidx) => {
        doc.text(tk, 60, detailY + (tkidx * 3.6));
      });

      detailY += (wrappedTasks.length * 3.6) + 2;
    }

    currentY = detailY + 3.5;
  });


  // ==========================================
  // PAGE 5: ADVISOR COUNSEL MEMO
  // ==========================================
  doc.addPage();
  currentY = 25;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text("SENIOR ADVISOL BRIEFING MEMORANDUM", 20, currentY);
  currentY += 7;

  printParagraph(
    "The senior academic counselor has structured the following contextual guidelines for building leadership tracks and establishing research goals.",
    9.5,
    false,
    [100, 110, 120],
    4.5
  );
  currentY += 8;

  // Split and print counsel letter paragraph blocks
  const counselParagraphs = report.counselLetter.split("\n").filter((p) => p.trim().length > 0);
  counselParagraphs.forEach((p) => {
    ensureSpace(20);
    printParagraph(p, 9, false, [30, 41, 59], 4.8);
    currentY += 3.5;
  });


  // ==========================================
  // FINAL PASS: HEADER, FOOTER, DECORATIONS
  // ==========================================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    if (i === 1) {
      // Cover Page surrounding elegant line box
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.4);
      doc.line(15, 15, 195, 15); // Top
      doc.line(15, 15, 15, 282);  // Left
      doc.line(195, 15, 195, 282); // Right
      doc.line(15, 282, 195, 282); // Bottom

      // Minimal footer stamp
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text("CONFIDENTIAL CAREER PREPARATION ANALYSIS // VERIFIED SCOUT ENGINE 2026", 105, 274, { align: "center" });
    } else {
      // Inner Pages Headers
      doc.setDrawColor(228, 228, 231); // zinc-200
      doc.setLineWidth(0.25);
      doc.line(20, 15, 190, 15);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text("CAREERMENTOR AI   //   DIAGNOSTIC PORTFOLIO SUMMARY", 20, 11.5);
      doc.text(`STAMP: ${report.id.toUpperCase()}`, 190, 11.5, { align: "right" });

      // Inner Pages Footers
      doc.line(20, 282, 190, 282);
      doc.setFontSize(7.5);
      doc.text(`Confidential academic analysis compiled: ${report.timestamp}`, 20, 287);
      doc.text(`Page ${i} of ${pageCount}`, 190, 287, { align: "right" });
    }
  }

  // Trigger download with sanitized string key filename
  const sanitizedMajor = report.profile.academicBackground.major
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  doc.save(`CareerMentor_Assessment_${sanitizedMajor}.pdf`);
}
