import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import svgr from "vite-plugin-svgr";
export default defineConfig({
  plugins: [
    svgr({ svgrOptions: { icon: true } }),
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
  server: { host: "127.0.0.1", port: 3000 },
});
