import { CandidateProfile } from "./types";

export interface ExampleProfile {
  name: string;
  badge: string;
  description: string;
  icon: string;
  profile: CandidateProfile;
}

export const EXAMPLE_PROFILES: ExampleProfile[] = [
  {
    name: "Abhiram",
    badge: "CS Sophomore",
    description: "High-performing computer science student aiming for premium AI/ML internships.",
    icon: "GraduationCap",
    profile: {
      academicBackground: {
        degree: "Bachelor of Science",
        major: "Computer Science",
        graduationYear: "2028",
        gpa: "3.85"
      },
      technicalSkills: "Python, Java, Basic HTML/CSS, Git, SQL, PyTorch basics, Pandas",
      softSkills: "Critical thinking, Active collaboration, Team leadership, Strong documentation, Prompt communication",
      primaryDomains: "AI Engineering, Backend Cloud Systems, Distributed architecture",
      expectedCareerGoals: "Securing an elite ML/software engineering internship for next year and researching model optimizations."
    }
  },
  {
    name: "Elena",
    badge: "Bootcamp Graduate",
    description: "Self-taught developer and intensive bootcamp graduate looking for their first developer role.",
    icon: "Code",
    profile: {
      academicBackground: {
        degree: "Professional Certificate (Bootcamp)",
        major: "Full Stack Web Development",
        graduationYear: "2025",
        gpa: "N/A"
      },
      technicalSkills: "JavaScript, React (v18/19), Tailwind CSS, Node.js, Express, MongoDB, git/GitHub, REST APIs, Jest",
      softSkills: "Rapid adaptability, Empathetic user design-thinking, Active responsiveness, Constructive feedback acceptance",
      primaryDomains: "Interactive Frontend Applications, SaaS layout interfaces, consumer tooling",
      expectedCareerGoals: "Transitioning into a full-time, hands-on junior software engineering role at a scaling tech firm or product startup."
    }
  },
  {
    name: "Michael",
    badge: "Career Pivot",
    description: "Experienced finance analyst pivoting to technical Product Management & Big Data.",
    icon: "Briefcase",
    profile: {
      academicBackground: {
        degree: "Bachelor of Business Admin",
        major: "Finance & Quantitative Economics",
        graduationYear: "2021",
        gpa: "3.42"
      },
      technicalSkills: "Advanced Excel, SQL, Tableau, Google Analytics, Scrum Agile Framework, JIRA, basic Python",
      softSkills: "C-suite brief negotiations, Cross-functional alignment, High empathy, Stakeholder presentation, public speaking",
      primaryDomains: "FinTech, Data analytics productization, Business intelligence, growth management",
      expectedCareerGoals: "Securing a product owner or product manager title within a series-B fintech company or digital banking team."
    }
  },
  {
    name: "Sora",
    badge: "Embedded Specialist",
    description: "EE Master's graduate interested in hardware-level firmware and autonomic robotics.",
    icon: "Cpu",
    profile: {
      academicBackground: {
        degree: "Master of Science",
        major: "Electrical Engineering",
        graduationYear: "2026",
        gpa: "3.91"
      },
      technicalSkills: "C, C++, RTOS (FreeRTOS), microcontroller systems (STM32, ESP32), SPI/I2C/UART protocols, MATLAB, Oscilloscopes, Git",
      softSkills: "Structured scientific debugging, Analytical diligence, Technical writing, Tenacity under pressure",
      primaryDomains: "Smart connected hardware, automotive robotics, IoT systems, kernel firmware development",
      expectedCareerGoals: "Join an R&D deep tech firm as an firmware/embedded systems engineer pushing sensor fusion technologies."
    }
  }
];
