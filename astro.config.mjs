import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Every <loc> in the sitemap is built from this, and @astrojs/sitemap will
  // not run without it. It is also what makes canonical URLs absolute.
  site: 'https://svanschooten.nl',

  integrations: [
    // src/pages/clusterflooding.astro mounts a .vue island with client:only.
    vue(),
    sitemap({
      // A 404 page is generated like any other route, so it would otherwise
      // be listed as a real page for crawlers to index.
      filter: (page) => !page.endsWith('/404/') && !page.endsWith('/404.html'),
    }),
  ],
});
