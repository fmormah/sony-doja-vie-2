import { render, screen } from "@testing-library/react";
import React from "react";

import PageHeader from "./PageHeader";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("PageHeader", () => {
  it("renders with alt text", () => {
    render(<PageHeader src="/assets/images/hero.png" alt="Dojacat" />);
    expect(screen.getByRole("img", { name: /dojacat/i })).toBeInTheDocument();
  });
});
