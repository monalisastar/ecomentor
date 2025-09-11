// src/utils/courseHelpers.ts

import { courseData } from "@/data/courseData"


export const findCourseBySlug = (slug: string) =>
  courseData.find((course) => course.slug === slug);

// Define outlines here to keep them separate
export const outlines: Record<string, string[]> = {
  "climate-change-intro": [
    "Definition of Climate Change",
    "Climate vs Weather",
    "Causes of Climate Change",
    "Impacts on Ecosystems and Societies",
  ],
  "carbon-markets-ghg-accounting": [
    "Introduction to Carbon Markets",
    "Introduction to GHG Accounting",
    "Key GHGs and Emission Factors",
    "Carbon Pricing and Market Mechanisms",
    "Practical Steps in GHG Inventory Preparation",
    "Case Study: Successful Carbon Market Programs",
    "The Role of Business in Carbon Markets",
    "Conclusion and Future Directions",
  ],
};

