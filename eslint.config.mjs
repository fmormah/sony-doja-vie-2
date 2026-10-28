import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginStorybook from "eslint-plugin-storybook";
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  ...eslintPluginStorybook.configs["flat/recommended"],
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
];
