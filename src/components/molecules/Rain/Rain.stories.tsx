import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import Rain from "./Rain";

const meta: Meta<typeof Rain> = {
  title: "Molecules/Rain",
  component: Rain,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          background: "#555",
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        <style>{`
          .drop {
            background: -webkit-gradient(
              linear,
              0% 0%,
              0% 100%,
              from(rgb(128 128 128)),
              to(rgb(255 255 255 / 60%))
            ) !important;
            background: linear-gradient(
              to bottom,
              rgb(128 128 128) 0%,
              rgb(255 255 255 / 60%) 100%
            ) !important;
          }
        `}</style>
        <Story />
      </div>
    ),
  ],
  args: {
    rainIntensity: 0.33,
    angleDeg: 0,
  },
  argTypes: {
    rainIntensity: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
    },
    angleDeg: {
      control: { type: "range", min: -60, max: 60, step: 1 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Rain>;

export const Default: Story = {
  args: {},
};
