import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import CanvasContainer from "../../../../components/organisms/CanvasContainer";

const meta: Meta = {
  title: "WebGL/DiscoBallWithSmoke",
  // Storybook typing is strict for framework components; cast to unknown to avoid 'any'
  component: CanvasContainer as unknown as React.ComponentType,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<React.ComponentProps<typeof CanvasContainer>>;

export const Default: Story = {
  args: {
    position: { x: -0.4, y: 4.2, z: -3 }, // Centered horizontally
    rotation: { x: 0.71, y: 0, z: 0 },
    zoom: 7.9,
    smokeDensity: 2.0,
    smokeSpeed: 0.1,
    smokeOpacity: 0.35,
    smokeColor: { r: 0.5, g: 0.5, b: 0.6 },
  },
};

export const HeavySmoke: Story = {
  args: {
    position: { x: 0, y: 0.9, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 5,
    smokeDensity: 3.5,
    smokeSpeed: 0.05,
    smokeOpacity: 0.5,
    smokeColor: { r: 0.4, g: 0.4, b: 0.5 },
  },
};

export const LightFog: Story = {
  args: {
    position: { x: 0, y: 0.9, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 5,
    smokeDensity: 1.0,
    smokeSpeed: 0.2,
    smokeOpacity: 0.15,
    smokeColor: { r: 0.7, g: 0.7, b: 0.8 },
  },
};

export const InteractiveControls: Story = {
  render: function InteractiveStory() {
    const [position, setPosition] = React.useState({ x: 0, y: 0.9, z: 0 });
    const [rotation, setRotation] = React.useState({ x: 0, y: 0, z: 0 });
    const [zoom, setZoom] = React.useState(5);
    const [smokeDensity, setSmokeDensity] = React.useState(2.0);
    const [smokeSpeed, setSmokeSpeed] = React.useState(0.1);
    const [smokeOpacity, setSmokeOpacity] = React.useState(0.3);
    const [smokeColor] = React.useState({
      r: 0.5,
      g: 0.5,
      b: 0.6,
    });

    // Optional: Uncomment to auto-rotate disco ball
    // React.useEffect(() => {
    //   const interval = setInterval(() => {
    //     setRotation((prev) => ({
    //       ...prev,
    //       y: prev.y + 0.02,
    //     }));
    //   }, 50);
    //
    //   return () => clearInterval(interval);
    // }, []);

    return (
      <>
        <CanvasContainer
          position={position}
          rotation={rotation}
          zoom={zoom}
          smokeDensity={smokeDensity}
          smokeSpeed={smokeSpeed}
          smokeOpacity={smokeOpacity}
          smokeColor={smokeColor}
        />

        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            width: 300,
            padding: 20,
            background: "rgba(0, 0, 0, 0.8)",
            borderRadius: 8,
            color: "white",
            fontFamily: "sans-serif",
            fontSize: 14,
            zIndex: 100,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Controls</h3>

          <h4 style={{ marginTop: 10, marginBottom: 10 }}>Position</h4>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              X: {position.x.toFixed(2)}
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={position.x}
                onChange={(e) =>
                  setPosition({ ...position, x: parseFloat(e.target.value) })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Y: {position.y.toFixed(2)}
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={position.y}
                onChange={(e) =>
                  setPosition({ ...position, y: parseFloat(e.target.value) })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Z: {position.z.toFixed(2)}
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={position.z}
                onChange={(e) =>
                  setPosition({ ...position, z: parseFloat(e.target.value) })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>

          <h4 style={{ marginTop: 10, marginBottom: 10 }}>Rotation</h4>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              X: {rotation.x.toFixed(2)}
              <input
                type="range"
                min="0"
                max="6.28"
                step="0.1"
                value={rotation.x}
                onChange={(e) =>
                  setRotation({ ...rotation, x: parseFloat(e.target.value) })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Y: {rotation.y.toFixed(2)}
              <input
                type="range"
                min="0"
                max="6.28"
                step="0.1"
                value={rotation.y}
                onChange={(e) =>
                  setRotation({ ...rotation, y: parseFloat(e.target.value) })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Z: {rotation.z.toFixed(2)}
              <input
                type="range"
                min="0"
                max="6.28"
                step="0.1"
                value={rotation.z}
                onChange={(e) =>
                  setRotation({ ...rotation, z: parseFloat(e.target.value) })
                }
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>
              Zoom: {zoom.toFixed(1)}
              <input
                type="range"
                min="2"
                max="10"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: "100%", marginTop: 5 }}
              />
            </label>
          </div>

          <h4 style={{ marginTop: 10, marginBottom: 10 }}>Smoke</h4>
          <div style={{ marginBottom: 15 }}>
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

          <div style={{ marginBottom: 15 }}>
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
              setPosition({ x: 0, y: 0.9, z: 0 });
              setRotation({ x: 0, y: 0, z: 0 });
              setZoom(5);
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
            }}
          >
            Reset
          </button>
        </div>
      </>
    );
  },
};
