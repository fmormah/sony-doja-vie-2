import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import TourTemplate from "./TourTemplate";

const meta: Meta<typeof TourTemplate> = {
  title: "Molecules/ContentPopup/Templates/TourTemplate",
  component: TourTemplate,
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

type Story = StoryObj<typeof TourTemplate>;

export const Default: Story = { args: {} };
