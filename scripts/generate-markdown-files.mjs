import { writeFile } from "node:fs/promises";
import { loadCompleteContent } from "./load-content.mjs";

const outputDirectory = new URL("../generated/", import.meta.url);

const content = await loadCompleteContent();
const githubProfileMarkdown = createGithubProfileMarkdown(content);
const twitterBioMarkdown = createSocialBioMarkdown(content, "twitter", 160);
const redditBioMarkdown = createSocialBioMarkdown(content, "reddit", 420);
const githubBioMarkdown = createSocialBioMarkdown(content, "github", 300);

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

function createSocialBioMarkdown({ bio, frameworks }, socialName, maximumCharacterCount) {
  const featuredFrameworkSocialLabels = frameworks
    .filter((technology) => technology.featured)
    .map((technology) => createTechnologySocialLabel(technology, socialName));

  // Keep two-line bio. Trim full labels only if platform limit needs it.
  return `${createLimitedSocialBioText(bio.headline, featuredFrameworkSocialLabels, maximumCharacterCount)}\n`;
}

function createLimitedSocialBioText(headline, socialLabels, maximumCharacterCount) {
  const socialLabelsToUse = [...socialLabels];
  let socialBioText = createSocialBioText(headline, socialLabelsToUse);

  while (socialLabelsToUse.length > 0 && socialBioText.length > maximumCharacterCount) {
    socialLabelsToUse.pop();
    socialBioText = createSocialBioText(headline, socialLabelsToUse);
  }

  return socialBioText;
}

function createSocialBioText(headline, socialLabels) {
  return `${headline}\n${socialLabels.join(" ")}`;
}

function createTechnologySocialLabel(technology, socialName) {
  const socialUsername = technology[`${socialName}Username`];

  if (socialUsername) {
    return createPrefixedSocialUsername(socialUsername, socialName);
  }

  return technology.name;
}

function createPrefixedSocialUsername(socialUsername, socialName) {
  if (socialName === "reddit") {
    return `r/${socialUsername}`;
  }

  return `@${socialUsername}`;
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
