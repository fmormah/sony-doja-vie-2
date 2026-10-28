import { render, screen } from "@testing-library/react";
import React from "react";

import PageHeader from "./PageHeader";

describe("PageHeader", () => {
  it("renders with alt text", () => {
    render(<PageHeader src="/assets/images/hero.png" alt="Dojacat" />);
    expect(screen.getByRole("img", { name: /dojacat/i })).toBeInTheDocument();
  });
});
