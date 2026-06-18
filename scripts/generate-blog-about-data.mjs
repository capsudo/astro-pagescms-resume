import { mkdir, writeFile } from "node:fs/promises";
import { loadCompleteContent, createReadablePeriodLabel } from "./load-content.mjs";

const outputDirectory = new URL("../generated/", import.meta.url);
const content = await loadCompleteContent();

// Shape is intentionally boring JSON. Blog repo can consume or transform it.
const blogAboutPageData = {
  identity: content.identity,
  technologies: {
    frameworks: content.frameworks,
    languages: content.languages,
    stack: content.stack,
  },
  projects: content.projects.map((project) => ({
    ...project,
    periodLabel: createReadablePeriodLabel(project.periodStartDate, project.periodEndDate),
  })),
  experiences: content.experiences.map((experience) => ({
    ...experience,
    periodLabel: createReadablePeriodLabel(experience.periodStartDate, experience.periodEndDate),
  })),
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(new URL("blog-about-page-data.json", outputDirectory), `${JSON.stringify(blogAboutPageData, null, 2)}\n`);

console.log("Generated blog about-page data in generated/blog-about-page-data.json.");
