import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

import HighwayLoadingScene from "./HighwayLoadingScene";

describe("HighwayLoadingScene", () => {
  it("renders LOADING label and MPH container", () => {
    render(<HighwayLoadingScene height="200px" minLoadDuration={100} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByText(/mph/i)).toBeInTheDocument();
  });

  it("calls onLoadComplete after min duration when no assets", async () => {
    const onLoadComplete = vi.fn();
    render(
      <HighwayLoadingScene
        minLoadDuration={50}
        onLoadComplete={onLoadComplete}
        assets={[]}
      />,
    );

    await waitFor(() => expect(onLoadComplete).toHaveBeenCalled(), {
      timeout: 2000,
    });
  });

  it("progress increases mph digits over time", async () => {
    render(<HighwayLoadingScene minLoadDuration={100} assets={[]} />);

    // Find the SR text that announces mph
    const sr = await screen.findByText(/miles per hour/i);
    // After some time, mph should be > 0
    await waitFor(
      () => {
        const value = Number(sr.textContent?.replace(/\D+/g, ""));
        expect(value).toBeGreaterThan(0);
      },
      { timeout: 1500 },
    );
  });
});
