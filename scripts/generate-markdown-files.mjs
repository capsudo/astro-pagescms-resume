import { writeFile } from "node:fs/promises";
import { loadCompleteContent } from "./load-content.mjs";

const outputDirectory = new URL("../generated/", import.meta.url);

const content = await loadCompleteContent();
const githubProfileMarkdown = createGithubProfileMarkdown(content);
const twitterBioMarkdown = createShortBioMarkdown(content, 160);
const redditBioMarkdown = createShortBioMarkdown(content, 420);
const githubBioMarkdown = createShortBioMarkdown(content, 300);

await writeFile(new URL("github-profile.md", outputDirectory), githubProfileMarkdown);
await writeFile(new URL("twitter-bio.md", outputDirectory), twitterBioMarkdown);
await writeFile(new URL("reddit-bio.md", outputDirectory), redditBioMarkdown);
await writeFile(new URL("github-bio.md", outputDirectory), githubBioMarkdown);

console.log("Generated markdown files in generated/.");

function createGithubProfileMarkdown({ bio, socials, frameworks, languages, stack }) {
  const featuredFrameworkLines = createFeaturedTechnologyMarkdownList(frameworks, 5);
  const featuredLanguageLines = createFeaturedTechnologyMarkdownList(languages, 3);
  const featuredStackLines = createFeaturedTechnologyMarkdownList(stack, 5);

  return `# ${socials.github.name}

${bio.shortDescription}

## Frameworks handled

${featuredFrameworkLines}

## Languages spoken

${featuredLanguageLines}

## Toolchain used

${featuredStackLines}
`;
}

function createShortBioMarkdown({ bio, languages, frameworks }, maximumCharacterCount) {
  const coreTechnologies = [...languages, ...frameworks]
    .slice(0, 5)
    .map((technology) => technology.name)
    .join(", ");
  const rawBio = `${bio.headline}. ${bio.shortDescription} ${coreTechnologies}.`;

  if (rawBio.length <= maximumCharacterCount) {
    return `${rawBio}\n`;
  }

  return `${rawBio.slice(0, maximumCharacterCount - 3).trim()}...\n`;
}

function createFeaturedTechnologyMarkdownList(technologies, maximumFeaturedTechnologyCount) {
  return technologies
    .filter((technology) => technology.featured)
    .slice(0, maximumFeaturedTechnologyCount)
    .map((technology) => createTechnologyMarkdownListItem(technology))
    .join("\n");
}

function createTechnologyMarkdownListItem(technology) {
  const levelStars = createLevelStars(technology.level);

  return `- <a href="${technology.githubProjectUrl}"><img src="${technology.iconUrl}" alt="" width="16" height="16" /> <strong>${technology.name}</strong></a> ${levelStars}`;
}

function createLevelStars(level) {
  const clampedLevel = Math.max(1, Math.min(5, level));
  const filledStars = "★".repeat(clampedLevel);
  const emptyStars = "☆".repeat(5 - clampedLevel);

  return `${filledStars}${emptyStars}`;
}
