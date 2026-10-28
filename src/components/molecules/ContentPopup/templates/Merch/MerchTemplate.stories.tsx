import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import MerchTemplate from "./MerchTemplate";

const meta: Meta<typeof MerchTemplate> = {
  title: "Molecules/ContentPopup/Templates/MerchTemplate",
  component: MerchTemplate,
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

type Story = StoryObj<typeof MerchTemplate>;

export const Default: Story = { args: {} };
