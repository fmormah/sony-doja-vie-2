import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import Button from "./Button";

describe("Button", () => {
  it("renders label", () => {
    render(<Button label="Click me" />);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("renders decorative icon when iconSrc provided", () => {
    render(
      <Button label="With Icon" iconSrc="/assets/images/icons/spotify.svg" />,
    );
    const decorative = screen.getByRole("presentation", { hidden: true });
    expect(decorative).toBeInTheDocument();
  });

  it("calls onClick when pressed", () => {
    const onClick = vi.fn();
    render(<Button label="Action" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /action/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies full-width class when fullWidth is true", () => {
    render(<Button label="Wide" fullWidth />);
    const btn = screen.getByRole("button", { name: /wide/i });
    expect(btn).toHaveClass("Button--full-width");
  });

  it("applies no-icon padding class when icon is absent", () => {
    render(<Button label="Continue" />);
    const btn = screen.getByRole("button", { name: /continue/i });
    expect(btn).toHaveClass("Button--no-icon");
  });

  it("suppresses click when disabled", () => {
    const onClick = vi.fn();
    render(<Button label="Disabled" disabled onClick={onClick} />);
    const btn = screen.getByRole("button", { name: /disabled/i });
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders icon-only when iconOnly is true", () => {
    render(
      // aria-label is required for accessibility when there is no visible label
      <Button
        iconOnly
        iconSrc="/assets/images/icons/send.svg"
        aria-label="Send"
        label={"" as unknown as string}
      />,
    );
    const btn = screen.getByRole("button", { name: /send/i });
    expect(btn).toHaveClass("Button--icon-only");
  });
});
