import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

import Canvas from "@/lib/webgl/Canvas";
import CubeScene from "@/lib/webgl/Scenes/CubeScene";

const meta: Meta = {
  title: "WebGL/Cube",
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const scene = new CubeScene();
    return (
      <div style={{ height: "600px", width: "100%", position: "relative" }}>
        <Canvas scene={scene} fitContainer />
      </div>
    );
  },
};
