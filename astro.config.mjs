// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import clerk from '@clerk/astro';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.dossierpret.fr',
  output: 'server',
  security: { checkOrigin: false },
  adapter: node({ mode: 'standalone' }),
  integrations: [
    clerk(),
    svelte(),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
