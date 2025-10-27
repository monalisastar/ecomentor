// src/data/courseData.ts

export interface Course {
  id: string                // ✅ added for stable references
  title: string
  slug: string
  image: string
  description: string
  unlockWithAERA?: number   // ✅ optional token unlock price
}

// ✅ helper to auto-generate id from slug
const makeCourse = (
  title: string,
  slug: string,
  image: string,
  description: string,
  unlockWithAERA?: number
): Course => ({
  id: slug, // ✅ use slug as id for now
  title,
  slug,
  image,
  description,
  unlockWithAERA,
})

export const courseData: Course[] = [
  // 🌍 1–4: Foundational
  makeCourse(
    'Introduction to Climate Change & Emissions',
    'climate-intro',
    '/climate-intro.jpg',
    'Learn how climate change works and why emissions matter.',
    40
  ),
  makeCourse(
    'What is Carbon? Frameworks & Types',
    'carbon-frameworks',
    '/carbon-frameworks.jpg',
    'Explore the building blocks of carbon science.',
    45
  ),
  makeCourse(
    'GHG Basics: CO₂, CH₄, N₂O & More',
    'ghg-basics',
    '/ghg-basics.jpg',
    'Understand the major greenhouse gases and their impact.',
    50
  ),
  makeCourse(
    'Carbon Developer Essentials',
    'carbon-developer',
    '/carbon-developer.jpg',
    'Build carbon-focused applications and smart contracts.',
    70
  ),

  // 🎓 5–7: Professional Diplomas
  makeCourse(
    'Diploma in GHG Accounting',
    'ghg-accounting',
    '/ghg-accounting.jpg',
    'Master inventory, scopes and carbon footprinting.',
    100
  ),
  makeCourse(
    'Diploma in Carbon Management',
    'carbon-management',
    '/carbon-management.jpg',
    'Learn corporate strategies for reducing emissions.',
    100
  ),
  makeCourse(
    'GHG Measurement, Reporting & Verification (MRV)',
    'ghg-mrv',
    '/ghg-mrv.jpg',
    'Measure, report and verify GHG data per global standards.',
    120
  ),

  // 🏗️ 8–11: Project & Policy Path
  makeCourse(
    'Carbon Project Design',
    'carbon-projects',
    '/carbon-projects.jpg',
    'Design and register your own carbon offset projects.',
    85
  ),
  makeCourse(
    'Validation',
    'validation',
    '/validation.jpg',
    'Learn how to validate carbon projects against protocols.',
    75
  ),
  makeCourse(
    'Verification',
    'verification',
    '/verification.jpg',
    'Audit and verify GHG reports for compliance.',
    75
  ),
  makeCourse(
    'Digital MRV & Blockchain Offsets',
    'digital-mrv',
    '/digital-mrv.jpg',
    'Use Web3 and digital tools to automate MRV processes.',
    90
  ),
  makeCourse(
    'Climate Policy & Regulation',
    'climate-policy',
    '/climate-policy.jpg',
    'Understand global carbon markets, Article 6, and regulation.',
    65
  ),

  // 🌱 12–21: Sectoral Scopes
  makeCourse(
    'Energy Industries (Renewable & Fossil)',
    'scope-energy',
    '/scope-energy.jpg',
    'From coal to solar—GHG impacts of energy generation.',
    70
  ),
  makeCourse(
    'Energy Transmission & Distribution',
    'scope-distribution',
    '/scope-distribution.jpg',
    'Grid, infrastructure and losses in power delivery.',
    60
  ),
  makeCourse(
    'Energy Demand & Efficiency',
    'scope-demand',
    '/scope-demand.jpg',
    'Reduce consumption with efficiency in buildings and industry.',
    60
  ),
  makeCourse(
    'Industrial Processes & Product Use',
    'scope-industry',
    '/scope-industry.jpg',
    'Cement, steel, chemicals—GHG sources in manufacturing.',
    65
  ),
  makeCourse(
    'Agriculture, Forestry & Land Use (AFOLU)',
    'scope-afolu',
    '/scope-afolu.jpg',
    'Sequestration, livestock, land-use change and forestry.',
    55
  ),
  makeCourse(
    'Transport & Mobile Sources',
    'scope-transport',
    '/scope-transport.jpg',
    'GHG from road, rail, maritime and aviation.',
    55
  ),
  makeCourse(
    'Waste Handling & Disposal',
    'scope-waste',
    '/scope-waste.jpg',
    'Landfills, composting and methane capture in waste.',
    50
  ),
  makeCourse(
    'Construction & Urban Systems',
    'scope-construction',
    '/scope-construction.jpg',
    'Embodied carbon in buildings and urban infrastructure.',
    60
  ),
  makeCourse(
    'Chemical & Metal Industries',
    'scope-chemicals-metals',
    '/scope-chemicals-metals.jpg',
    'Emissions from chemical production and metal smelting.',
    60
  ),
]
