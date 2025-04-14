// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],

  },
  env: {
    schema: {
      VITE_SITEKEY: envField.string({context: 'client', access: 'public'}),
      VITE_API_URL: envField.string({context: 'client', access: 'public'}),
      VITE_PAGE_URL: envField.string({context: 'client', access: 'public'}),
      VITE_TITLE: envField.string({context: 'client', access: 'public'}),
    }
  },
  integrations: [vue()],
});