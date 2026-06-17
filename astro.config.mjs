import { defineConfig } from "astro/config";

// Static output keeps Netlify setup small: build site, publish dist.
export default defineConfig({
  output: "static",
});
