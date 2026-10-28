import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

import DiscoBallCanvas from "./DiscoBallCanvas";

const meta: Meta = {
  title: "WebGL/DiscoBall",
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => {
    return (
      <div style={{ height: "600px", width: "100%", position: "relative" }}>
        <DiscoBallCanvas fitContainer />
      </div>
    );
  },
};
