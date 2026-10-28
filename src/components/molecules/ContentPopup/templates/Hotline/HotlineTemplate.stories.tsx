import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import HotlineTemplate from "./HotlineTemplate";

const meta: Meta<typeof HotlineTemplate> = {
  title: "Molecules/ContentPopup/Templates/HotlineTemplate",
  component: HotlineTemplate,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "90vh",
          padding: 0,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof HotlineTemplate>;

export const Default: Story = { args: {} };
