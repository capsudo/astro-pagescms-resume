import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static output keeps Netlify setup small: build site, publish dist.
export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
