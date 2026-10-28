"use client";

import "./SceneManager.scss";

import classNames from "classnames";
import { useSearchParams } from "next/navigation";
import React from "react";

import HighwayLoadingScene from "@/components/molecules/HighwayLoadingScene/HighwayLoadingScene";
import PostLoadScene from "@/components/molecules/PostLoadScene/PostLoadScene";
import PullinUpAtTheClubScene from "@/components/molecules/PullinUpAtTheClubScene";
import SplashScene from "@/components/molecules/SplashScene";
import ClubScene from "@/components/organisms/ClubScene/ClubScene";
import { defaultClubHotspots } from "@/components/organisms/ClubScene/hotspots";
import SignInScene from "@/components/organisms/SignInScene";
import { useAE } from "@/contexts/AEProvider";
import { useAppActions, useAppSelector } from "@/store/AppStore";
import { AEService } from "@/types/ae";
import { getTimedFlagValue, SESSION_KEYS, setTimedFlag } from "@/utils/session";
import { soundManager } from "@/utils/SoundManager";
import { spotifyApi } from "@/utils/spotify";
import { checkSuperFan, FanType } from "@/utils/superfan";
import { trackFanType } from "@/utils/tracking";

type SceneKey =
  | "splash"
  | "signIn"
  | "highway"
  | "postLoad"
  | "club"
  | "dancefloor";

export interface SceneManagerProps {
  className?: string;
  initialScene?: SceneKey;
  transitionDurationMs?: number;
  allowClickAdvance?: boolean;
}

interface SceneDef {
  key: SceneKey;
  render: (advance: () => void) => React.ReactNode;
}

function getIndexForKey(key: SceneKey, scenes: SceneDef[]): number {
  const idx = scenes.findIndex((s) => s.key === key);
  return idx < 0 ? 0 : idx;
}

function sanitizeScene(input: string | null | undefined): SceneKey | undefined {
  if (!input) return undefined;
  const v = input.trim().toLowerCase();
  switch (v) {
    case "splash":
      return "splash";
    case "signin":
    case "sign-in":
    case "sign_in":
    case "signIn":
      return "signIn";
    case "highway":
    case "highwayloading":
    case "loader":
      return "highway";
    case "postload":
    case "post-load":
      return "postLoad";
    case "club":
    case "door":
    case "pullingup":
    case "pullinup":
    case "pulling-up":
      return "club";
    case "dancefloor":
    case "dance":
    case "dancing":
      return "dancefloor";
    default:
      return undefined;
  }
}

const DEFAULT_TRANSITION_MS = 800;

