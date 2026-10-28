import type { Meta, StoryObj } from "@storybook/nextjs";

import Hotspot from "./Hotspot";

const meta: Meta<typeof Hotspot> = {
  title: "Atoms/Hotspot",
  component: Hotspot,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "600px",
          height: "400px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Hotspot>;

export const Default: Story = {
  args: {
    x: 50,
    y: 50,
    label: "Click me",
    size: "medium",
  },
};

export const Small: Story = {
  args: {
    x: 50,
    y: 50,
    label: "Small hotspot",
    size: "small",
  },
};

export const Large: Story = {
  args: {
    x: 50,
    y: 50,
    label: "Large hotspot",
    size: "large",
  },
};

export const NoLabel: Story = {
  args: {
    x: 50,
    y: 50,
    size: "medium",
  },
};

export const MultipleHotspots: Story = {
  render: () => (
    <>
      <Hotspot x={25} y={25} label="Top Left" size="small" />
      <Hotspot x={75} y={25} label="Top Right" size="small" />
      <Hotspot x={50} y={50} label="Center" size="large" />
      <Hotspot x={25} y={75} label="Bottom Left" size="small" />
      <Hotspot x={75} y={75} label="Bottom Right" size="small" />
    </>
  ),
};

export const Interactive: Story = {
  args: {
    x: 50,
    y: 50,
    label: "Interactive",
    size: "medium",
    onClick: () => alert("Hotspot clicked!"),
  },
};
