import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import HighwayLoadingScene from "./HighwayLoadingScene";

const meta: Meta<typeof HighwayLoadingScene> = {
  title: "Molecules/HighwayLoadingScene",
  component: HighwayLoadingScene,
  tags: ["autodocs"],
  args: {
    height: "100vh",
    streakCount: 4,
    baseColor: "#E41E26",
    blurFadeAlpha: 0.02,
    streakLengthPercent: 10,
    verticalSpreadPercent: 25,
    horizontalSpawnRangePercent: 100,
    onLoadComplete: () => alert("Highway assets loaded. Let's ride…"),
  },
  argTypes: {
    height: { control: "text" },
    streakCount: { control: { type: "range", min: 1, max: 10 } },
    baseColor: { control: "color" },
    blurFadeAlpha: {
      control: { type: "range", min: 0.02, max: 0.3, step: 0.01 },
    },
    streakLengthPercent: {
      control: { type: "range", min: 10, max: 90, step: 5 },
    },
    verticalSpreadPercent: {
      control: { type: "range", min: 5, max: 100, step: 1 },
      description: "Percent of canvas height used for lanes (centered)",
    },
    horizontalSpawnRangePercent: {
      control: { type: "range", min: 10, max: 300, step: 5 },
      description:
        "Percent of canvas width for randomised spawn range (larger = wider gaps)",
    },
    speedMin: { control: { type: "range", min: 4, max: 30, step: 1 } },
    speedVar: { control: { type: "range", min: 4, max: 30, step: 1 } },
    onLoadComplete: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof HighwayLoadingScene>;

export const Default: Story = {
  args: {},
};
