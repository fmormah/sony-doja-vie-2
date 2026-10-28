import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-onboarding",
    "@storybook/addon-vitest",
  ],
  docs: { autodocs: "tag" },
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: [{ from: "../public", to: "/" }],
  viteFinal: async (config: import("vite").UserConfig) => {
    config.resolve = config.resolve ?? {};
    const replacement = path.resolve(process.cwd(), "src");

    if (Array.isArray(config.resolve.alias)) {
      config.resolve.alias.push({ find: "@", replacement });
    } else {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@": replacement,
      };
    }

    // Allow accessing Storybook via alternate hostnames, e.g. local.me
    config.server = config.server ?? {};
    // Bind to all interfaces so custom hosts resolve
    config.server.host = config.server.host ?? true;

    const allowed = new Set<string>(["local.me", "localhost", "127.0.0.1"]);
    if (config.server.allowedHosts === true) {
      // already fully open
    } else if (Array.isArray(config.server.allowedHosts)) {
      config.server.allowedHosts = Array.from(
        new Set([...(config.server.allowedHosts as string[]), ...allowed]),
      );
    } else {
      config.server.allowedHosts = Array.from(allowed);
    }

    return config;
  },
};

export default config;
