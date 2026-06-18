# Astro Pages CMS Resume

Astro resume website backed by JSON content files and editable through [Pages CMS](https://pagescms.org), plus external generated content using the same data.

## Development

Enter Nix shell:

```bash
nix develop
```

The shell provides Node, npm, Git, GitHub CLI, and Netlify CLI from pinned Nixpkgs.

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:4321/>.

Build static site:

```bash
npm run build
```

Build [Generated Content](#generated-content):

```bash
npm run generate:markdown
npm run generate:blog-data
```

## Deployment

This site is deployed via Netlify as a static Astro site.

Deploys are handled by Netlify CI/CD from GitHub. Normal deploy workflow:

```bash
git add .
git commit -m "Describe change"
git push
```

### Set GitHub Workflow Scope

This repo contains GitHub Actions workflow files under [.github/workflows](./.github/workflows).

GitHub rejects pushes that create or update workflow files unless current GitHub auth token has `workflow` scope. If push fails with message like `refusing to allow an OAuth App to create or update workflow`, refresh auth from Nix shell:

Note: No need to `gh login` if already logged globally.

```bash
nix develop
npm run github:scope
```

_`gh` is provided by [flake.nix](./flake.nix), so it does not need to be installed globally._

### Link Netlify site

Link this local repository to a Netlify site:

```bash
nix develop
npm run netlify:login
npm run netlify:link
```

Note: It can create a new site or connect to an existing one, set up continuous deployment from GitHub, and write local Netlify state under `.netlify/`.
Use defaults when asked since [netlify.toml](./netlify.toml) already tells Netlify how to build the site.

_Netlify CLI is provided by [flake.nix](./flake.nix) so it does not need to be installed globally with npm._

### Open the Netlify admin URL

Site name, production URL, deploy hooks, and connected Git repository are configured in Netlify, not in `netlify.toml`.

```bash
npm run netlify:admin
```

### Deploys

Netlify deploys are visible at <https://app.netlify.com/projects/astro-pagescms-resume/deploys>.

Note: This repo uses `master` as production branch, if Netlify defaults to `main`, change **Production branch** to `master`. This is configured under [#branches-and-deploy-contexts](https://app.netlify.com/projects/astro-pagescms-resume/configuration/deploys#branches-and-deploy-contexts).

### GitHub App Sync Setup (optional)

This repo contains a workflow that pushes [generated content](#generated-content) to required repos. It uses GitHub App token instead of personal access token. To get this token a GitHub App needs to be setup:

1. Go to <https://github.com/settings/apps/new>.
2. Name it something like `astro-pagescms-resume-sync`.
3. Disable webhook if GitHub allows it, or leave webhook URL empty if not needed.
4. Set repository permission **Contents** to **Read and write**.
5. Keep default **Metadata** read permission.
6. Install the app on selected repositories:
   - `capsudo/astro-pagescms-resume`
   - `capsudo/capsudo`
   - `capsudo/capsudo.github.io`
7. Generate a private key and download the `.pem` file.

Add repository variables and secrets in `capsudo/astro-pagescms-resume`:

1. Go to `Settings > Secrets and variables > Actions`.
2. Add repository variable `APP_CLIENT_ID` with GitHub App client ID.
3. Add repository secret `APP_PRIVATE_KEY` with full `.pem` private key content.

_Note: using GitHub App token instead of personal access token lets one app push generated files to selected repos with narrow permissions._

### Edit content in Pages CMS

Page CMS is the "UI admin page" where the content can be updated. It's accessible at <https://app.pagescms.org/capsudo/astro-pagescms-resume/master>

Pages CMS reads and writes same JSON files Astro uses to render website.

It uses [.pages.yml](./.pages.yml) to:
- derive the collections and fields to display: content.name/label/fields
- find/load the data (editable content): content.type/path/format
- where uploaded media should be stored: media.output

Each update on Page CMS produces a commit that modifies the JSON data. This itself triggers:
- Netlify deploy
- GitHub workflow that produces and syncs generated content

## Generated Content

This repo also contains content generated from the same JSON data. It produces markdown files and data used by another astro site page (blog/about page).

### Markdown files

Long bio visible on top of [Github user page](https://github.com/capsudo)
- [generated/github-profile](./generated/github-profile.md) => pushed automatically to [GitHub "profile" README](https://github.com/capsudo/capsudo/README.md)

Short bios for social profiles:
- [generated/github-bio](./generated/github-bio.md) => copy-paste it to [Github settings profile](https://github.com/settings/profile)
- [generated/twitter-bio](./generated/twitter-bio.md) => copy-paste it to [Twitter settings profile](https://x.com/settings/profile)
- [generated/reddit-bio](./generated/reddit-bio.md) => copy-paste it to [Reddit settings profile](https://www.reddit.com/settings/profile)

### Blog About page data

JSON data for [blog](https://github.com/capsudo/capsudo.github.io)'s About page:
- [generated/blog-about-page-data.json](./generated/blog-about-page-data.json) => pushed automatically to [github.com/capsudo/capsudo.github.io/src/data/about-page-data.json](https://github.com/capsudo/capsudo.github.io/src/data/about-page-data.json).

### Content generation

Those files can be generated locally (see [Development](#development)).
They are also built automatically and pushed to respective repos by the GitHub workflow [workflow.yml](.github/workflows/workflow.yml).

This workflow:

1. Generates markdown files.
2. Generates blog about-page JSON.
3. Uploads all generated files as workflow artifact named `generated-content`.
4. Pushes [generated/github-profile.md](./generated/github-profile.md) to `capsudo/capsudo` as `README.md`.
5. Pushes [generated/blog-about-page-data.json](./generated/blog-about-page-data.json) to `capsudo/capsudo.github.io` as `src/data/about-page-data.json`.

Note: Generated files are visible/downloadable from the workflow run page <https://github.com/capsudo/astro-pagescms-resume/actions/workflows/workflow.yml>.

## Project Structure

```text
.
├── .pages.yml
├── astro.config.mjs
├── netlify.toml
├── components.json
├── package.json
├── flake.lock
├── flake.nix
├── generated/
│   ├── github-profile.md
│   ├── github-bio.md
│   ├── twitter-bio.md
│   ├── reddit-bio.md
│   └── blog-about-page-data.json
├── public/
│   └── media/
├── scripts/
│   ├── generate-blog-about-data.mjs
│   ├── generate-markdown-files.mjs
│   └── load-content.mjs
├── src/
│   ├── components/
│   │   └── ui/
│   ├── content/
│   │   ├── identity.json
│   │   ├── social.json
│   │   ├── experiences/
│   │   ├── frameworks/
│   │   ├── languages/
│   │   ├── projects/
│   │   └── stack/
│   ├── lib/
│   │   └── data.ts
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
└── tsconfig.json
```

### Root Config

- [astro.config.mjs](./astro.config.mjs): Astro config. Site builds as static output.
- [netlify.toml](./netlify.toml): Netlify build command and publish directory.
- [.pages.yml](./.pages.yml): Pages CMS schema and collection config.
- [package.json](./package.json): npm scripts and dependencies.
- [tsconfig.json](./tsconfig.json): TypeScript config for Astro.
- [flake.nix](./flake.nix): Nix development shell.
- [flake.lock](./flake.lock): pinned Nixpkgs revision for reproducible shell.
- [components.json](./components.json): shadcn/ui CLI metadata and aliases.

### Content

Editable resume data lives in [src/content](./src/content).

- [identity.json](./src/content/identity.json): resume identity, description, contact info, location [private]
- [social.json](./src/content/social.json): social usernames [public]
- [experiences](./src/content/experiences): work timeline entries [private]
- [projects](./src/content/projects): project cards and project metadata [private]
- [frameworks](./src/content/frameworks): frameworks shown in stack and project tags [public]
- [languages](./src/content/languages): languages shown in stack and project tags [public]
- [stack](./src/content/stack): tools and desktop/dev environment items [public]

Each collection item is a JSON file. `slug` is stable ID used by other content files.

Note: Framework, language, and stack entries use a nested `technology` object because when using [components](https://pagescms.org/docs/configuration/components/), Pages CMS produces named object fields like `{ "technology": { "name": "React", "slug": "react" } }` instead if a flat `{ "name": "React", "slug": "react" }`.
Astro and [Node loader](./scripts/load-content.mjs) normalize this nested CMS shape back to flat `Technology` objects.

Note: Resume site uses public + private data. Generated content such as Blog's About page, social bios and Github profile use only public data.

### Website Code

- [src/pages/index.astro](./src/pages/index.astro): main resume page.
- [src/components/ui](./src/components/ui): small shadcn-style Astro UI components.
- [src/lib/data.ts](./src/lib/data.ts): loads and sorts JSON content for Astro.
- [src/styles/global.css](./src/styles/global.css): Tailwind import, shadcn CSS tokens, site styling.

### shadcn/ui

This project uses shadcn/ui as a design convention, not as runtime dependency.

[components.json](./components.json) is mostly used as information, but it can be used by shadcn CLI. It tells future shadcn CLI commands where components, aliases, CSS file, CSS variables, and icon library are configured.

React shadcn components are not used but instead local Astro components in [src/components/ui](./src/components/ui), this is simpler for this Astro static page,

### Generated Content

[generated](./generated) contains files derived from source content used outside the resume site, see [Generated Content](#generated-content)

- [generated/github-profile.md](./generated/github-profile.md): generated GitHub profile README
- [generated/github-bio.md](./generated/github-bio.md): short GitHub profile bio
- [generated/twitter-bio.md](./generated/twitter-bio.md): short Twitter profile bio
- [generated/reddit-bio.md](./generated/reddit-bio.md): short Reddit profile bio
- [generated/blog-about-page-data.json](./generated/blog-about-page-data.json): public blog about-page data

Generation scripts live in [scripts](./scripts).

- [load-content.mjs](./scripts/load-content.mjs): Node content loader for [generated content](#generated-content).
- [generate-markdown-files.mjs](./scripts/generate-markdown-files.mjs): writes markdown/profile bio outputs
- [generate-blog-about-data.mjs](./scripts/generate-blog-about-data.mjs): writes blog about-page JSON

### TypeScript And MJS

Website code uses TypeScript because Astro/Vite can type-check it and support helpers like `import.meta.glob`.

Standalone scripts use `.mjs` because they run directly with Node, without TypeScript compile step.

Short version:

- `src/**/*.ts`: Astro website code
- `scripts/**/*.mjs`: plain Node scripts

### Media

[public/media](./public/media) is media folder configured for Pages CMS uploads.

Files in `public/` are served from site root. For example, `public/media/avatar.png` becomes `/media/avatar.png`.
