import { render, screen } from "@testing-library/react";
import React from "react";

import MuteToggle from "./MuteToggle";

describe("MuteToggle", () => {
  it("renders with aria label", () => {
    render(<MuteToggle />);
    expect(screen.getByRole("button", { name: /mute/i })).toBeInTheDocument();
  });

  it("renders muted state", () => {
    render(<MuteToggle defaultMuted />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });
});
