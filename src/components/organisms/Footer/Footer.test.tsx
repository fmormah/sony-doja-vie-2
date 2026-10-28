import { render, screen } from "@testing-library/react";
import React from "react";

import { AppStoreProvider } from "@/store/AppStore";

import Footer from "./Footer";

describe("Footer", () => {
  it("renders RCA logo and copy", () => {
    render(
      <AppStoreProvider>
        <Footer />
      </AppStoreProvider>,
    );
    expect(screen.getByAltText(/rca/i)).toBeInTheDocument();
    expect(screen.getByText(/sony music entertainment/i)).toBeInTheDocument();
  });

  it("shows MuteToggle regardless of sign-in state", () => {
    render(
      <AppStoreProvider>
        <Footer />
      </AppStoreProvider>,
    );
    expect(screen.getByRole("button", { name: /mute/i })).toBeInTheDocument();
  });
});
