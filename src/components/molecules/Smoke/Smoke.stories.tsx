import { Canvas } from "@react-three/fiber";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import Smoke from "./Smoke";

const meta: Meta<typeof Smoke> = {
  title: "Molecules/Smoke",
  component: Smoke,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Canvas style={{ background: "#000", height: "100vh" }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[-1, 0, 1]} intensity={0.9} />
        <Story />
      </Canvas>
    ),
  ],
  args: {
    fogThickness: 0.08,
  },
  argTypes: {
    fogThickness: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Smoke>;

export const Default: Story = {
  args: {},
};
