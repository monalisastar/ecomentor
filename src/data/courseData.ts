// src/data/courseData.ts

export interface Course {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  category: string;
  unlockWithAERA?: number;
}

const makeCourse = (
  title: string,
  slug: string,
  image: string,
  description: string,
  category: string,
  unlockWithAERA?: number
): Course => ({
  id: slug,
  title,
  slug,
  image,
  description,
  category,
  unlockWithAERA,
});

export const courseData: Course[] = [

  // ---------------------------
  // 🎓 SCHOOL 1 — FOUNDATIONAL
  // ---------------------------

  makeCourse(
    "Introduction to Climate Change & Emissions",
    "climate-intro",
    "/images/courses-pictures/climate-intro.webp",
    "Learn how climate change works, what drives global warming, and why greenhouse gas emissions matter.",
    "foundational",
    40
  ),

  makeCourse(
    "GHG Basics: CO₂, CH₄, N₂O & More",
    "ghg-basics",
    "/images/courses-pictures/ghg-basics.webp",
    "Understand the major greenhouse gases, their lifecycles, and their impact on global warming.",
    "foundational",
    50
  ),

  makeCourse(
    "What is Carbon? Frameworks & Types",
    "carbon-frameworks",
    "/images/courses-pictures/carbon-frameworks.webp",
    "Explore the building blocks of carbon science and understand the fundamentals of emission sources.",
    "foundational",
    45
  ),

  makeCourse(
    "Climate Science for Sustainability Professionals",
    "climate-science-professionals",
    "/images/courses-pictures/climate-science-professionals.webp",
    "Gain the scientific foundation needed to make informed sustainability and climate decisions.",
    "foundational",
    55
  ),

  makeCourse(
    "Introduction to Carbon Markets & Climate Policy",
    "intro-carbon-markets",
    "/images/courses-pictures/course-markets.webp",
    "Understand compliance and voluntary carbon markets, credits, trading, and governance frameworks.",
    "foundational",
    60
  ),

  makeCourse(
    "Environmental Footprints: Carbon, Water & Ecological",
    "environmental-footprints",
    "/images/courses-pictures/environmental-footprints.webp",
    "Learn how carbon, water, and ecological footprints shape sustainability decisions.",
    "foundational",
    45
  ),

  makeCourse(
    "Climate Adaptation & Resilience Fundamentals",
    "climate-adaptation",
    "/images/courses-pictures/climate-adaptation.webp",
    "Understand how societies adapt to climate impacts and build long-term climate resilience.",
    "foundational",
    55
  ),

  makeCourse(
    "Sustainable Development Goals (SDGs) for Climate Action",
    "sdg-climate-action",
    "/images/courses-pictures/sdg-climate-action.webp",
    "Learn how SDGs integrate with climate, carbon, and sustainability strategies.",
    "foundational",
    40
  ),

  makeCourse(
    "Net-Zero, Paris Agreement & Article 6 Basics",
    "netzero-paris-basics",
    "/images/courses-pictures/netzero-paris-basics.webp",
    "Learn the global climate framework behind net-zero commitments and international carbon trading.",
    "foundational",
    60
  ),

  // ----------------------------------------------
  // 🎓 SCHOOL 2 — GHG ACCOUNTING & DIPLOMAS
  // ----------------------------------------------

  makeCourse(
    "Diploma in GHG Accounting",
    "ghg-accounting",
    "/images/courses-pictures/ghg-accounting.webp",
    "Master emission inventories, scopes, boundaries, and GHG Protocol reporting.",
    "ghg-diplomas",
    100
  ),

  makeCourse(
    "Diploma in Carbon Management",
    "carbon-management",
    "/images/courses-pictures/carbon-management.webp",
    "Learn corporate decarbonization strategies across operations and supply chains.",
    "ghg-diplomas",
    100
  ),

  makeCourse(
    "GHG Measurement, Reporting & Verification (MRV)",
    "ghg-mrv",
    "/images/courses-pictures/ghg-mrv.webp",
    "Measure, report, and verify GHG emissions in alignment with ISO and GHG Protocol.",
    "ghg-diplomas",
    120
  ),

  makeCourse(
    "Corporate Carbon Footprinting (ISO 14064-1)",
    "corporate-carbon-footprinting",
    "/images/courses-pictures/corporate-carbon-footprinting.webp",
    "Develop accurate corporate GHG inventories using global standards.",
    "ghg-diplomas",
    85
  ),

  makeCourse(
    "Scope 3 Value-Chain Emissions Accounting",
    "scope3-accounting",
    "/images/courses-pictures/course-carbon.webp",
    "Quantify upstream and downstream emissions across the entire value chain.",
    "ghg-diplomas",
    90
  ),

  makeCourse(
    "Product Life Cycle Assessment (LCA)",
    "product-lca",
    "/images/courses-pictures/course-carbon-dev.webp",
    "Learn cradle-to-grave LCA to calculate the carbon footprint of products.",
    "ghg-diplomas",
    90
  ),

  makeCourse(
    "SBTi Net-Zero Target Setting",
    "sbti-netzero",
    "/images/courses-pictures/sbti-netzero.webp",
    "Understand pathways and methods for setting science-based emissions targets.",
    "ghg-diplomas",
    100
  ),

  makeCourse(
    "GHG Inventory Development & Reporting",
    "ghg-inventory",
    "/images/courses-pictures/ghg-accounting.webp",
    "Prepare complete emissions inventories ready for audit and disclosure.",
    "ghg-diplomas",
    80
  ),

  makeCourse(
    "Corporate Sustainability Reporting (CSRD, GRI, ISSB)",
    "sustainability-reporting",
    "/images/courses-pictures/reporting-regulations.webp",
    "Master key standards for sustainability and climate disclosure.",
    "ghg-diplomas",
    85
  ),

  makeCourse(
    "GHG Verification & Assurance (ISO 14064-3)",
    "ghg-verification",
    "/images/courses-pictures/verification.webp",
    "Learn the assurance process for validating and verifying emissions reports.",
    "ghg-diplomas",
    95
  ),

  // ----------------------------------------------
  // 🎓 SCHOOL 3 — CARBON PROJECTS & TECH
  // ----------------------------------------------

  makeCourse(
    "Carbon Project Development Masterclass",
    "carbon-projects",
    "/images/courses-pictures/carbon-projects.webp",
    "Learn the full lifecycle of carbon project development from concept to issuance.",
    "carbon-projects",
    110
  ),

  makeCourse(
    "Carbon Standards & Methodologies Certification",
    "carbon-standards-methodologies",
    "/images/courses-pictures/carbon-standard-methodologies.webp",
    "Master Verra VCS, Gold Standard, CDM, Plan Vivo, and ART-TREES project requirements.",
    "carbon-projects",
    120
  ),

  makeCourse(
    "Methodology Analysis & Application",
    "methodology-analysis",
    "/images/courses-pictures/methodology-analysis-application.webp",
    "Deep dive into baseline calculations, emission factors, sampling frameworks, and parameter justification.",
    "carbon-projects",
    95
  ),

  makeCourse(
    "Validation & Verification (VVB) Auditor Training",
    "validation-verification-auditor",
    "/images/courses-pictures/vvb.webp",
    "Learn the full audit cycle including CARs, CLs, and FARs.",
    "carbon-projects",
    130
  ),

  makeCourse(
    "Carbon Site Audit & Field Assessment Techniques",
    "carbon-site-audit",
    "/images/courses-pictures/carbon-site-audit-field-assessment.webp",
    "Master surveys, sampling, GPS tools, and field evidence collection.",
    "carbon-projects",
    90
  ),

  makeCourse(
    "MRV Practitioner Course (Digital & Traditional)",
    "mrv-practitioner",
    "/images/courses-pictures/mrv.webp",
    "Design, implement, and manage MRV systems using traditional and digital tools.",
    "carbon-projects",
    100
  ),

  makeCourse(
    "Carbon Finance & Project Economics",
    "carbon-finance",
    "/images/courses-pictures/carbon-finance-project-economics.webp",
    "Understand pricing, ERPAs, ROI, investor requirements, and risk allocation.",
    "carbon-projects",
    120
  ),

  makeCourse(
    "GIS, Remote Sensing & Digital Tools for Carbon Projects",
    "gis-remote-sensing",
    "/images/courses-pictures/gis-remote-sensing-digital-tools.webp",
    "Use GIS, drones, IoT sensors, and remote sensing tools.",
    "carbon-projects",
    115
  ),

  makeCourse(
    "Safeguards, ESIA & Social Impact Assessment",
    "carbon-safeguards-esia",
    "/images/courses-pictures/safeguards-esia-social-impact-assessment.webp",
    "Understand safeguards, HRDD, gender analysis, and grievance mechanisms.",
    "carbon-projects",
    100
  ),

  makeCourse(
    "Carbon Project Documentation & Reporting",
    "carbon-project-documentation",
    "/images/courses-pictures/carbon-project-documentation-reporting.webp",
    "Write PDDs, MRs, audit responses, and evidence logs.",
    "carbon-projects",
    85
  ),

  makeCourse(
    "Improved Cookstoves (ICS) Carbon Projects",
    "ics-carbon-projects",
    "/images/courses-pictures/ics-carbon-projects.webp",
    "Methodology requirements and monitoring for cookstoves.",
    "carbon-projects",
    60
  ),

  makeCourse(
    "LPG Carbon Projects",
    "lpg-carbon-projects",
    "/images/courses-pictures/lpg-carbon-projects.webp",
    "Develop LPG clean cooking carbon projects.",
    "carbon-projects",
    60
  ),

  makeCourse(
    "Water Purifiers (WASH) Carbon Methodologies",
    "wash-carbon-projects",
    "/images/courses-pictures/wash-carbon-methodologies.webp",
    "Master water purification methodologies for carbon credits.",
    "carbon-projects",
    60
  ),

  makeCourse(
    "Biogas Carbon Projects Methodologies",
    "biogas-carbon-projects",
    "/images/courses-pictures/biogas-carbon-projects.webp",
    "Develop biogas carbon projects for cooking and energy.",
    "carbon-projects",
    65
  ),

  makeCourse(
    "Waste-to-Energy & Circular Economy Carbon Projects",
    "waste-to-energy-carbon",
    "/images/courses-pictures/waste-to-energy-carbon.webp",
    "Understand landfill gas, recycling, methane capture.",
    "carbon-projects",
    70
  ),

  makeCourse(
    "Nature-Based Solutions: Forestry, Mangroves & REDD+",
    "nature-based-solutions",
    "/images/courses-pictures/nature-based-solutions.webp",
    "Learn ARR, IFM, REDD+ baselines, leakage & permanence.",
    "carbon-projects",
    90
  ),

  makeCourse(
    "Carbon Removal Technologies (Biochar, DAC, BECCS)",
    "carbon-removal-technologies",
    "/images/courses-pictures/carbon-removal-technologies.webp",
    "Explore engineered and nature-based carbon removal solutions including biochar, direct air capture, and BECCS systems.",
    "carbon-projects",
    95
  ),

  makeCourse(
    "Gender & Social Inclusion in Climate Action",
    "gender-climate-action",
    "/images/courses-pictures/gender-climate-action..webp",
    "Understand gender indicators & inclusion frameworks.",
    "carbon-projects",
    50
  ),

  makeCourse(
    "Article 6 & ITMO Transactions",
    "article6-itmo",
    "/images/courses-pictures/article-6-itmo-transactions.webp",
    "Learn ITMOs, adjustments & bilateral trading.",
    "carbon-projects",
    95
  ),

  makeCourse(
    "Proposal Writing & Carbon Funding Communications",
    "carbon-proposal-writing",
    "/images/courses-pictures/proposal-writing-carbon-funding-communications.webp",
    "Write investor-ready carbon proposals.",
    "carbon-projects",
    50
  ),

  // ----------------------------------------------
  // 🎓 SCHOOL 4 — SECTORAL SCOPES
  // ----------------------------------------------

  makeCourse(
    "Energy Industries (Fuel Combustion, Electricity & Heat)",
    "scope-energy",
    "/images/courses-pictures/scope-energy.webp",
    "Understand emissions from electricity generation & heat production.",
    "sectoral",
    70
  ),

  makeCourse(
    "Energy Transmission & Distribution",
    "scope-distribution",
    "/images/courses-pictures/scope-distribution.webp",
    "Analyze grid efficiency & transmission losses.",
    "sectoral",
    60
  ),

  makeCourse(
    "Energy Demand & Efficiency",
    "scope-demand",
    "/images/courses-pictures/scope-demand.webp",
    "Learn energy efficiency strategies for buildings & industry.",
    "sectoral",
    60
  ),

  makeCourse(
    "Industrial Processes & Product Use (IPPU)",
    "scope-industry",
    "/images/courses-pictures/scope-industry.webp",
    "Study cement, steel, chemicals & manufacturing emissions.",
    "sectoral",
    65
  ),

  makeCourse(
    "Agriculture, Forestry & Land Use (AFOLU)",
    "scope-afolu",
    "/images/courses-pictures/scope-afolu.webp",
    "Assess AFOLU emissions & mitigation strategies.",
    "sectoral",
    55
  ),

  makeCourse(
    "Transport & Mobile Sources",
    "scope-transport",
    "/images/courses-pictures/scope-transport.webp",
    "Understand transport-related emissions & mitigation.",
    "sectoral",
    55
  ),

  makeCourse(
    "Waste Handling, Water & Sanitation Systems",
    "scope-waste",
    "/images/courses-pictures/scope-waste.webp",
    "Emissions from landfills, composting, wastewater.",
    "sectoral",
    50
  ),

  makeCourse(
    "Construction, Buildings & Urban Systems",
    "scope-construction",
    "/images/courses-pictures/scope-construction.webp",
    "Explore embodied carbon in buildings & infrastructure.",
    "sectoral",
    60
  ),

  makeCourse(
    "Chemical & Metal Industries",
    "scope-chemicals-metals",
    "/images/courses-pictures/scope-chemicals-metals.webp",
    "Industrial emissions from chemical & metal sectors.",
    "sectoral",
    60
  ),

  makeCourse(
    "Water, Sanitation & Hygiene (WASH) Emissions",
    "sector-wash",
    "/images/courses-pictures/scope-wash.webp",
    "Specialized WASH sector GHG sources & monitoring.",
    "sectoral",
    50
  ),

  // ----------------------------------------------
  // 🎓 SCHOOL 5 — CLIMATE POLICY & GOVERNANCE
  // ----------------------------------------------

  makeCourse(
    "Climate Policy, Law & Global Governance",
    "climate-policy-law",
    "/images/courses-pictures/climate-policy-law.webp",
    "Climate law, governance & multilateral agreements.",
    "policy",
    80
  ),

  makeCourse(
    "International Climate Negotiations (UNFCCC, COP)",
    "international-negotiations",
    "/images/courses-pictures/international-negotiations.webp",
    "Global negotiation structures & diplomacy.",
    "policy",
    90
  ),

  makeCourse(
    "Carbon Markets: Compliance vs Voluntary Systems",
    "carbon-markets-compliance",
    "/images/courses-pictures/carbon-markets-compliance.webp",
    "Compare compliance & voluntary carbon markets.",
    "policy",
    85
  ),

  makeCourse(
    "Carbon Pricing, Taxation & Market Instruments",
    "carbon-pricing",
    "/images/courses-pictures/carbon-pricing.webp",
    "Understand taxation, ETS, levies & pricing tools.",
    "policy",
    90
  ),

  makeCourse(
    "Climate Risk Assessment & Adaptation Planning",
    "climate-risk-assessment",
    "/images/courses-pictures/climate-risk-assessment.webp",
    "Assess climate risks & develop adaptation strategies.",
    "policy",
    85
  ),

  makeCourse(
    "Climate Finance & Investment Models",
    "climate-finance",
    "/images/courses-pictures/climate-finance.webp",
    "Learn climate finance, blended finance & funding tools.",
    "policy",
    95
  ),

  makeCourse(
    "NDCs, LT-LEDS & National Climate Frameworks",
    "ndc-frameworks",
    "/images/courses-pictures/ndc-frameworks.webp",
    "National planning, NDC development & long-term strategies.",
    "policy",
    75
  ),

  makeCourse(
    "Loss & Damage, Article 6 & Corresponding Adjustments",
    "loss-damage-article6",
    "/images/courses-pictures/loss-damage-article6.webp",
    "Understand loss & damage funding mechanisms.",
    "policy",
    100
  ),

  makeCourse(
    "Sustainability Reporting Regulations (GRI, ISSB, CSRD)",
    "reporting-regulations",
    "/images/courses-pictures/reporting-regulations.webp",
    "Major disclosure standards & audit requirements.",
    "policy",
    85
  ),

  makeCourse(
    "Climate Diplomacy & Policy Implementation",
    "climate-diplomacy",
    "/images/courses-pictures/climate-diplomacy.webp",
    "Climate diplomacy, implementation & stakeholder engagement.",
    "policy",
    95
  ),

  // ----------------------------------------------
  // 🎓 SCHOOL 6 — DATA, TECHNOLOGY & INNOVATION
  // ----------------------------------------------

  makeCourse(
    "AI for Climate Intelligence (ML, Forecasting, NLP)",
    "ai-climate-intelligence",
    "/images/courses-pictures/ai-climate-intelligence.webp",
    "Apply AI to climate prediction & MRV.",
    "technology",
    90
  ),

  makeCourse(
    "Geo-Spatial Analysis for Carbon & Climate Projects",
    "geospatial-analysis",
    "/images/courses-pictures/geospatial-analysis.webp",
    "Use GIS, satellite & mapping data.",
    "technology",
    90
  ),

  makeCourse(
    "Digital MRV & Blockchain for Climate Systems",
    "digital-mrv",
    "/images/courses-pictures/digital-mrv.webp",
    "Automate MRV with digital tools & blockchain.",
    "technology",
    90
  ),

  makeCourse(
    "IoT Sensors & Data Automation for MRV",
    "iot-mrv",
    "/images/courses-pictures/iot-mrv.webp",
    "Integrate IoT sensors for real-time reporting.",
    "technology",
    80
  ),

  makeCourse(
    "Smart Contracts for Carbon Credits (Web3 Developer)",
    "smart-contracts-carbon",
    "/images/courses-pictures/smart-contracts-carbon.webp",
    "Build blockchain carbon credit systems.",
    "technology",
    95
  ),

  makeCourse(
    "Climate Simulation & Modelling Tools",
    "climate-modelling",
    "/images/courses-pictures/climate-modelling.webp",
    "Run climate models & projections.",
    "technology",
    85
  ),

  makeCourse(
    "Climate Tech Product Development & Innovation",
    "climate-tech-product",
    "/images/courses-pictures/climate-tech-product.webp",
    "Design & scale climate tech products.",
    "technology",
    100
  ),

  makeCourse(
    "Big Data Pipelines for Environmental Analytics",
    "climate-big-data",
    "/images/courses-pictures/climate-big-data.webp",
    "ETL pipelines & large-scale analytics.",
    "technology",
    95
  ),

  // ----------------------------------------------
  // 🎓 SCHOOL 7 — PROFESSIONAL DEVELOPMENT
  // ----------------------------------------------

  makeCourse(
    "Carbon Literacy Certificate",
    "carbon-literacy",
    "/images/courses-pictures/carbon-literacy.webp",
    "Essential climate knowledge for all professionals.",
    "professional",
    45
  ),

  makeCourse(
    "Sustainability Leadership & Change Management",
    "sustainability-leadership",
    "/images/courses-pictures/sustainability-leadership.webp",
    "Develop climate leadership & change management.",
    "professional",
    65
  ),

  makeCourse(
    "Climate Consulting & Proposal Development",
    "climate-consulting",
    "/images/courses-pictures/climate-consulting.webp",
    "Master consulting, client handling & proposal writing.",
    "professional",
    80
  ),

];
