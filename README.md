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

## Project Structure

```text
.
├── astro.config.mjs
├── package.json
├── public/
│   └── media/
├── src/
│   ├── content/
│   │   ├── identity.json
│   │   ├── experiences/
│   │   ├── frameworks/
│   │   ├── languages/
│   │   ├── projects/
│   │   └── stack/
│   ├── lib/
│   │   └── resume-data.ts
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
└── tsconfig.json
```

### Root Config

- [astro.config.mjs](./astro.config.mjs): Astro config. Site builds as static output.
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
- [src/lib/resume-data.ts](./src/lib/resume-data.ts): loads and sorts JSON content for Astro.
- [src/styles/global.css](./src/styles/global.css): site styling.

### Media

[public/media](./public/media) is media folder configured for Pages CMS uploads.

Files in `public/` are served from site root. For example, `public/media/avatar.png` becomes `/media/avatar.png`.
