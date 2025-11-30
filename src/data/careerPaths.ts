// data/careerPaths.ts

import { courseData } from "@/data/courseData";

const lookup = (slug: string) =>
  courseData.find((c) => c.slug === slug);

export interface CareerPath {
  title: string;
  description: string;
  salaryGlobal: string;
  salaryAfrica: string;
  demand: string;
  skills: string[];
  courses: string[];
  courseLookup: (slug: string) => any;
}

const careerPaths: Record<string, CareerPath> = {
  // -----------------------------------------------------
  // 1. VVB AUDITOR
  // -----------------------------------------------------
  "vvb-auditor": {
    title: "VVB Auditor (Validation & Verification Auditor)",
    description:
      "Auditors evaluate and verify carbon project documentation, MRV systems, baselines, leakage, and monitoring plans to ensure compliance with global carbon standards.",
    salaryGlobal: "$55k – $140k",
    salaryAfrica: "$25k – $70k",
    demand: "Very High",
    skills: [
      "ISO 14064-3 verification",
      "Audit cycle management (CAR, CL, FAR)",
      "MRV systems evaluation",
      "Carbon standards interpretation",
      "Technical report writing",
      "Sampling and QA/QC techniques",
    ],
    courses: [
      "validation-verification-auditor",
      "carbon-standards-methodologies",
      "mrv-practitioner",
      "carbon-project-documentation",
      "carbon-site-audit",
      "article6-itmo",
      "methodology-analysis",
    ],
    courseLookup: lookup,
  },

  // -----------------------------------------------------
  // 2. CARBON PROJECT DEVELOPER
  // -----------------------------------------------------
  "carbon-project-developer": {
    title: "Carbon Project Developer",
    description:
      "Designs and implements carbon projects, conducts field assessments, develops PDDs, manages MRV systems, and oversees certification under Verra, Gold Standard, CDM, and ART.",
    salaryGlobal: "$45k – $120k",
    salaryAfrica: "$20k – $60k",
    demand: "Very High",
    skills: [
      "Carbon methodology application",
      "Baseline & additionality calculations",
      "GIS, drones & remote sensing",
      "PDD writing & documentation",
      "Stakeholder engagement",
      "Safeguards and ESIA design",
    ],
    courses: [
      "carbon-projects",
      "methodology-analysis",
      "gis-remote-sensing",
      "carbon-project-documentation",
      "mrv-practitioner",
      "carbon-finance",
      "carbon-safeguards-esia",
      "carbon-proposal-writing",
    ],
    courseLookup: lookup,
  },

  // -----------------------------------------------------
  // 3. GHG ACCOUNTANT
  // -----------------------------------------------------
  "ghg-accountant": {
    title: "GHG Accountant",
    description:
      "Handles Scope 1, 2 and 3 emissions reporting, reduction planning, carbon footprinting, and compliance with global sustainability reporting standards.",
    salaryGlobal: "$50k – $110k",
    salaryAfrica: "$18k – $55k",
    demand: "High",
    skills: [
      "GHG Protocol accounting",
      "ISO 14064-1 reporting",
      "Emission factor development",
      "Scope 3 mapping & calculation",
      "Corporate sustainability reporting",
    ],
    courses: [
      "ghg-accounting",
      "carbon-management",
      "scope3-accounting",
      "product-lca",
      "sbti-netzero",
      "sustainability-reporting",
    ],
    courseLookup: lookup,
  },

  // -----------------------------------------------------
  // 4. MRV SPECIALIST
  // -----------------------------------------------------
  "mrv-specialist": {
    title: "MRV Specialist",
    description:
      "Designs and maintains monitoring systems, processes field data, ensures QA/QC, and produces verification-ready data for audits.",
    salaryGlobal: "$45k – $100k",
    salaryAfrica: "$20k – $55k",
    demand: "Very High",
    skills: [
      "Monitoring plan design",
      "QA/QC protocols",
      "Digital MRV automation",
      "Remote sensing interpretation",
      "Emission calculations",
    ],
    courses: [
      "mrv-practitioner",
      "digital-mrv",
      "gis-remote-sensing",
      "carbon-project-documentation",
      "methodology-analysis",
    ],
    courseLookup: lookup,
  },
};

export default careerPaths;
