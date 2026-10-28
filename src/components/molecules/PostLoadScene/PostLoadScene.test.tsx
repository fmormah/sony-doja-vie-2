import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import PostLoadScene from "./PostLoadScene";

describe("PostLoadScene", () => {
  it("renders copy and button", () => {
    render(
      <PostLoadScene
        topText="PULLING UP AT THE CLUB."
        bottomText="BUT WILL YOU GET IN?"
      />,
    );

    expect(
      screen.getByRole("heading", { name: /pulling up at the club\./i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /but will you get in\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /i don't care, just drive/i }),
    ).toBeInTheDocument();
  });

  it("adds is-entered class after mount (animation start)", () => {
    const raf = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1 as unknown as number;
      });

    render(<PostLoadScene topText="Top" bottomText="Bottom" />);

    const top = screen.getByRole("heading", { name: /top/i });
    expect(top.className).toMatch(/is-entered/);

    raf.mockRestore();
  });

  it("invokes onContinue and sets exiting classes when button clicked", () => {
    const onContinue = vi.fn();
    const raf = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1 as unknown as number;
      });

    render(
      <PostLoadScene
        topText="Top"
        bottomText="Bottom"
        onContinue={onContinue}
      />,
    );

    const button = screen.getByRole("button", {
      name: /i don't care, just drive/i,
    });
    fireEvent.click(button);

    expect(onContinue).toHaveBeenCalled();
    expect(button.className).toMatch(/is-exiting/);

    const bottom = screen.getByRole("heading", { name: /bottom/i });
    expect(bottom.className).toMatch(/is-exiting/);

    raf.mockRestore();
  });
});
