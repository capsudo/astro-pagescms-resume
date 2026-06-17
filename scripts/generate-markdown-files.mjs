import { mkdir, writeFile } from "node:fs/promises";
import { loadCompleteContent, createReadablePeriodLabel } from "./load-content.mjs";

const outputDirectory = new URL("../generated/", import.meta.url);

const content = await loadCompleteContent();
const githubProfileMarkdown = createGithubProfileMarkdown(content);
const twitterBioMarkdown = createShortBioMarkdown(content, 160);
const redditBioMarkdown = createShortBioMarkdown(content, 420);
const githubBioMarkdown = createShortBioMarkdown(content, 300);

await mkdir(new URL("github-profile/", outputDirectory), { recursive: true });
await mkdir(new URL("bios/", outputDirectory), { recursive: true });
await writeFile(new URL("github-profile/README.md", outputDirectory), githubProfileMarkdown);
await writeFile(new URL("bios/twitter-bio.md", outputDirectory), twitterBioMarkdown);
await writeFile(new URL("bios/reddit-bio.md", outputDirectory), redditBioMarkdown);
await writeFile(new URL("bios/github-bio.md", outputDirectory), githubBioMarkdown);

console.log("Generated markdown files in generated/.");

function createGithubProfileMarkdown({ identity, projects, experiences, technologiesBySlug }) {
  const projectLines = projects
    .slice(0, 4)
    .map((project) => {
      const technologyNames = collectProjectTechnologyNames(project, technologiesBySlug).join(", ");
      const periodLabel = createReadablePeriodLabel(project.periodStartDate, project.periodEndDate);

      return `- **${project.name}** (${periodLabel}) - ${project.description} _${technologyNames}_`;
    })
    .join("\n");

  const experienceLines = experiences
    .slice(0, 3)
    .map((experience) => `- **${experience.name}**, ${experience.company} - ${createReadablePeriodLabel(experience.periodStartDate, experience.periodEndDate)}`)
    .join("\n");

  return `# ${identity.name}

${identity.shortDescription}

## Current

${identity.availability}

## Selected projects

${projectLines}

## Experience

${experienceLines}

## Links

- GitHub: https://github.com/${identity.githubUsername}
- Twitter: https://twitter.com/${identity.twitterUsername}
- Reddit: https://www.reddit.com/user/${identity.redditUsername}
`;
}

function createShortBioMarkdown({ identity, languages, frameworks }, maximumCharacterCount) {
  const coreTechnologies = [...languages, ...frameworks]
    .slice(0, 5)
    .map((technology) => technology.name)
    .join(", ");
  const rawBio = `${identity.headline}. ${identity.shortDescription} ${coreTechnologies}.`;

  if (rawBio.length <= maximumCharacterCount) {
    return `${rawBio}\n`;
  }

  return `${rawBio.slice(0, maximumCharacterCount - 3).trim()}...\n`;
}

function collectProjectTechnologyNames(project, technologiesBySlug) {
  return [...project.languageSlugs, ...project.frameworkSlugs, ...project.stackSlugs]
    .map((technologySlug) => technologiesBySlug.get(technologySlug)?.name)
    .filter(Boolean);
}
