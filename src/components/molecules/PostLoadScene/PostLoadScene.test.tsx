import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PostLoadScene from "./PostLoadScene";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("PostLoadScene", () => {
  it("renders copy and enters on the next animation frame", () => {
    render(<PostLoadScene />);
    const heading = screen.getByRole("heading", {
      name: "PULLING UP AT THE CLUB.",
    });
    expect(
      screen.getByRole("heading", { name: "BUT WILL YOU GET IN?" }),
    ).toBeInTheDocument();
    expect(heading).not.toHaveClass("is-entered");
    act(() => vi.advanceTimersByTime(20));
    expect(heading).toHaveClass("is-entered");
  });
  it("finishes the exit animation before advancing, even after repeated clicks", () => {
    const onContinue = vi.fn();
    render(<PostLoadScene onContinue={onContinue} />);
    const button = screen.getByRole("button", {
      name: "I don't care, just drive",
    });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toHaveClass("is-exiting");
    screen
      .getAllByRole("heading")
      .forEach((heading) => expect(heading).toHaveClass("is-exiting"));
    act(() => vi.advanceTimersByTime(499));
    expect(onContinue).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onContinue).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
  it("cancels a pending advance when unmounted", () => {
    const onContinue = vi.fn();
    const view = render(<PostLoadScene onContinue={onContinue} />);
    fireEvent.click(
      screen.getByRole("button", { name: "I don't care, just drive" }),
    );
    view.unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(onContinue).not.toHaveBeenCalled();
  });
});
