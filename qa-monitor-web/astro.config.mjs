// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Mantenemos la integración de React que instalamos antes
  integrations: [react()],
  // Agregamos el nuevo motor de Tailwind v4
  vite: {
    plugins: [tailwindcss()],
  },
});