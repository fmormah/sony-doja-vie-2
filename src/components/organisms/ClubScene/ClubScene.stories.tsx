import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

import ClubScene from "./ClubScene";

const meta: Meta<typeof ClubScene> = {
  title: "Organisms/ClubScene",
  component: ClubScene,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof ClubScene>;

export const Default: Story = {
  args: {
    hotspots: [
      {
        x: 20,
        y: 30,
        label: "DJ Booth", // Click to toggle disco ball zoom
        size: "large",
      },
      {
        x: 50,
        y: 50,
        label: "Dance Floor Center",
        size: "medium",
      },
      {
        x: 75,
        y: 40,
        label: "VIP Area",
        size: "medium",
      },
      {
        x: 30,
        y: 70,
        label: "Bar",
        size: "small",
      },
    ],
    discoBallPosition: { x: -0.4, y: 4.2, z: -3 }, // Centered horizontally
    discoBallRotation: { x: 0.71, y: 0, z: 0 },
    discoBallZoom: 7.9,
    smokeDensity: 2.0,
    smokeSpeed: 0.1,
    smokeOpacity: 0.35,
    smokeColor: { r: 0.5, g: 0.5, b: 0.6 },
  },
};

export const DiscoBallToggleDemo: Story = {
  args: {
    hotspots: [
      {
        x: 20,
        y: 30,
        label: "DJ Booth", // Click to toggle disco ball zoom
        size: "large",
      },
      {
        x: 50,
        y: 50,
        label: "Dance Floor",
        size: "medium",
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click the DJ Booth hotspot to toggle between default and zoomed disco ball states. When zoomed, the dance floor and other elements fade out.",
      },
    },
  },
};

export const WithControls: Story = {
  argTypes: {
    posX: { control: { type: "range", min: -9, max: 9, step: 0.1 } },
    posY: { control: { type: "range", min: -6, max: 9, step: 0.1 } },
    posZ: { control: { type: "range", min: -9, max: 9, step: 0.1 } },
    rotX: { control: { type: "range", min: 0, max: 6.28, step: 0.01 } },
    rotY: { control: { type: "range", min: 0, max: 6.28, step: 0.01 } },
    rotZ: { control: { type: "range", min: 0, max: 6.28, step: 0.01 } },
    zoom: { control: { type: "range", min: 2, max: 10, step: 0.1 } },
    smokeDensity: { control: { type: "range", min: 0.5, max: 5, step: 0.1 } },
    smokeSpeed: { control: { type: "range", min: 0.01, max: 0.5, step: 0.01 } },
    smokeOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
  },
  args: {
    posX: 0,
    posY: 4.2,
    posZ: -3,
    rotX: 0.71,
    rotY: 0,
    rotZ: 0,
    zoom: 7.9,
    smokeDensity: 2.0,
    smokeSpeed: 0.1,
    smokeOpacity: 0.35,
  },
  render: (args) => {
    return (
      <ClubScene
        hotspots={[
          { x: 20, y: 30, label: "DJ Booth", size: "large" },
          { x: 50, y: 50, label: "Dance Floor", size: "medium" },
          { x: 75, y: 40, label: "VIP Area", size: "medium" },
        ]}
        discoBallPosition={{
          x: args.posX as number,
          y: args.posY as number,
          z: args.posZ as number,
        }}
        discoBallRotation={{
          x: args.rotX as number,
          y: args.rotY as number,
          z: args.rotZ as number,
        }}
        discoBallZoom={args.zoom as number}
        smokeDensity={args.smokeDensity as number}
        smokeSpeed={args.smokeSpeed as number}
        smokeOpacity={args.smokeOpacity as number}
      />
    );
  },
};

export const HeavyAtmosphere: Story = {
  args: {
    hotspots: [
      {
        x: 25,
        y: 25,
        label: "Stage Left",
        size: "large",
      },
      {
        x: 75,
        y: 25,
        label: "Stage Right",
        size: "large",
      },
      {
        x: 50,
        y: 50,
        label: "Center Stage",
        size: "large",
      },
    ],
    discoBallPosition: { x: 0, y: 1.2, z: -0.5 },
    discoBallRotation: { x: 0, y: 0, z: 0 },
    discoBallZoom: 6,
    smokeDensity: 3.5,
    smokeSpeed: 0.05,
    smokeOpacity: 0.5,
    smokeColor: { r: 0.4, g: 0.4, b: 0.5 },
  },
};

export const InteractiveClub: Story = {
  render: function InteractiveStory() {
    const [discoBallPosition, setDiscoBallPosition] = React.useState({
      x: 0,
      y: 0.9,
      z: 0,
    });
    const [discoBallRotation, setDiscoBallRotation] = React.useState({
      x: 0,
      y: 0,
      z: 0,
    });
    const [discoBallZoom, setDiscoBallZoom] = React.useState(5);
    const [smokeDensity, setSmokeDensity] = React.useState(2.0);
    const [smokeSpeed, setSmokeSpeed] = React.useState(0.1);
    const [smokeOpacity, setSmokeOpacity] = React.useState(0.3);
    const [autoRotate, setAutoRotate] = React.useState(true);

    // Auto-rotate disco ball if enabled
    React.useEffect(() => {
      if (!autoRotate) return;

      const interval = setInterval(() => {
        setDiscoBallRotation((prev) => ({
          ...prev,
          y: (prev.y + 0.02) % (Math.PI * 2),
        }));
      }, 50);

      return () => clearInterval(interval);
    }, [autoRotate]);

    const hotspots = [
      { x: 20, y: 30, label: "DJ Booth", size: "large" as const },
      { x: 50, y: 50, label: "Dance Floor", size: "medium" as const },
      { x: 75, y: 40, label: "VIP Area", size: "medium" as const },
      { x: 30, y: 70, label: "Bar", size: "small" as const },
      { x: 60, y: 80, label: "Lounge", size: "medium" as const },
    ];

    return (
      <>
        <ClubScene
          hotspots={hotspots}
          discoBallPosition={discoBallPosition}
          discoBallRotation={discoBallRotation}
          discoBallZoom={discoBallZoom}
          smokeDensity={smokeDensity}
          smokeSpeed={smokeSpeed}
          smokeOpacity={smokeOpacity}
          smokeColor={{ r: 0.5, g: 0.5, b: 0.6 }}
          onHotspotClick={(index, hotspot) => {
            console.log(`Clicked: ${hotspot.label || `Hotspot ${index}`}`);
          }}
        />

        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            width: 320,
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            padding: 20,
            background: "rgba(0, 0, 0, 0.9)",
            borderRadius: 8,
            color: "white",
            fontFamily: "sans-serif",
            fontSize: 14,
            zIndex: 100,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Club Controls</h3>

          <label
            style={{ display: "flex", alignItems: "center", marginBottom: 15 }}
          >
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              style={{ marginRight: 10 }}
            />
            Auto-rotate Disco Ball
          </label>

          <h4 style={{ marginTop: 10, marginBottom: 10 }}>
            Disco Ball Position
          </h4>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              X: {discoBallPosition.x.toFixed(2)}
              <input
                type="range"
                min="-9"
                max="9"
                step="0.1"
                value={discoBallPosition.x}
                onChange={(e) =>
                  setDiscoBallPosition({
                    ...discoBallPosition,
                    x: parseFloat(e.target.value),
                  })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Y: {discoBallPosition.y.toFixed(2)}
              <input
                type="range"
                min="-6"
                max="9"
                step="0.1"
                value={discoBallPosition.y}
                onChange={(e) =>
                  setDiscoBallPosition({
                    ...discoBallPosition,
                    y: parseFloat(e.target.value),
                  })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Z: {discoBallPosition.z.toFixed(2)}
              <input
                type="range"
                min="-9"
                max="9"
                step="0.1"
                value={discoBallPosition.z}
                onChange={(e) =>
                  setDiscoBallPosition({
                    ...discoBallPosition,
                    z: parseFloat(e.target.value),
                  })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>

          {!autoRotate && (
            <>
              <h4 style={{ marginTop: 10, marginBottom: 10 }}>
                Disco Ball Rotation
              </h4>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 5 }}>
                  X: {discoBallRotation.x.toFixed(2)}
                  <input
                    type="range"
                    min="0"
                    max="6.28"
                    step="0.1"
                    value={discoBallRotation.x}
                    onChange={(e) =>
                      setDiscoBallRotation({
                        ...discoBallRotation,
                        x: parseFloat(e.target.value),
                      })
                    }
                    style={{ width: "100%", marginTop: 5 }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 5 }}>
                  Y: {discoBallRotation.y.toFixed(2)}
                  <input
                    type="range"
                    min="0"
                    max="6.28"
                    step="0.1"
                    value={discoBallRotation.y}
                    onChange={(e) =>
                      setDiscoBallRotation({
                        ...discoBallRotation,
                        y: parseFloat(e.target.value),
                      })
                    }
                    style={{ width: "100%", marginTop: 5 }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 5 }}>
                  Z: {discoBallRotation.z.toFixed(2)}
                  <input
                    type="range"
                    min="0"
                    max="6.28"
                    step="0.1"
                    value={discoBallRotation.z}
                    onChange={(e) =>
                      setDiscoBallRotation({
                        ...discoBallRotation,
                        z: parseFloat(e.target.value),
                      })
                    }
                    style={{ width: "100%", marginTop: 5 }}
                  />
                </label>
              </div>
            </>
          )}

          <h4 style={{ marginTop: 10, marginBottom: 10 }}>Camera</h4>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Zoom: {discoBallZoom.toFixed(1)}
              <input
                type="range"
                min="2"
                max="10"
                step="0.1"
                value={discoBallZoom}
                onChange={(e) => setDiscoBallZoom(parseFloat(e.target.value))}
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>

          <h4 style={{ marginTop: 10, marginBottom: 10 }}>Smoke Effects</h4>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Density: {smokeDensity.toFixed(1)}
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={smokeDensity}
                onChange={(e) => setSmokeDensity(parseFloat(e.target.value))}
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Speed: {smokeSpeed.toFixed(2)}
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={smokeSpeed}
                onChange={(e) => setSmokeSpeed(parseFloat(e.target.value))}
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Opacity: {smokeOpacity.toFixed(2)}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={smokeOpacity}
                onChange={(e) => setSmokeOpacity(parseFloat(e.target.value))}
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>

          <button
            onClick={() => {
              setDiscoBallPosition({ x: 0, y: 0.9, z: 0 });
              setDiscoBallRotation({ x: 0, y: 0, z: 0 });
              setDiscoBallZoom(5);
              setSmokeDensity(2.0);
              setSmokeSpeed(0.1);
              setSmokeOpacity(0.3);
            }}
            style={{
              width: "100%",
              padding: 10,
              background: "#4a4a4a",
              border: "none",
              borderRadius: 4,
              color: "white",
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            Reset All
          </button>
        </div>
      </>
    );
  },
};
