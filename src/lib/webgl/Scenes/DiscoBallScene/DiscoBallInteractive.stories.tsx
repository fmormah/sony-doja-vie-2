import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

import DiscoBallCanvas from "./DiscoBallCanvas";

const meta: Meta<typeof DiscoBallCanvas> = {
  title: "WebGL/DiscoBall/Interactive",
  component: DiscoBallCanvas,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    position: {
      control: { type: "object" },
      description: "Position of the disco ball (x, y, z)",
    },
    rotation: {
      control: { type: "object" },
      description: "Rotation of the disco ball in radians (x, y, z)",
    },
    zoom: {
      control: { type: "range", min: 2, max: 10, step: 0.1 },
      description: "Camera zoom level",
    },
  },
};

export default meta;

type Story = StoryObj<typeof DiscoBallCanvas>;

export const WithControls: Story = {
  args: {
    position: { x: 0, y: 0.9, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 5,
    fitContainer: true,
  },
  render: (args) => (
    <div
      style={{
        height: "600px",
        width: "800px",
        position: "relative",
        background: "#1a1a1a",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <DiscoBallCanvas {...args} />
    </div>
  ),
};

export const AnimatedRotation: Story = {
  args: {
    position: { x: 0, y: 0.9, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 5,
    fitContainer: true,
  },
  render: function AnimatedStory(args) {
    const [rotation, setRotation] = React.useState({ x: 0, y: 0, z: 0 });

    React.useEffect(() => {
      const interval = setInterval(() => {
        setRotation((prev) => ({
          x: prev.x,
          y: prev.y + 0.5,
          z: prev.z,
        }));
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div
        style={{
          height: "600px",
          width: "800px",
          position: "relative",
          background: "#1a1a1a",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <DiscoBallCanvas {...args} rotation={rotation} />
      </div>
    );
  },
};

export const SliderControls: Story = {
  args: {
    position: { x: 0, y: 0.9, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 5,
    fitContainer: true,
  },
  render: function SliderStory(args) {
    const [position, setPosition] = React.useState(args.position);
    const [rotation, setRotation] = React.useState(args.rotation);
    const [zoom, setZoom] = React.useState(args.zoom);

    return (
      <div style={{ display: "flex", gap: "20px", height: "600px" }}>
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#1a1a1a",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <DiscoBallCanvas
            position={position}
            rotation={rotation}
            zoom={zoom}
            fitContainer
          />
        </div>
        <div
          style={{
            width: "300px",
            padding: "20px",
            background: "#2a2a2a",
            borderRadius: "8px",
            color: "#fff",
            fontFamily: "sans-serif",
            fontSize: "14px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Controls</h3>

          <div style={{ marginBottom: "20px" }}>
            <h4>Position</h4>
            <label style={{ display: "block", marginBottom: "10px" }}>
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
                style={{ width: "100%", marginTop: "5px" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Y: {position.y.toFixed(2)}
              <input
                type="range"
                min="-2"
                max="3"
                step="0.1"
                value={position.y}
                onChange={(e) =>
                  setPosition({ ...position, y: parseFloat(e.target.value) })
                }
                style={{ width: "100%", marginTop: "5px" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "10px" }}>
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
                style={{ width: "100%", marginTop: "5px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4>Rotation (radians)</h4>
            <label style={{ display: "block", marginBottom: "10px" }}>
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
                style={{ width: "100%", marginTop: "5px" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "10px" }}>
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
                style={{ width: "100%", marginTop: "5px" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "10px" }}>
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
                style={{ width: "100%", marginTop: "5px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4>Zoom</h4>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Distance: {zoom.toFixed(2)}
              <input
                type="range"
                min="2"
                max="10"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: "100%", marginTop: "5px" }}
              />
            </label>
          </div>

          <button
            onClick={() => {
              setPosition({ x: 0, y: 0.9, z: 0 });
              setRotation({ x: 0, y: 0, z: 0 });
              setZoom(5);
            }}
            style={{
              width: "100%",
              padding: "10px",
              background: "#4a4a4a",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
};
