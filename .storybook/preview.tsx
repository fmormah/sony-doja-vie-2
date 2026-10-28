import type { Preview } from "@storybook/react";
import React from "react";
import "../src/theme/global.scss";
import { FONT_VARIABLES } from "../src/theme/fonts";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewport: {
      viewports: {
        small: { name: "Small", styles: { width: "360px", height: "640px" } },
        medium: {
          name: "Medium",
          styles: { width: "768px", height: "1024px" },
        },
        large: { name: "Large", styles: { width: "1200px", height: "800px" } },
      },
      defaultViewport: "responsive",
    },
    docs: { source: { type: "code" } },
    options: {
      storySort: {
        order: ["Atoms", "Molecules", "Organisms", "Templates", "Pages"],
      },
    },
  },
};

export default preview;

export const decorators = [
  (Story: React.ComponentType) => (
    <div className={FONT_VARIABLES}>
      <Story />
    </div>
  ),
];
