# Resume

Astro resume website backed by JSON content files and editable through Pages CMS.

## Development

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:4321/>.

Build static site:

```bash
npm run build
```

Generate derived files:

```bash
npm run generate:markdown
npm run generate:blog-data
```

## Pages CMS

[.pages.yml](./.pages.yml) is Pages CMS configuration file.

It tells Pages CMS:

- where editable content lives
- which fields each content type has
- how collections are named in CMS UI
- where uploaded media should be stored

Pages CMS reads and writes same JSON files Astro uses to render website.

## Project Structure

```text
.
├── .pages.yml
├── astro.config.mjs
├── package.json
├── generated/
│   ├── bios/
│   ├── blog/
│   └── github-profile/
├── public/
│   └── media/
├── scripts/
│   ├── generate-blog-about-data.mjs
│   ├── generate-markdown-files.mjs
│   └── load-content.mjs
├── src/
│   ├── content/
│   │   ├── identity.json
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
- [.pages.yml](./.pages.yml): Pages CMS schema and collection config.
- [package.json](./package.json): npm scripts and dependencies.
- [tsconfig.json](./tsconfig.json): TypeScript config for Astro.

### Content

Editable resume data lives in [src/content](./src/content).

- [identity.json](./src/content/identity.json): name, description, contact info, location, social usernames
- [experiences](./src/content/experiences): work timeline entries
- [projects](./src/content/projects): project cards and project metadata
- [frameworks](./src/content/frameworks): frameworks shown in stack and project tags
- [languages](./src/content/languages): languages shown in stack and project tags
- [stack](./src/content/stack): tools and desktop/dev environment items

Each collection item is a JSON file. `slug` is stable ID used by other content files.

### Website Code

- [src/pages/index.astro](./src/pages/index.astro): main resume page.
- [src/lib/data.ts](./src/lib/data.ts): loads and sorts JSON content for Astro.
- [src/styles/global.css](./src/styles/global.css): site styling.

### Generated Content

[generated](./generated) contains files derived from source content used outside the resume:

- [generated/github-profile](./generated/github-profile): generated [GitHub profile README](https://github.com/capsudo/capsudo/README.md)
- [generated/bios](./generated/bios): short bio files for social profiles
- [generated/blog](./generated/blog): JSON data for [blog](https://github.com/capsudo/capsudo.github.io) about page

Generation scripts live in [scripts](./scripts).

- [load-content.mjs](./scripts/load-content.mjs): shared Node content loader
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
