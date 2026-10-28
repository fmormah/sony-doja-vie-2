import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppStoreProvider } from "@/store/AppStore";
import { getTimedFlagValue, SESSION_KEYS, setTimedFlag } from "@/utils/session";
import SceneManager from "./SceneManager";

const boundaries = vi.hoisted(() => ({
  params: new URLSearchParams(),
  auth: {
    libraryLoaded: false,
    user: undefined,
    authenticate: vi.fn(),
    getServiceToken: vi.fn(),
  },
  sound: {
    setStreamMode: vi.fn(),
    fadePrimaryOutsideToInside: vi.fn(),
    ensureLoaded: vi.fn(),
    stopStream: vi.fn(),
    playOnStream: vi.fn(),
  },
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => boundaries.params,
}));
vi.mock("@/contexts/AEProvider", () => ({ useAE: () => boundaries.auth }));
vi.mock("@/contexts/AppleMusicProvider", () => ({
  useAppleMusic: () => ({ isReady: false, authenticate: vi.fn() }),
}));
vi.mock("@/utils/SoundManager", () => ({ soundManager: boundaries.sound }));
// Keep the real loading scene and preloader; avoid network downloads in jsdom.
vi.mock("@/utils/assetPreloader", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/assetPreloader")>()),
  collectAppAssets: () => [],
}));
// Only decorative rendering is replaced. Splash, sign-in, loader, post-load,
// club entrance, session storage, and the application store remain real.
vi.mock("@/components/molecules/Rain/Rain", () => ({ default: () => null }));
vi.mock("@/components/molecules/Smoke/Smoke", () => ({ default: () => null }));
vi.mock("@/components/organisms/ClubScene/ClubScene", () => ({
  default: () => <h1>Dancefloor</h1>,
}));

async function elapse(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}
function renderManager(props: React.ComponentProps<typeof SceneManager> = {}) {
  return render(
    <AppStoreProvider>
      <SceneManager transitionDurationMs={100} {...props} />
    </AppStoreProvider>,
  );
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  localStorage.clear();
  boundaries.params = new URLSearchParams();
  vi.stubEnv("NEXT_PUBLIC_AUTH_MODE", "localhost");
  vi.stubEnv("NEXT_PUBLIC_START_SCENE", "");
  vi.stubEnv("NEXT_PUBLIC_SCENE_CLICK_ADVANCE", "false");
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("SceneManager integration", () => {
  it("runs splash → demo entry → loading → club entrance → dancefloor through actual scene events", async () => {
    renderManager();
    expect(document.body).toHaveAttribute("data-scene", "splash");
    const splash = screen.getByLabelText("Splash");
    fireEvent.click(splash);
    expect(document.body).toHaveAttribute("data-scene", "splash");
    fireEvent.ended(splash.querySelector("video")!);
    await elapse(2999);
    expect(
      screen.queryByRole("button", { name: "Enter demo" }),
    ).not.toBeInTheDocument();
    await elapse(50);
    fireEvent.click(screen.getByRole("button", { name: "Enter demo" }));
    await elapse(100);
    expect(document.body).toHaveAttribute("data-scene", "highway");
    expect(
      screen.getByRole("img", { name: "Highway loading animation" }),
    ).toBeInTheDocument();
    expect(getTimedFlagValue(SESSION_KEYS.lastSignIn)).toBe("localhost");
    expect(boundaries.auth.authenticate).not.toHaveBeenCalled();
    await elapse(5100);
    expect(document.body).toHaveAttribute("data-scene", "postLoad");
    const continueButton = screen.getByRole("button", {
      name: "I don't care, just drive",
    });
    fireEvent.click(continueButton);
    fireEvent.click(continueButton);
    await elapse(499);
    expect(document.body).toHaveAttribute("data-scene", "postLoad");
    await elapse(100);
    expect(document.body).toHaveAttribute("data-scene", "club");
    await elapse(10000);
    const entrance = screen.getByRole("button", { name: "Step inside" });
    fireEvent.mouseDown(entrance);
    await elapse(5000);
    await elapse(2100);
    expect(document.body).toHaveAttribute("data-scene", "dancefloor");
    expect(
      screen.getByRole("heading", { name: "Dancefloor" }),
    ).toBeInTheDocument();
    expect(boundaries.sound.fadePrimaryOutsideToInside).toHaveBeenCalledWith(
      3000,
    );
    expect(
      screen.queryByRole("button", { name: "Step inside" }),
    ).not.toBeInTheDocument();
  });

  it("restores a stored session and skips sign-in without skipping the loader", async () => {
    setTimedFlag(SESSION_KEYS.lastSignIn, "apple");
    renderManager();
    expect(document.body).toHaveAttribute("data-scene", "highway");
    expect(screen.queryByLabelText("Splash")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Enter demo" }),
    ).not.toBeInTheDocument();
    await elapse(1000);
    expect(document.body).toHaveAttribute("data-scene", "highway");
    await elapse(4100);
    expect(document.body).toHaveAttribute("data-scene", "postLoad");
  });

  it("falls back to splash for an invalid scene URL and ignores background clicks", async () => {
    boundaries.params = new URLSearchParams("scene=not-a-scene");
    const view = renderManager();
    fireEvent.click(view.container.firstElementChild!);
    await elapse(100);
    expect(document.body).toHaveAttribute("data-scene", "splash");
    expect(screen.getByLabelText("Splash")).toBeInTheDocument();
  });

  it("removes scene state and cancels splash advancement on unmount", async () => {
    const view = renderManager();
    fireEvent.ended(screen.getByLabelText("Splash").querySelector("video")!);
    view.unmount();
    await elapse(4000);
    expect(document.body).not.toHaveAttribute("data-scene");
    expect(document.body).not.toHaveClass("is-scene-splash");
    expect(
      screen.queryByRole("button", { name: "Enter demo" }),
    ).not.toBeInTheDocument();
  });
});
