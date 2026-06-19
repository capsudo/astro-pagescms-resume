import identityDataFromJson from "../content/identity.json";
import bioDataFromJson from "../content/bio.json";
export type TechnologyCategoryName = "frameworks" | "languages" | "stack";

export type Identity = {
  name: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  photoUrl: string;
};

export type Bio = {
  headline: string;
  shortDescription: string;
  longDescription: string;
  avatarUrl: string;
};

export type Social = {
  name: string;
  slug: string;
  displayName?: string;
  iconUrl: string;
  profileBaseUrl: string;
  username: string;
  featured: boolean;
  sortOrder: number;
};

export type TechnologySource = {
  name: string;
  slug: string;
  iconUrl: string;
  twitterUsername: string;
  githubUsername: string;
  redditUsername: string;
  githubProjectUrl: string;
  sortOrder: number;
  featured?: boolean;
  level: number;
};

export type Technology = TechnologySource & {
  localIconUrl: string;
};

export type TechnologyContent = TechnologySource | {
  technology: TechnologySource;
};

export type Project = {
  name: string;
  slug: string;
  periodStartDate: string;
  periodEndDate: string;
  company: string;
  description: string;
  languageSlugs: string[];
  frameworkSlugs: string[];
  stackSlugs: string[];
  projectUrl: string;
  featured: boolean;
  sortOrder: number;
};

export type Experience = {
  name: string;
  slug: string;
  location: string;
  periodStartDate: string;
  periodEndDate: string;
  company: string;
  description: string;
  sortOrder: number;
};

type JsonModule<T> = {
  default: T;
};

type TechnologyGroup = {
  categoryLabel: string;
  categoryName: TechnologyCategoryName;
  items: Technology[];
};

const frameworkJsonModules = import.meta.glob<JsonModule<TechnologyContent>>("../content/frameworks/*.json", { eager: true });
const languageJsonModules = import.meta.glob<JsonModule<TechnologyContent>>("../content/languages/*.json", { eager: true });
const stackJsonModules = import.meta.glob<JsonModule<TechnologyContent>>("../content/stack/*.json", { eager: true });
const socialJsonModules = import.meta.glob<JsonModule<Social>>("../content/socials/*.json", { eager: true });
const projectJsonModules = import.meta.glob<JsonModule<Project>>("../content/projects/*.json", { eager: true });
const experienceJsonModules = import.meta.glob<JsonModule<Experience>>("../content/experiences/*.json", { eager: true });

// JSON imports keep Pages CMS and Astro reading same source files.
function convertJsonModuleRecordToSortedArray<T extends { name: string; sortOrder: number }>(jsonModuleRecord: Record<string, JsonModule<T>>): T[] {
  return Object.values(jsonModuleRecord)
    .map((jsonModule) => jsonModule.default)
    .sort((leftItem, rightItem) => leftItem.sortOrder - rightItem.sortOrder || leftItem.name.localeCompare(rightItem.name));
}

function convertTechnologyJsonModuleRecordToSortedArray(jsonModuleRecord: Record<string, JsonModule<TechnologyContent>>): Technology[] {
  return Object.values(jsonModuleRecord)
    .map((jsonModule) => normalizeTechnologyContent(jsonModule.default))
    .sort((leftItem, rightItem) => leftItem.sortOrder - rightItem.sortOrder || leftItem.name.localeCompare(rightItem.name));
}

function normalizeTechnologyContent(technologyContent: TechnologyContent): Technology {
  const technology = "technology" in technologyContent ? technologyContent.technology : technologyContent;

  // Keep CDN iconUrl for generated files; add local path for Astro page.
  return {
    ...technology,
    localIconUrl: createLocalTechnologyIconUrl(technology.slug),
  };
}

export function createLocalTechnologyIconUrl(technologySlug: string): string {
  return `/media/technology-icons/${technologySlug}.svg`;
}

export const identity = identityDataFromJson as Identity;
export const bio = bioDataFromJson as Bio;
export const socials = convertJsonModuleRecordToSortedArray(socialJsonModules);
export const frameworks = convertTechnologyJsonModuleRecordToSortedArray(frameworkJsonModules);
export const languages = convertTechnologyJsonModuleRecordToSortedArray(languageJsonModules);
export const stack = convertTechnologyJsonModuleRecordToSortedArray(stackJsonModules);
export const projects = convertJsonModuleRecordToSortedArray(projectJsonModules);
export const experiences = convertJsonModuleRecordToSortedArray(experienceJsonModules);

export const technologyGroups: TechnologyGroup[] = [
  {
    categoryLabel: "Frameworks",
    categoryName: "frameworks",
    items: frameworks,
  },
  {
    categoryLabel: "Languages",
    categoryName: "languages",
    items: languages,
  },
  {
    categoryLabel: "Stack",
    categoryName: "stack",
    items: stack,
  },
];

const technologiesBySlug = new Map<string, Technology>(
  [...frameworks, ...languages, ...stack].map((technology) => [technology.slug, technology]),
);

export function findTechnologyBySlug(technologySlug: string): Technology | undefined {
  return technologiesBySlug.get(technologySlug);
}

export function createSocialProfileUrl(social: Social): string {
  return `${social.profileBaseUrl}${social.username}`;
}

export function createReadablePeriodLabel(periodStartDate: string, periodEndDate: string): string {
  const readableStartDate = createReadableMonthYearLabel(periodStartDate);
  const readableEndDate = periodEndDate ? createReadableMonthYearLabel(periodEndDate) : "Present";

  return `${readableStartDate} - ${readableEndDate}`;
}

function createReadableMonthYearLabel(dateValue: string): string {
  const parsedDate = new Date(`${dateValue}T00:00:00Z`);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}
