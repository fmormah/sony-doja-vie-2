import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppStoreProvider, useAppStore } from "@/store/AppStore";
import { SESSION_KEYS, getTimedFlagValue } from "@/utils/session";
import SignInScene from "./SignInScene";

const auth = vi.hoisted(() => ({
  libraryLoaded: true,
  appleReady: true,
  user: undefined as object | undefined,
  authenticate: vi.fn(),
  authenticateApple: vi.fn(),
  getServiceToken: vi.fn(() => "test-token"),
  setAccessToken: vi.fn(),
  checkSuperFan: vi.fn(),
}));
vi.mock("@/contexts/AEProvider", () => ({ useAE: () => auth }));
vi.mock("@/contexts/AppleMusicProvider", () => ({
  useAppleMusic: () => ({
    isReady: auth.appleReady,
    authenticate: auth.authenticateApple,
  }),
}));
vi.mock("@/utils/spotify", () => ({
  SPOTIFY_BTN_DATA_ATTRIBUTE: {},
  spotifyApi: { setAccessToken: auth.setAccessToken },
}));
vi.mock("@/utils/superfan", () => ({
  FanType: { SUPERFAN: "superfan", REGULAR: "regular" },
  checkSuperFan: auth.checkSuperFan,
}));
function StoreState() {
  return (
    <output aria-label="Authentication state">
      {JSON.stringify(useAppStore())}
    </output>
  );
}
function renderSignIn(props: React.ComponentProps<typeof SignInScene> = {}) {
  const tree = () => (
    <AppStoreProvider>
      <SignInScene {...props} />
      <StoreState />
    </AppStoreProvider>
  );
  const view = render(tree());
  return { ...view, refresh: () => view.rerender(tree()) };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  localStorage.clear();
  auth.libraryLoaded = true;
  auth.appleReady = true;
  auth.user = undefined;
  auth.authenticateApple.mockResolvedValue({ success: true });
  auth.checkSuperFan.mockImplementation((onResult) => onResult("superfan"));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("SignInScene with the application store", () => {
  it("enters the demo once, saves its session, and hides controls without authenticating", () => {
    auth.libraryLoaded = false;
    auth.appleReady = false;
    const onAuthSuccess = vi.fn();
    const view = renderSignIn({ authMode: "localhost", onAuthSuccess });
    fireEvent.click(screen.getByRole("button", { name: "Enter demo" }));
    expect(screen.getByText("Let's ride...")).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Music providers" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Authentication state")).toHaveTextContent(
      '"authProvider":"spotify"',
    );
    expect(screen.getByLabelText("Authentication state")).toHaveTextContent(
      '"isSuperfan":false',
    );
    expect(getTimedFlagValue(SESSION_KEYS.lastSignIn)).toBe("localhost");
    view.refresh();
    act(() => vi.advanceTimersByTime(1000));
    expect(onAuthSuccess).toHaveBeenCalledTimes(1);
    expect(auth.authenticate).not.toHaveBeenCalled();
    expect(auth.authenticateApple).not.toHaveBeenCalled();
  });
  it("keeps unavailable providers disabled without starting a session", () => {
    auth.libraryLoaded = false;
    auth.appleReady = false;
    const onAuthSuccess = vi.fn();
    renderSignIn({ onAuthSuccess });
    for (const name of ["Connect with Spotify", "Connect with Apple Music"]) {
      const button = screen.getByRole("button", { name });
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(auth.authenticate).not.toHaveBeenCalled();
    expect(auth.authenticateApple).not.toHaveBeenCalled();
    expect(onAuthSuccess).not.toHaveBeenCalled();
    expect(localStorage.getItem(SESSION_KEYS.lastSignIn)).toBeNull();
  });
  it("validates email and waits for Apple success before persisting and advancing", async () => {
    let resolveAuth!: (value: { success: boolean }) => void;
    auth.authenticateApple.mockReturnValue(
      new Promise((resolve) => {
        resolveAuth = resolve;
      }),
    );
    const onAuthSuccess = vi.fn();
    const onEmailSubmit = vi.fn();
    renderSignIn({ onAuthSuccess, onEmailSubmit });
    fireEvent.click(
      screen.getByRole("button", { name: "Connect with Apple Music" }),
    );
    const input = screen.getByRole("textbox", { name: "Email address" });
    fireEvent.change(input, { target: { value: "not-an-email" } });
    expect(screen.getByRole("button", { name: "Submit email" })).toBeDisabled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(auth.authenticateApple).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "fan@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit email" }));
    expect(auth.authenticateApple).toHaveBeenCalledExactlyOnceWith(
      "fan@example.com",
    );
    expect(onAuthSuccess).not.toHaveBeenCalled();
    expect(localStorage.getItem(SESSION_KEYS.lastSignIn)).toBeNull();
    await act(async () => resolveAuth({ success: true }));
    expect(onAuthSuccess).toHaveBeenCalledTimes(1);
    expect(onEmailSubmit).toHaveBeenCalledExactlyOnceWith("fan@example.com");
    expect(getTimedFlagValue(SESSION_KEYS.lastSignIn)).toBe("apple");
    expect(screen.getByLabelText("Authentication state")).toHaveTextContent(
      '"authProvider":"apple"',
    );
    expect(
      screen.queryByRole("group", { name: "Music providers" }),
    ).not.toBeInTheDocument();
  });
  it("keeps failed Apple sign-in on the form and permits a successful retry", async () => {
    auth.authenticateApple.mockResolvedValueOnce({ success: false });
    const onAuthSuccess = vi.fn();
    renderSignIn({ onAuthSuccess });
    fireEvent.click(
      screen.getByRole("button", { name: "Connect with Apple Music" }),
    );
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "fan@example.com" },
    });
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Submit email" })),
    );
    expect(onAuthSuccess).not.toHaveBeenCalled();
    expect(getTimedFlagValue(SESSION_KEYS.lastSignIn)).toBeUndefined();
    expect(screen.getByLabelText("Authentication state")).not.toHaveTextContent(
      "authProvider",
    );
    expect(screen.getByLabelText("Email address")).toHaveValue(
      "fan@example.com",
    );
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Submit email" })),
    );
    expect(auth.authenticateApple).toHaveBeenCalledTimes(2);
    expect(onAuthSuccess).toHaveBeenCalledTimes(1);
    expect(getTimedFlagValue(SESSION_KEYS.lastSignIn)).toBe("apple");
  });
  it("connects Spotify through its provider and records superfan status before advancing once", () => {
    vi.stubEnv("NODE_ENV", "development");
    const onAuthSuccess = vi.fn();
    const view = renderSignIn({ onAuthSuccess });
    fireEvent.click(
      screen.getByRole("button", { name: "Connect with Spotify" }),
    );
    expect(auth.authenticate).toHaveBeenCalledTimes(1);
    expect(onAuthSuccess).not.toHaveBeenCalled();
    auth.user = { id: "test-listener" };
    view.refresh();
    expect(auth.setAccessToken).toHaveBeenCalledExactlyOnceWith("test-token");
    expect(screen.getByLabelText("Authentication state")).toHaveTextContent(
      '"isSuperfan":true',
    );
    expect(getTimedFlagValue(SESSION_KEYS.lastSignIn)).toBe("spotify");
    act(() => vi.advanceTimersByTime(99));
    expect(onAuthSuccess).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    view.refresh();
    act(() => vi.advanceTimersByTime(1000));
    expect(onAuthSuccess).toHaveBeenCalledTimes(1);
    expect(auth.checkSuperFan).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("group", { name: "Music providers" }),
    ).not.toBeInTheDocument();
  });
});
