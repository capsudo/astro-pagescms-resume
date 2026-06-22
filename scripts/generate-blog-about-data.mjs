import { mkdir, writeFile } from "node:fs/promises";
import { loadCompleteContent } from "./load-content.mjs";

const outputDirectory = new URL("../generated/", import.meta.url);
const content = await loadCompleteContent();

// Public export only. Do not add identity, socials, projects, jobs, email, or phone.
const blogAboutPageData = {
  technologies: {
    frameworks: content.frameworks.map(createPublicTechnologyData),
    languages: content.languages.map(createPublicTechnologyData),
    tools: content.tools.map(createPublicTechnologyData),
  },
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(new URL("blog-about-page-data.json", outputDirectory), `${JSON.stringify(blogAboutPageData, null, 2)}\n`);

console.log("Generated blog about-page data in generated/blog-about-page-data.json.");

function createPublicTechnologyData(technology) {
  return {
    name: technology.name,
    slug: technology.slug,
    iconUrl: technology.iconUrl,
    twitterUsername: technology.twitterUsername,
    githubUsername: technology.githubUsername,
    redditUsername: technology.redditUsername,
    githubProjectUrl: technology.githubProjectUrl,
    sortOrder: technology.sortOrder,
    featured: technology.featured ?? false,
    level: technology.level,
  };
}
