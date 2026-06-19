import { Buffer } from "node:buffer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { loadCompleteContent } from "./load-content.mjs";

const technologyIconAssetDirectory = new URL("../public/media/technology-icons/", import.meta.url);
const svgIconRequestHeaders = {
  accept: "image/svg+xml,text/plain;q=0.9,*/*;q=0.8",
  "user-agent": "astro-pagescms-resume icon generator",
};

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

  const primaryIconDownloadResult = await tryDownloadSvgIconFromUrl(technology.iconUrl);

  if (primaryIconDownloadResult.ok) {
    return primaryIconDownloadResult.iconBuffer;
  }

  const fallbackIconUrl = createSimpleIconsJsdelivrFallbackUrl(technology.iconUrl);

  if (fallbackIconUrl) {
    const fallbackIconDownloadResult = await tryDownloadSvgIconFromUrl(fallbackIconUrl);

    if (fallbackIconDownloadResult.ok) {
      return addSimpleIconsCdnColorToFallbackSvg(fallbackIconDownloadResult.iconBuffer, technology.iconUrl);
    }

    throw new Error(
      `Could not download ${technology.slug} icon: ${primaryIconDownloadResult.errorMessage}; fallback failed: ${fallbackIconDownloadResult.errorMessage}`,
    );
  }

  throw new Error(`Could not download ${technology.slug} icon: ${primaryIconDownloadResult.errorMessage}`);
}

async function tryDownloadSvgIconFromUrl(iconUrl) {
  try {
    const iconResponse = await fetch(iconUrl, { headers: svgIconRequestHeaders });

    if (!iconResponse.ok) {
      return {
        ok: false,
        errorMessage: `${iconUrl} returned ${iconResponse.status} ${iconResponse.statusText}`,
      };
    }

    const iconBuffer = Buffer.from(await iconResponse.arrayBuffer());

    if (!isSvgIconBuffer(iconBuffer)) {
      return {
        ok: false,
        errorMessage: `${iconUrl} did not return SVG`,
      };
    }

    return {
      ok: true,
      iconBuffer,
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage: `${iconUrl} failed: ${error.message}`,
    };
  }
}

function isSvgIconBuffer(iconBuffer) {
  const iconTextPreview = iconBuffer.toString("utf8", 0, 200);

  return iconTextPreview.includes("<svg");
}

function createSimpleIconsJsdelivrFallbackUrl(iconUrl) {
  const parsedIconUrl = new URL(iconUrl);

  if (parsedIconUrl.hostname !== "cdn.simpleicons.org") {
    return undefined;
  }

  const [simpleIconsSlug] = parsedIconUrl.pathname.split("/").filter(Boolean);

  if (!simpleIconsSlug) {
    return undefined;
  }

  return `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${simpleIconsSlug}.svg`;
}

function addSimpleIconsCdnColorToFallbackSvg(iconBuffer, sourceIconUrl) {
  const colorHex = createSimpleIconsCdnColorHex(sourceIconUrl);

  if (!colorHex) {
    return iconBuffer;
  }

  const iconSvgText = iconBuffer.toString("utf8");

  if (iconSvgText.includes(" fill=")) {
    return iconBuffer;
  }

  return Buffer.from(iconSvgText.replace("<svg ", `<svg fill="#${colorHex}" `));
}

function createSimpleIconsCdnColorHex(iconUrl) {
  const parsedIconUrl = new URL(iconUrl);
  const [, colorPathPart] = parsedIconUrl.pathname.split("/").filter(Boolean);

  if (!colorPathPart || !/^[a-fA-F0-9]{3,8}$/.test(colorPathPart)) {
    return undefined;
  }

  return colorPathPart;
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
