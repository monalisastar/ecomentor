// src/data/courseData.ts

export interface Course {
  title: string
  slug: string
  image: string
  description: string
  unlockWithAERA?: number // ✅ optional AERA price
}

export const courseData: Course[] = [
  // 1–4: Foundational
  {
    title: 'Introduction to Climate Change & Emissions',
    slug: 'climate-intro',
    image: '/climate-intro.jpg',
    description: 'Learn how climate change works and why emissions matter.',
    unlockWithAERA: 40,
  },
  {
    title: 'What is Carbon? Frameworks & Types',
    slug: 'carbon-frameworks',
    image: '/carbon-frameworks.jpg',
    description: 'Explore the building blocks of carbon science.',
    unlockWithAERA: 45,
  },
  {
    title: 'GHG Basics: CO₂, CH₄, N₂O & More',
    slug: 'ghg-basics',
    image: '/ghg-basics.jpg',
    description: 'Understand the major greenhouse gases and their impact.',
    unlockWithAERA: 50,
  },
  {
    title: 'Carbon Developer Essentials',
    slug: 'carbon-developer',
    image: '/carbon-developer.jpg',
    description: 'Build carbon-focused applications and smart contracts.',
    unlockWithAERA: 70,
  },

  // 5–7: Professional Diplomas
  {
    title: 'Diploma in GHG Accounting',
    slug: 'ghg-accounting',
    image: '/ghg-accounting.jpg',
    description: 'Master inventory, scopes and carbon footprinting.',
    unlockWithAERA: 100,
  },
  {
    title: 'Diploma in Carbon Management',
    slug: 'carbon-management',
    image: '/carbon-management.jpg',
    description: 'Learn corporate strategies for reducing emissions.',
    unlockWithAERA: 100,
  },
  {
    title: 'GHG Measurement, Reporting & Verification (MRV)',
    slug: 'ghg-mrv',
    image: '/ghg-mrv.jpg',
    description: 'Measure, report and verify GHG data per global standards.',
    unlockWithAERA: 120,
  },

  // 8–11: Project & Policy Path
  {
    title: 'Carbon Project Design',
    slug: 'carbon-projects',
    image: '/carbon-projects.jpg',
    description: 'Design and register your own carbon offset projects.',
    unlockWithAERA: 85,
  },
  {
    title: 'Validation',
    slug: 'validation',
    image: '/validation.jpg',
    description: 'Learn how to validate carbon projects against protocols.',
    unlockWithAERA: 75,
  },
  {
    title: 'Verification',
    slug: 'verification',
    image: '/verification.jpg',
    description: 'Audit and verify GHG reports for compliance.',
    unlockWithAERA: 75,
  },
  {
    title: 'Digital MRV & Blockchain Offsets',
    slug: 'digital-mrv',
    image: '/digital-mrv.jpg',
    description: 'Use Web3 and digital tools to automate MRV processes.',
    unlockWithAERA: 90,
  },
  {
    title: 'Climate Policy & Regulation',
    slug: 'climate-policy',
    image: '/climate-policy.jpg',
    description: 'Understand global carbon markets, Article 6, and regulation.',
    unlockWithAERA: 65,
  },

  // 12–21: Sectoral Scopes
  {
    title: 'Energy Industries (Renewable & Fossil)',
    slug: 'scope-energy',
    image: '/scope-energy.jpg',
    description: 'From coal to solar—GHG impacts of energy generation.',
    unlockWithAERA: 70,
  },
  {
    title: 'Energy Transmission & Distribution',
    slug: 'scope-distribution',
    image: '/scope-distribution.jpg',
    description: 'Grid, infrastructure and losses in power delivery.',
    unlockWithAERA: 60,
  },
  {
    title: 'Energy Demand & Efficiency',
    slug: 'scope-demand',
    image: '/scope-demand.jpg',
    description: 'Reduce consumption with efficiency in buildings and industry.',
    unlockWithAERA: 60,
  },
  {
    title: 'Industrial Processes & Product Use',
    slug: 'scope-industry',
    image: '/scope-industry.jpg',
    description: 'Cement, steel, chemicals—GHG sources in manufacturing.',
    unlockWithAERA: 65,
  },
  {
    title: 'Agriculture, Forestry & Land Use (AFOLU)',
    slug: 'scope-afolu',
    image: '/scope-afolu.jpg',
    description: 'Sequestration, livestock, land-use change and forestry.',
    unlockWithAERA: 55,
  },
  {
    title: 'Transport & Mobile Sources',
    slug: 'scope-transport',
    image: '/scope-transport.jpg',
    description: 'GHG from road, rail, maritime and aviation.',
    unlockWithAERA: 55,
  },
  {
    title: 'Waste Handling & Disposal',
    slug: 'scope-waste',
    image: '/scope-waste.jpg',
    description: 'Landfills, composting and methane capture in waste.',
    unlockWithAERA: 50,
  },
  {
    title: 'Construction & Urban Systems',
    slug: 'scope-construction',
    image: '/scope-construction.jpg',
    description: 'Embodied carbon in buildings and urban infrastructure.',
    unlockWithAERA: 60,
  },
  {
    title: 'Chemical & Metal Industries',
    slug: 'scope-chemicals-metals',
    image: '/scope-chemicals-metals.jpg',
    description: 'Emissions from chemical production and metal smelting.',
    unlockWithAERA: 60,
  },
]

