import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

import Canvas from "@/lib/webgl/Canvas";
import CubeScene from "@/lib/webgl/Scenes/CubeScene";

const meta: Meta = {
  title: "WebGL/Canvas",
};

export default meta;

type Story = StoryObj;

export const FitContainer: Story = {
  render: () => {
    const scene = new CubeScene();
    return (
      <div
        style={{
          height: "400px",
          width: "100%",
          position: "relative",
          outline: "1px solid #333",
        }}
      >
        <Canvas scene={scene} fitContainer />
      </div>
    );
  },
};
