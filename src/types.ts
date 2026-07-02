export interface AcademicBackground {
  degree: string;
  major: string;
  graduationYear: string;
  gpa: string;
}

export interface CandidateProfile {
  academicBackground: AcademicBackground;
  technicalSkills: string;
  softSkills: string;
  primaryDomains: string;
  expectedCareerGoals: string;
}

export interface ScoreSet {
  technicalMatch: number;
  softSkillsBalance: number;
  industryReadiness: number;
  overallEmployability: number;
}

export interface ScoreReasoning {
  technicalMatch: string;
  softSkillsBalance: string;
  industryReadiness: string;
  overallEmployability: string;
}

export interface RecommendedPathway {
  title: string;
  matchPercentage: number;
  salaryRange: string;
  demandFactor: string;
  whyItFits: string;
  skillsHave: string[];
  skillsNeed: string[];
}

export interface RoadmapPhase {
  phaseName: string;
  duration: string;
  focus: string;
  technologies: string[];
  resources: string[];
  practiceTasks: string[];
}

export interface AssessmentReport {
  id: string;
  timestamp: string;
  profile: CandidateProfile;
  educationDigest: string;
  scores: ScoreSet;
  scoresReasoning: ScoreReasoning;
  recommendedPathways: RecommendedPathway[];
  learningRoadmap: RoadmapPhase[];
  counselLetter: string;
  markdownReport: string;
}

export interface AtsBulletRewrite {
  before: string;
  after: string;
  reasoning: string;
}

export interface AtsEvaluation {
  atsScore: number;
  breakdown: {
    keywords: number;
    formatting: number;
    analytics: number;
    depth: number;
  };
  detectedRole: string;
  identifiedKeywords: string[];
  missingKeywords: string[];
  redFlags: string[];
  actionableRewrites: AtsBulletRewrite[];
  parsingFeedback: string;
}

export interface MockQuestion {
  id: string;
  type?: string;
  question: string;
  difficulty: string;
  rubric?: string;
  options?: string[];
  correctOptionIndex?: number;
  justification?: string;
}

export interface AnswerEvaluation {
  score: number;
  strengthPoints: string[];
  gapPoints: string[];
  idealResponse: string;
  nextStepsAdvice: string;
}