const SceneManager: React.FC<SceneManagerProps> = ({
  className,
  initialScene,
  transitionDurationMs = DEFAULT_TRANSITION_MS,
  allowClickAdvance,
}) => {
  const searchParams = useSearchParams();
  const authProvider = useAppSelector((s) => s.authProvider);
  const isSuperfan = useAppSelector((s) => s.isSuperfan);
  const { user: aeUser, getServiceToken } = useAE();
  const { set } = useAppActions();
  const authModeRaw = String(process.env.NEXT_PUBLIC_AUTH_MODE || "localMe");
  const authMode: "localhost" | "localMe" | "prod" =
    authModeRaw === "localhost"
      ? "localhost"
      : authModeRaw === "prod"
        ? "prod"
        : "localMe";
  const bypassAllRequirements = authMode === "localhost";

  const isAuthCallback = React.useMemo(() => {
    if (!searchParams) return false;
    const state = searchParams.get("state");
    const spotifyUser = searchParams.get("spotify_user");
    const email = searchParams.get("email");
    return state === "thank-you" && (spotifyUser || email);
  }, [searchParams]);

  const SCENES: SceneDef[] = React.useMemo(
    () => [
      {
        key: "splash",
        render: (advance) => <SplashScene onContinue={advance} />,
      },
      {
        key: "signIn",
        render: (advance) => (
          <SignInScene authMode={authMode} onAuthSuccess={advance} />
        ),
      },
      {
        key: "highway",
        render: (advance) => <HighwayLoadingScene onLoadComplete={advance} />,
      },
      {
        key: "postLoad",
        render: (advance) => <PostLoadScene onContinue={advance} />,
      },
      {
        key: "club",
        render: (advance) => (
          <PullinUpAtTheClubScene
            fogThickness={0.1}
            onPrimaryClick={advance}
            gatingMode="superfan"
            authProvider={authProvider}
            isSuperfan={!!isSuperfan}
            bypassAllRequirements={bypassAllRequirements}
          />
        ),
      },
      {
        key: "dancefloor",
        render: () => <ClubScene hotspots={defaultClubHotspots} />,
      },
    ],
    [authMode, authProvider, isSuperfan, bypassAllRequirements],
  );

  const startKey: SceneKey = React.useMemo(() => {
    if (isAuthCallback) {
      return "highway";
    }
    const fromProp = initialScene;
    const fromQuery = sanitizeScene(searchParams?.get("scene"));
    const fromEnv = sanitizeScene(process.env.NEXT_PUBLIC_START_SCENE);
    return fromProp || fromQuery || fromEnv || "splash";
  }, [initialScene, searchParams, isAuthCallback]);

  const [currentIndex, setCurrentIndex] = React.useState<number>(() =>
    getIndexForKey(startKey, SCENES),
  );
  const [prevIndex, setPrevIndex] = React.useState<number | null>(null);
  const [isCurrentVisible, setIsCurrentVisible] =
    React.useState<boolean>(false);

  const lastBodySceneClassRef = React.useRef<string | null>(null);
  const didApplyRecentSkipRef = React.useRef(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setIsCurrentVisible(true));
    return () => cancelAnimationFrame(id);
  }, [currentIndex]);

  React.useEffect(() => {
    if (isAuthCallback) {
      console.log("[SceneManager] Detected auth callback, setting up session");
      set({ authProvider: "spotify" });
      setTimedFlag(SESSION_KEYS.lastSignIn, "spotify");
      didApplyRecentSkipRef.current = true;

      if (typeof window !== "undefined") {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [isAuthCallback, set]);

  React.useEffect(() => {
    if (didApplyRecentSkipRef.current && currentIndex > 1) return;
    if (isAuthCallback) return;

    const provider =
      typeof window !== "undefined"
        ? getTimedFlagValue(SESSION_KEYS.lastSignIn)
        : undefined;
    const hasSession = !!authProvider || !!provider || !!aeUser;

    const currentScene = SCENES[currentIndex].key;
    const shouldSkip =
      hasSession && (currentScene === "splash" || currentScene === "signIn");

    if (typeof window !== "undefined") {
      console.log("[SceneManager] Session check:", {
        authProvider,
        storedProvider: provider,
        hasAEUser: !!aeUser,
        hasSession,
        currentScene,
        shouldSkip,
        isAuthCallback,
      });
    }

    if (shouldSkip) {
      console.log("[SceneManager] Skipping sign-in, jumping to highway loader");
      if (provider === "apple") {
        set({ authProvider: "apple", isSuperfan: false });
      } else if (aeUser || provider === "spotify") {
        set({ authProvider: "spotify" });
      }
      didApplyRecentSkipRef.current = true;
      const highwayIdx = getIndexForKey("highway", SCENES);
      setCurrentIndex(highwayIdx);
    }
  }, [
    authProvider,
    aeUser,
    SCENES,
    getServiceToken,
    set,
    currentIndex,
    isAuthCallback,
  ]);

  React.useEffect(() => {
    if (!aeUser) return;
    const token = getServiceToken(AEService.SPOTIFY);
    if (!token) return;
    spotifyApi.setAccessToken(token);
    checkSuperFan(
      (fanType: FanType) => {
        trackFanType(fanType);
        set({
          authProvider: "spotify",
          isSuperfan: fanType === FanType.SUPERFAN,
        });
      },
      () => undefined,
    );
  }, [aeUser, getServiceToken, set]);

  React.useEffect(() => {
    if (prevIndex === null) return;
    const t = window.setTimeout(() => setPrevIndex(null), transitionDurationMs);
    return () => window.clearTimeout(t);
  }, [prevIndex, transitionDurationMs]);

  const canAdvance = currentIndex < SCENES.length - 1;

  const advance = React.useCallback(() => {
    if (!canAdvance) return;
    setIsCurrentVisible(false);
    setPrevIndex(currentIndex);
    const nextIndex = Math.min(SCENES.length - 1, currentIndex + 1);
    requestAnimationFrame(() => setCurrentIndex(nextIndex));
  }, [currentIndex, canAdvance, SCENES.length]);

  const handleRootClick = React.useCallback(() => {
    const clickToAdvanceEnv = String(
      process.env.NEXT_PUBLIC_SCENE_CLICK_ADVANCE || "false",
    ).toLowerCase();
    const clickAllowed =
      allowClickAdvance ?? ["1", "true", "yes"].includes(clickToAdvanceEnv);
    if (!clickAllowed) return;
    advance();
  }, [advance, allowClickAdvance]);

  React.useEffect(() => {
    const key = SCENES[currentIndex].key;
    const newClass = `is-scene-${key}`;
    const body = typeof document !== "undefined" ? document.body : null;
    if (!body) return;
    const prevClass = lastBodySceneClassRef.current;
    if (prevClass) body.classList.remove(prevClass);
    body.classList.add(newClass);
    body.setAttribute("data-scene", key);
    lastBodySceneClassRef.current = newClass;

    return () => {
      if (lastBodySceneClassRef.current) {
        body.classList.remove(lastBodySceneClassRef.current);
        body.removeAttribute("data-scene");
        lastBodySceneClassRef.current = null;
      }
    };
  }, [currentIndex, SCENES]);

  React.useEffect(() => {
    const key = SCENES[currentIndex].key;
    if (key === "dancefloor") {
      soundManager.fadePrimaryOutsideToInside(3000);
    } else {
      soundManager.setStreamMode("primary", "outside");
    }
  }, [currentIndex, SCENES]);

  return (
    <div
      className={classNames(
        "SceneManager",
        className,
        `is-scene-${SCENES[currentIndex].key}`,
      )}
      style={{
        ["--scene-fade-duration" as unknown as string]: `${transitionDurationMs}ms`,
      }}
      onClick={handleRootClick}
      aria-live="polite"
    >
      {prevIndex !== null ? (
        <div
          className={classNames("SceneManager__layer", "is-exiting")}
          aria-hidden
        >
          {SCENES[prevIndex].render(() => {})}
        </div>
      ) : null}

      <div
        className={classNames("SceneManager__layer", {
          "is-entering": true,
          "is-visible": isCurrentVisible,
        })}
      >
        {SCENES[currentIndex].render(advance)}
      </div>
    </div>
  );
};

export default SceneManager;
