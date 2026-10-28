import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

import DanceFloorScene from "./DanceFloorScene";

const meta: Meta<typeof DanceFloorScene> = {
  title: "Molecules/DanceFloorScene",
  component: DanceFloorScene,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof DanceFloorScene>;

export const Default: Story = {
  args: {
    hotspots: [
      {
        x: 20,
        y: 30,
        label: "DJ Booth",
        size: "large",
        onClick: () => console.log("DJ Booth clicked"),
      },
      {
        x: 50,
        y: 50,
        label: "Dance Floor Center",
        size: "medium",
        onClick: () => console.log("Dance Floor Center clicked"),
      },
      {
        x: 75,
        y: 40,
        label: "VIP Area",
        size: "medium",
        onClick: () => console.log("VIP Area clicked"),
      },
      {
        x: 30,
        y: 70,
        label: "Bar",
        size: "small",
        onClick: () => console.log("Bar clicked"),
      },
      {
        x: 60,
        y: 80,
        label: "Lounge",
        size: "medium",
        onClick: () => console.log("Lounge clicked"),
      },
    ],
  },
};

export const NoHotspots: Story = {
  args: {
    hotspots: [],
  },
};

export const InteractiveHotspots: Story = {
  render: () => {
    const [lastClicked, setLastClicked] = React.useState<string>("");

    const hotspots = [
      {
        x: 25,
        y: 25,
        label: "Stage Left",
        size: "large" as const,
      },
      {
        x: 75,
        y: 25,
        label: "Stage Right",
        size: "large" as const,
      },
      {
        x: 50,
        y: 50,
        label: "Center Stage",
        size: "large" as const,
      },
      {
        x: 20,
        y: 75,
        label: "Front Left",
        size: "medium" as const,
      },
      {
        x: 80,
        y: 75,
        label: "Front Right",
        size: "medium" as const,
      },
    ];

    return (
      <div style={{ height: "100vh", position: "relative" }}>
        <DanceFloorScene
          hotspots={hotspots}
          onHotspotClick={(index, hotspot) => {
            setLastClicked(hotspot.label || `Hotspot ${index}`);
          }}
        />
        {lastClicked && (
          <div
            style={{
              position: "fixed",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              zIndex: 100,
              fontFamily: "sans-serif",
            }}
          >
            Clicked: {lastClicked}
          </div>
        )}
      </div>
    );
  },
};

export const CustomImage: Story = {
  args: {
    imageSrc:
      "https://via.placeholder.com/2000x1500/4a5568/ffffff?text=Custom+Dance+Floor",
    imageAlt: "Custom dance floor",
    hotspots: [
      {
        x: 50,
        y: 50,
        label: "Center",
        size: "large",
      },
    ],
  },
};
