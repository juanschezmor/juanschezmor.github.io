import { defineConfig } from "astro/config";
import icon from "astro-icon";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://juanschezmor.github.io", 
  integrations: [icon(), react()],
  output: "static", 
});
