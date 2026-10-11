// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://rcen.dev',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap()],
  // Inline CSS so back navigation can never paint an unstyled frame while a stylesheet revalidates
  build: {
    inlineStylesheets: 'always'
  },
  devToolbar: {
    enabled: false
  }
});