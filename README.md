# Astro Pages CMS Resume

Astro resume website using content editable through [Pages CMS](https://pagescms.org).  
Also updates [social-bios](./generated/social-bios.md), [GitHub "profile"](https://github.com/capsudo/capsudo/blob/main/README.md) and [astro-pagescms-blog](https://github.com/capsudo/astro-pagescms-blog)'s About page.

## Getting started

### Fork and clone

> This is required in order to connect Pages CMS to the repo later, repo needs to live inside your github account.

**Fork and clone using GitHub CLI:**

```bash
gh repo fork capsudo/astro-pagescms-resume --clone --remote=true
cd astro-pagescms-resume
```

<details>
<summary><strong>Fork and clone manually:</strong></summary>

<p>
  <a href="https://github.com/capsudo/astro-pagescms-resume/fork">
    <img src="https://img.shields.io/badge/Fork_this_repo-181717?logo=github&logoColor=white" alt="Fork this repo">
  </a>
</p>

Then:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/astro-pagescms-resume
git remote add upstream https://github.com/capsudo/astro-pagescms-resume
cd astro-pagescms-resume
```

</details>

### Install required tooling

**Using Nix shell:**

```bash
nix develop
```

The Nix shell provides Node, npm, Git, GitHub CLI, and Netlify CLI.

_Nix needs to be installed, see [Install Nix](https://nix.dev/install-nix.html)_

<details>
<summary><strong>Not using Nix shell:</strong></summary>

If Nix is not used, Node, npm, Git, Netlify CLI and GitHub CLI (optional) need to be installed.

1. [Install Node and npm using nvm](https://nodejs.org/en/download)

2. [Instal Git](https://git-scm.com/install/)

3. Install Netlify CLI

   ```bash
   npm install netlify-cli -g
   ```

4. [Install GitHub CLI](https://github.com/cli/cli?ref_product=cli&ref_type=engagement&ref_style=text#installation) (optional)

</details>

### Link Netlify site

This site is deployed via Netlify as a static Astro site.

**Link this local repository to a Netlify site:**

```bash
npm run netlify:login
npm run netlify:link
```
_Netlify CLI is provided by the [Nix shell](./flake.nix), if not used it needs to be installed globally with npm._

> netlify:link can create a new site or connect to an existing one, set up continuous deployment from GitHub, and write local Netlify state under `.netlify/`.  
> Use defaults when asked since [netlify.toml](./netlify.toml) already tells Netlify how to build the site.

### Setup Pages CMS

Page CMS is the "UI admin page" where the content can be updated.

1. Go to <https://app.pagescms.org>
2. Click cog icon "Manage Github App" then give access to this repo.
3. Select `astro-pagescms-resume` under your GitHub account.
4. It should open Pages CMS admin (<https://app.pagescms.org/YOUR_GITHUB_USERNAME/astro-pagescms-resume/master>)

You can now update content: change name (identity), add projects you worked on, etc...

### GitHub App Sync Setup (optional)

This repo contains a workflow that pushes [generated content](#generated-content) to required repos. It uses GitHub App token instead of personal access token. To get this token a GitHub App needs to be installed.

**Create required repos**

1. Create repo named `YOUR_GITHUB_USERNAME` (ie. repo URL = `https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME`).  

2. Create repo named `YOUR_GITHUB_USERNAME.github.io` (ie. repo URL = `https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io`).

**Create the GitHub App**

1. Go to <https://github.com/settings/apps/new>.
2. Name it something like `astro-pagescms-resume-allow-push`. Homepage URL = `https://github.com/YOUR_GITHUB_USERNAME/astro-pagescms-resume`
3. Disable webhook if GitHub allows it (uncheck Active), or leave webhook URL empty if not needed.
4. Set repository permission **Contents** to **Read and write**.
5. Keep default **Metadata** read permission.
6. Click "Create Github App"
7. Generate a private key and download the `.pem` file.
8. Scroll up to the top of the [page](https://github.com/settings/apps/astro-pagescms-resume-allow-push) and copy the App `Client ID`.

**Install the GitHub App**

1. Click "Install the app" (left menu on the top)
2. Chose current user
3. Chose "Only select repositories" and select those repositories:
   - `YOUR_GITHUB_USERNAME/astro-pagescms-resume`
   - `YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME`
   - `YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io`
4. Click Install.

**Add repository variables and secrets**

1. Go to [`Settings > Secrets and variables > Actions`](../../settings/secrets/actions)
2. In "Secrets" tab click "Add repository secret" `APP_PRIVATE_KEY` with full `.pem` private key content.
3. Select "Variables" tab then click "Add repository variable" `APP_CLIENT_ID` with GitHub App client ID.

> Using GitHub App token instead of personal access token lets one app push generated files to selected repos with narrow permissions.

## Generated Content (optional)

This repo also produces markdown files and data generated from the Pages CMS content. 
This allows to quickly update in one go all your public info.

### Markdown files

- Short bios for social profiles  
   => open [social-bios](./generated/social-bios.md) and copy-paste blocks to Github, Twitter and Reddit profiles

- Long bio visible on top of [your Github user page](../)  
   => [github-profile](./generated/github-profile.md) is pushed automatically to [GitHub "profile README"](https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME/blob/main/README.md)

   > Repo named YOUR_GITHUB_USERNAME must be setup, (ie. repo URL = `https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME`).  
   See [GitHub profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme).

### JSON Data

- [astro-pagescms-blog](../astro-pagescms-blog)'s About page content  
   => [blog-about-page-data.json](./generated/blog-about-page-data.json) pushed automatically to [GitHub Pages user site repo](https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io/blob/master/src/data/about-page-data.json).

   > Blog must be setup as a [GitHub Pages user site](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), (ie. repo URL = `https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io`).  
   See [astro-pagescms-blog's doc](https://github.com/capsudo/astro-pagescms-blog#github-page-user-site).

### Content generation

Those files can be generated locally (see [Development](#development)).
They are also built automatically and pushed to respective repos by the GitHub workflow [workflow.yml](.github/workflows/workflow.yml).

This workflow:

1. Generates markdown files.
2. Generates blog about-page JSON.
3. Uploads all generated files as workflow artifact named `generated-content`.
4. Pushes [generated/github-profile.md](./generated/github-profile.md) to repo `YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME` as `README.md`.
5. Pushes [generated/blog-about-page-data.json](./generated/blog-about-page-data.json) to repo `YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io` as `src/data/about-page-data.json`.

> Generated files are visible/downloadable from the [workflow run page](../../actions/workflows/workflow.yml).

## How it works

Pages CMS reads and writes same JSON files Astro uses to render website.

It uses [.pages.yml](./.pages.yml) to:
- derive the collections and fields to display: content.name/label/fields
- find/load the data (editable content): content.type/path/format
- where uploaded media should be stored: media.output

Each update on Page CMS produces a commit that modifies the JSON data. This itself triggers:
- Netlify deploy
- GitHub workflow that produces and syncs generated content

Deploys are handled by Netlify CI/CD from GitHub. This means that website is published everytime a commit is pushed to the production branch.

## Troubleshooting

### Check Netlify deploys

Netlify deploys are visible at <https://app.netlify.com/projects/astro-pagescms-resume/deploys>.

### Check Github workflow

Github workflows are visible at [astro-pagescms-resume/actions](../../actions).

### Set Netlify production branch

> This repo uses `master` as production branch, if Netlify defaults to `main`, change **Production branch** to `master`.  
> This is configured under [#branches-and-deploy-contexts](https://app.netlify.com/projects/astro-pagescms-resume/configuration/deploys#branches-and-deploy-contexts).

### Set GitHub Workflow Scope

This repo contains GitHub Actions workflow files under [.github/workflows](./.github/workflows).

If using git through GitHub authentication, GitHub will reject pushes that create or update workflow files unless current GitHub auth token has `workflow` scope. If push fails with message like `refusing to allow an OAuth App to create or update workflow`, you need to refresh auth. 

**Refresh auth:**

```bash
npm run github:scope
```

_`gh` is provided by the [Nix shell](./flake.nix), if not used it needs to be installed globally._

> No need to `gh login` again.

## Local Development

You can run the site locally but it's not of much use since you can't connect Pages CMS to it.

**Run local server:**

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:4321/>.

**Build static site:**

```bash
npm run build
```

**Build [Generated Content](#generated-content):**

```bash
npm run generate:markdown
npm run generate:blog-data
```

## Deployment

### Set production URL

Site name, production URL, deploy hooks, and connected Git repository are configured in Netlify admin, not in `netlify.toml`.

```bash
npm run netlify:admin
```

> All of this is already configured by `npm run netlify:link`. This is only to update it later.

### Privacy

Deployed resume site uses shareable + personal data.  
Generated content such as Blog's About page, social bios and Github profile use only shareable data.

> Beware that if you make this repo public your personal data will be exposed since the content lives here.

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
│   ├── social-bios.md
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
│   │   ├── bio.json
│   │   ├── identity.json
│   │   ├── socials.json
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

- [identity.json](./src/content/identity.json): resume identity, contact info, location [personal]
- [bio.json](./src/content/bio.json): public headline, descriptions, and avatar [shareable]
- [socials.json](./src/content/socials.json): social account usernames and display names [shareable]
- [experiences](./src/content/experiences): work timeline entries [personal]
- [projects](./src/content/projects): project cards and project metadata [personal]
- [frameworks](./src/content/frameworks): frameworks shown in stack and project tags [shareable]
- [languages](./src/content/languages): languages shown in stack and project tags [shareable]
- [stack](./src/content/stack): tools and desktop/dev environment items [shareable]

Each collection item is a JSON file. `slug` is stable ID used by other content files.

>Framework, language, and stack entries use a nested `technology` object because when using [components](https://pagescms.org/docs/configuration/components/), Pages CMS produces named object fields like `{ "technology": { "name": "React", "slug": "react" } }` instead if a flat `{ "name": "React", "slug": "react" }`.  
> Astro and [Node loader](./scripts/load-content.mjs) normalize this nested CMS shape back to flat `Technology` objects.

### Website Code

- [src/pages/index.astro](./src/pages/index.astro): main resume page.
- [src/components/ui](./src/components/ui): small shadcn-style Astro UI components.
- [src/lib/data.ts](./src/lib/data.ts): loads and sorts JSON content for Astro.
- [src/styles/global.css](./src/styles/global.css): Tailwind import, shadcn CSS tokens, site styling.

### shadcn/ui

This project uses shadcn/ui as a design convention, not as runtime dependency.

> [components.json](./components.json) is mostly used as information, but it can be used by shadcn CLI. It tells future shadcn CLI commands where components, aliases, CSS file, CSS variables, and icon library are configured.

Local Astro components (in [src/components/ui](./src/components/ui)) are used instead of React shadcn components, this is simpler for this Astro static page.

### Generated Content

[generated/](./generated) contains files derived from source content used outside the resume site, see [Generated Content](#generated-content).

- [generated/github-profile.md](./generated/github-profile.md): generated GitHub profile README
- [generated/social-bios.md](./generated/social-bios.md): copy-paste social profile bios
- [generated/blog-about-page-data.json](./generated/blog-about-page-data.json): public blog's About page data

Generation scripts live in [scripts](./scripts).

- [load-content.mjs](./scripts/load-content.mjs): Node content loader for [generated content](#generated-content).
- [generate-markdown-files.mjs](./scripts/generate-markdown-files.mjs): writes markdown/profile bio outputs
- [generate-blog-about-data.mjs](./scripts/generate-blog-about-data.mjs): writes blog about-page JSON

### TypeScript and MJS

Website code uses TypeScript because Astro/Vite can type-check it and support helpers like `import.meta.glob`.

Standalone scripts use `.mjs` because they run directly with Node, without TypeScript compile step.

Short version:

- `src/**/*.ts`: Astro website code
- `scripts/**/*.mjs`: plain Node scripts

### Media

[public/media](./public/media) is media folder configured for Pages CMS uploads.

Files in `public/` are served from site root. For example, `public/media/avatar.png` becomes `/media/avatar.png`.
