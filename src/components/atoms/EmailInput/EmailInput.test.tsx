import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import EmailInput from "./EmailInput";

describe("EmailInput", () => {
  it("renders and submits a valid email", () => {
    const onSubmit = vi.fn();
    render(<EmailInput onSubmit={onSubmit} />);

    const input = screen.getByLabelText(/email address/i);
    fireEvent.change(input, { target: { value: "user@example.com" } });

    const button = screen.getByRole("button", { name: /submit email/i });
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledWith("user@example.com");
  });

  it("blocks invalid email and shows error state after blur", () => {
    const onSubmit = vi.fn();
    render(<EmailInput onSubmit={onSubmit} />);

    const input = screen.getByLabelText(/email address/i);
    fireEvent.change(input, { target: { value: "not-an-email" } });
    fireEvent.blur(input);

    const button = screen.getByRole("button", { name: /submit email/i });
    expect(button).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});


describe("EmailInput", () => {
  it("renders input field", () => {
    render(<EmailInput />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("shows placeholder", () => {
    render(<EmailInput placeholder="Enter email" />);
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<EmailInput onChange={onChange} />);
    const input = screen.getByLabelText(/email address/i);
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(onChange).toHaveBeenCalledWith("test@example.com");
  });

  it("calls onSubmit when clicking submit button", () => {
    const onSubmit = vi.fn();
    render(<EmailInput value="test@example.com" onSubmit={onSubmit} />);
    const submitBtn = screen.getByLabelText(/submit email/i);
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledWith("test@example.com");
  });

  it("calls onSubmit on Enter key", () => {
    const onSubmit = vi.fn();
    render(<EmailInput value="test@example.com" onSubmit={onSubmit} />);
    const input = screen.getByLabelText(/email address/i);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("test@example.com");
  });

  it("disables submit when input is empty", () => {
    render(<EmailInput value="" />);
    const submitBtn = screen.getByLabelText(/submit email/i);
    expect(submitBtn).toBeDisabled();
  });
});
