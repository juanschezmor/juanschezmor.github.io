import { defineConfig } from 'astro/config';
import icon from 'logo';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://juanschezmor.github.io',
  integrations: [icon(), react()],
  css: {
    global: 'src/styles/global.css',
  },
});
