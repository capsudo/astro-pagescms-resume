import { Buffer } from "node:buffer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { loadCompleteContent } from "./load-content.mjs";

const technologyIconAssetDirectory = new URL("../public/media/technology-icons/", import.meta.url);

const content = await loadCompleteContent();
const technologies = collectUniqueTechnologies([
  ...content.frameworks,
  ...content.languages,
  ...content.stack,
]);

await mkdir(technologyIconAssetDirectory, { recursive: true });

for (const technology of technologies) {
  await createTechnologyIconAsset(technology);
}

console.log(`Generated ${technologies.length} technology icon assets in public/media/technology-icons/.`);

function collectUniqueTechnologies(technologiesWithPossibleDuplicates) {
  const technologiesBySlug = new Map();

  for (const technology of technologiesWithPossibleDuplicates) {
    technologiesBySlug.set(technology.slug, technology);
  }

  return [...technologiesBySlug.values()].sort((leftTechnology, rightTechnology) => {
    return leftTechnology.sortOrder - rightTechnology.sortOrder || leftTechnology.name.localeCompare(rightTechnology.name);
  });
}

async function createTechnologyIconAsset(technology) {
  // Site loads slug asset; CDN URL remains CMS source.
  const technologyIconAssetUrl = new URL(`${technology.slug}.svg`, technologyIconAssetDirectory);
  const downloadedIconBuffer = await downloadSvgIcon(technology);
  const existingIconBuffer = await readOptionalFile(technologyIconAssetUrl);

  if (existingIconBuffer?.equals(downloadedIconBuffer)) {
    return;
  }

  await writeFile(technologyIconAssetUrl, downloadedIconBuffer);
}

async function downloadSvgIcon(technology) {
  if (!technology.iconUrl.startsWith("https://")) {
    throw new Error(`Technology iconUrl must be public HTTPS URL: ${technology.slug}`);
  }

  const iconResponse = await fetch(technology.iconUrl);

  if (!iconResponse.ok) {
    throw new Error(`Could not download ${technology.slug} icon: ${iconResponse.status} ${iconResponse.statusText}`);
  }

  const iconBuffer = Buffer.from(await iconResponse.arrayBuffer());
  const iconTextPreview = iconBuffer.toString("utf8", 0, 200);

  if (!iconTextPreview.includes("<svg")) {
    throw new Error(`Downloaded technology icon is not SVG: ${technology.slug}`);
  }

  return iconBuffer;
}

async function readOptionalFile(fileUrl) {
  try {
    return await readFile(fileUrl);
  } catch (error) {
    if (error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}
