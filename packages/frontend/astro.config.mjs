// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";   

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [vue()],   
});