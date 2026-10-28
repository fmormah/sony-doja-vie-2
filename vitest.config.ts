import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { resolve } from "path";

function ignoreAssets() {
  const RE = /\.(css|s[ac]ss|less|styl|png|jpe?g|gif|svg|mp3|mp4)$/i;
  return {
    name: "ignore-assets",
    enforce: "pre" as const,
    resolveId(id: string) {
      return RE.test(id) ? id : null;
    },
    load(id: string) {
      return RE.test(id) ? "export default {}" : null;
    },
  };
}

export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },

  css: { postcss: { plugins: [] } },

  plugins: [react(), ignoreAssets()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./.storybook/vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", "out", "reference-projects/**"],

    // Browser mode can be enabled explicitly via CLI if needed
    browser: {
      enabled: false,
      headless: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
      screenshotFailures: false,
    },
  },
});
