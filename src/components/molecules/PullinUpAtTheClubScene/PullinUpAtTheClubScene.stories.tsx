import type { Meta, StoryObj } from "@storybook/nextjs";

import PullinUpAtTheClubScene from ".";

const meta: Meta<typeof PullinUpAtTheClubScene> = {
  title: "Molecules/PullinUpAtTheClubScene",
  component: PullinUpAtTheClubScene,
  tags: ["autodocs"],
  args: {
    sceneImageSrc: "/assets/images/scene/DoorScene/pullinUpAtTheClub.webp",
    carImageSrc: "/assets/images/scene/DoorScene/car.webp",
    revealDelay: 0,
    revealDuration: 800,
    zoomDelay: 300,
    zoomDuration: 900,
    zoomScale: 1.08,
    carDelay: 300,
    carDuration: 900,
    text1Delay: 400,
    text2Delay: 1400,
    textFadeDuration: 600,
    carStartXPercent: -150,
    carStartYPercent: -20,
    carEndXPercent: -35,
    carEndYPercent: -20,
    fogThickness: 0.1,
    rainIntensity: 0.33,
  },
  argTypes: {
    zoomScale: { control: { type: "range", min: 1, max: 2, step: 0.01 } },
    revealDelay: {
      control: { type: "range", min: -1000, max: 2000, step: 50 },
    },
    zoomDelay: { control: { type: "range", min: -1000, max: 2000, step: 50 } },
    carDelay: { control: { type: "range", min: -1000, max: 2000, step: 50 } },
    text1Delay: { control: { type: "range", min: -1000, max: 2000, step: 50 } },
    text2Delay: { control: { type: "range", min: -1000, max: 3000, step: 50 } },
    revealDuration: {
      control: { type: "range", min: 200, max: 2000, step: 50 },
    },
    zoomDuration: { control: { type: "range", min: 200, max: 2000, step: 50 } },
    carDuration: { control: { type: "range", min: 200, max: 2000, step: 50 } },
    textFadeDuration: {
      control: { type: "range", min: 200, max: 2000, step: 50 },
    },
    carStartXPercent: {
      control: { type: "range", min: -50, max: 100, step: 1 },
    },
    carStartYPercent: {
      control: { type: "range", min: -50, max: 100, step: 1 },
    },
    carEndXPercent: { control: { type: "range", min: -50, max: 100, step: 1 } },
    carEndYPercent: { control: { type: "range", min: -50, max: 100, step: 1 } },
    nowOverride: { control: "text" },
    fogThickness: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    rainIntensity: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    denyIfSuperfan: { control: { type: "boolean" } },
    isSuperfan: { control: { type: "boolean" } },
    gatingMode: {
      control: {
        type: "select",
        options: ["releaseDate", "superfan"],
      },
    },
    authProvider: {
      control: {
        type: "select",
        options: ["spotify", "apple"],
      },
    },
    bypassAllRequirements: { control: { type: "boolean" } },
  },
};

export default meta;

type Story = StoryObj<typeof PullinUpAtTheClubScene>;

export const Default: Story = {
  args: {},
};

export const AfterRelease: Story = {
  args: {
    nowOverride: "2025-10-01T00:00:00Z",
    pressDurationMs: 1600,
    resetDurationMs: 400,
    onPrimaryClick: () => alert("Primary click fired!"),
  },
};

export const SuperfanGated_SpotifySuperfan: Story = {
  args: {
    gatingMode: "superfan",
    authProvider: "spotify",
    isSuperfan: true,
  },
};

export const SuperfanGated_SpotifyRegular: Story = {
  args: {
    gatingMode: "superfan",
    authProvider: "spotify",
    isSuperfan: false,
  },
};

export const SuperfanGated_Apple: Story = {
  args: {
    gatingMode: "superfan",
    authProvider: "apple",
  },
};
