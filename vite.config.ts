import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const chunkGroups = {
  react: ["react", "react-dom", "react-router-dom"],
  i18n: ["i18next", "react-i18next"],
  motion: ["framer-motion", "react-intersection-observer"],
  icons: ["react-icons", "@fortawesome/fontawesome-free"],
};

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const [chunkName, packages] of Object.entries(chunkGroups)) {
            if (packages.some((packageName) => id.includes(`/node_modules/${packageName}/`))) {
              return chunkName;
            }
          }

          return undefined;
        },
      },
    },
  },
});
