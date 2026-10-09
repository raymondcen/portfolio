// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://rcen.dev',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap(), icon()],
  // Inline CSS so back navigation can never paint an unstyled frame while a stylesheet revalidates
  build: {
    inlineStylesheets: 'always'
  },
  devToolbar: {
    enabled: false
  }
});