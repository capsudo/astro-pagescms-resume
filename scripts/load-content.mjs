import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const repositoryRootDirectory = new URL("..", import.meta.url);

// One loader feeds markdown and blog exports. Astro has own Vite loader.
export async function loadCompleteContent() {
  const identity = await readJsonFile("src/content/identity.json");
  const bio = await readJsonFile("src/content/bio.json");
  const socials = await readJsonDirectory("src/content/socials");
  const frameworks = await readJsonDirectory("src/content/frameworks", normalizeTechnologyContent);
  const languages = await readJsonDirectory("src/content/languages", normalizeTechnologyContent);
  const stack = await readJsonDirectory("src/content/stack", normalizeTechnologyContent);
  const projects = await readJsonDirectory("src/content/projects");
  const experiences = await readJsonDirectory("src/content/experiences");

  const technologiesBySlug = new Map(
    [...frameworks, ...languages, ...stack].map((technology) => [technology.slug, technology]),
  );

  return {
    identity,
    bio,
    socials,
    frameworks,
    languages,
    stack,
    projects,
    experiences,
    technologiesBySlug,
  };
}

async function readJsonDirectory(relativeDirectoryPath, normalizeJsonObject = (jsonObject) => jsonObject) {
  const absoluteDirectoryUrl = new URL(`${relativeDirectoryPath}/`, repositoryRootDirectory);
  const directoryEntries = await readdir(absoluteDirectoryUrl, { withFileTypes: true });
  const jsonFileNames = directoryEntries
    .filter((directoryEntry) => directoryEntry.isFile() && directoryEntry.name.endsWith(".json"))
    .map((directoryEntry) => directoryEntry.name);
  const jsonObjects = await Promise.all(
    jsonFileNames.map((jsonFileName) => readJsonFile(join(relativeDirectoryPath, jsonFileName))),
  );
  const normalizedJsonObjects = jsonObjects.map((jsonObject) => normalizeJsonObject(jsonObject));

  return normalizedJsonObjects.sort((leftItem, rightItem) => leftItem.sortOrder - rightItem.sortOrder || leftItem.name.localeCompare(rightItem.name));
}

function normalizeTechnologyContent(technologyContent) {
  const technology = technologyContent.technology ?? technologyContent;

  return {
    ...technology,
    localIconUrl: createLocalTechnologyIconUrl(technology.slug),
  };
}

export function createLocalTechnologyIconUrl(technologySlug) {
  return `/media/technology-icons/${technologySlug}.svg`;
}

async function readJsonFile(relativeFilePath) {
  const absoluteFileUrl = new URL(relativeFilePath, repositoryRootDirectory);
  const fileText = await readFile(absoluteFileUrl, "utf8");

  return JSON.parse(fileText);
}

export function createReadablePeriodLabel(periodStartDate, periodEndDate) {
  const readableStartDate = createReadableMonthYearLabel(periodStartDate);
  const readableEndDate = periodEndDate ? createReadableMonthYearLabel(periodEndDate) : "Present";

  return `${readableStartDate} - ${readableEndDate}`;
}

function createReadableMonthYearLabel(dateValue) {
  const parsedDate = new Date(`${dateValue}T00:00:00Z`);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}
