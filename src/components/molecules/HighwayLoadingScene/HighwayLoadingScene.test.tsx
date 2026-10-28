import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HighwayLoadingScene from "./HighwayLoadingScene";

async function elapse(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("HighwayLoadingScene with the asset preloader", () => {
  it("starts at zero and waits for the minimum duration before completing exactly once at 110 mph", async () => {
    const onLoadComplete = vi.fn();
    render(
      <HighwayLoadingScene
        minLoadDuration={100}
        assets={[]}
        onLoadComplete={onLoadComplete}
      />,
    );
    expect(
      screen.getByRole("img", { name: "Highway loading animation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("0 miles per hour")).toBeInTheDocument();
    await elapse(96);
    expect(onLoadComplete).not.toHaveBeenCalled();
    await elapse(32);
    expect(screen.getByText("110 miles per hour")).toBeInTheDocument();
    expect(onLoadComplete).toHaveBeenCalledTimes(1);
    await elapse(1000);
    expect(onLoadComplete).toHaveBeenCalledTimes(1);
  });

  it.each(["load", "error"] as const)(
    "waits for pending assets and completes after the image emits %s",
    async (event) => {
      const image = document.createElement("img");
      vi.spyOn(window, "Image").mockImplementation(() => image);
      const onLoadComplete = vi.fn();
      render(
        <HighwayLoadingScene
          minLoadDuration={100}
          assets={[{ src: "/fixture.webp", type: "image" }]}
          onLoadComplete={onLoadComplete}
        />,
      );
      await elapse(200);
      expect(onLoadComplete).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent[event](image);
      });
      expect(screen.getByText("110 miles per hour")).toBeInTheDocument();
      expect(onLoadComplete).toHaveBeenCalledTimes(1);
    },
  );
});
