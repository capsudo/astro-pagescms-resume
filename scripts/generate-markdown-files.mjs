import { writeFile } from "node:fs/promises";
import { loadCompleteContent } from "./load-content.mjs";

const outputDirectory = new URL("../generated/", import.meta.url);

const content = await loadCompleteContent();
const githubProfileMarkdown = createGithubProfileMarkdown(content);
const socialBiosMarkdown = createSocialBiosMarkdown(content);

await writeFile(new URL("github-profile.md", outputDirectory), githubProfileMarkdown);
await writeFile(new URL("social-bios.md", outputDirectory), socialBiosMarkdown);

console.log("Generated markdown files in generated/.");

function createGithubProfileMarkdown({ bio, socials, frameworks, languages, tools }) {
  const githubSocial = findRequiredSocialBySlug(socials, "github");
  const githubProfileDisplayName = githubSocial.displayName ?? githubSocial.username;
  const featuredFrameworkLines = createFeaturedTechnologyMarkdownList(frameworks, 5);
  const featuredLanguageLines = createFeaturedTechnologyMarkdownList(languages, 3);
  const featuredToolLines = createFeaturedTechnologyMarkdownList(tools, 5);

  return `# ${githubProfileDisplayName}

${bio.shortDescription}

## Frameworks handled

${featuredFrameworkLines}

## Languages spoken

${featuredLanguageLines}

## Toolchain used

${featuredToolLines}
`;
}

function findRequiredSocialBySlug(socials, socialSlug) {
  const matchingSocial = socials.find((social) => social.slug === socialSlug);

  if (!matchingSocial) {
    throw new Error(`Missing required social: ${socialSlug}`);
  }

  return matchingSocial;
}

function createSocialBiosMarkdown(content) {
  const githubBioMarkdown = createSocialBioMarkdown(content, "github", 300);
  const twitterBioMarkdown = createSocialBioMarkdown(content, "twitter", 160);
  const redditBioMarkdown = createSocialBioMarkdown(content, "reddit", 420);

  return `# Social bios

## GitHub

\`\`\`text
${githubBioMarkdown.trimEnd()}
\`\`\`

Copy-paste this to [Github profile > Bio](https://github.com/settings/profile)

## Twitter

\`\`\`text
${twitterBioMarkdown.trimEnd()}
\`\`\`

Copy-paste this to [Twitter profile](https://x.com/settings/profile)

## Reddit

\`\`\`text
${redditBioMarkdown.trimEnd()}
\`\`\`

Copy-paste this to [Reddit profile > About description](https://www.reddit.com/settings/profile)
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
