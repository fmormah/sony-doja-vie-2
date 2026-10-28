// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest" />
import React from "react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Adjust mocks to keep tests stable without rendering 3D or Next specifics
vi.mock("@react-three/fiber", () => ({
  Canvas: () => null,
  useFrame: () => undefined,
  useThree: () => ({}),
}));

vi.mock("next/link", () => {
  const Link = ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement(
      "a",
      { ...rest, href, "data-mock-next-link": true },
      children,
    );

  return { __esModule: true, default: Link };
});

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({
    fill: _fill,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
  }) => {
    return React.createElement("img", { ...props });
  },
}));

// Canvas mock for jsdom
if (typeof HTMLCanvasElement !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).getContext = vi.fn(() => {
    return {
      // Minimal 2D context API used in our component
      fillRect: () => undefined,
      clearRect: () => undefined,
      beginPath: () => undefined,
      moveTo: () => undefined,
      lineTo: () => undefined,
      closePath: () => undefined,
      stroke: () => undefined,
      fillText: () => undefined,
      // Properties we set/read
      shadowColor: "#000",
      shadowBlur: 0,
      fillStyle: "#000",
      globalCompositeOperation: "source-over",
    } as unknown;
  });
}

// Basic ResizeObserver mock for tests
if (
  typeof (globalThis as unknown as { ResizeObserver?: unknown })
    .ResizeObserver === "undefined"
) {
  class MockResizeObserver {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(callback: any) {
      this.callback = callback;
    }
    observe() {
      // Immediately invoke the callback with an empty entry list
      this.callback([], this);
    }
    unobserve() {}
    disconnect() {}
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).ResizeObserver = MockResizeObserver;
}

// Node 25+ exposes its own localStorage; application code must use jsdom's
// per-test browser storage rather than the host process's storage object.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: (globalThis as unknown as { jsdom: { window: Window } }).jsdom.window
    .localStorage,
});
