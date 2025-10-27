// src/data/enrolledCourses.ts

export type EnrolledCourse = {
  slug: string
  title: string
  duration: string
  thumbnail: string
  progress: number
  completed: boolean
}

export const enrolledCourses: EnrolledCourse[] = [
  {
    slug: 'climate-intro', // ✅ matches courseData
    title: 'Introduction to Climate Change & Emissions',
    duration: '2 hours',
    thumbnail: '/images/climate-intro.png',
    progress: 45,
    completed: false,
  },
  {
    slug: 'carbon-frameworks', // ✅ matches courseData
    title: 'What is Carbon? Frameworks & Types',
    duration: '1 hour',
    thumbnail: '/images/carbon-framework.png',
    progress: 100,
    completed: true,
  },
  {
    slug: 'ghg-basics',
    title: 'GHG Basics: CO₂, CH₄, N₂O & More',
    duration: '1.5 hours',
    thumbnail: '/images/ghg-basics.jpg',
    progress: 60,
    completed: false,
  },
  {
    slug: 'carbon-developer',
    title: 'Carbon Developer Essentials',
    duration: '2.5 hours',
    thumbnail: '/images/carbon-developer.jpg',
    progress: 0,
    completed: false,
  },
]
