import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://capsudo.netlify.app", // canonical site URL: public base URL used to generate absolute URLs (canonical links, RSS feeds, sitemap URLs, Open Graph image URLs, and any other absolute metadata).
  output: "static", // static output keeps Netlify setup small: build site, publish dist.
  vite: {
    plugins: [tailwindcss()],
  },
});
