import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://juanschezmor.dev',
  integrations: [icon(), react()],
  css: {
    global: 'src/styles/global.css',
  },
});
