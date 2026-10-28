"use client";

import "./PullinUpAtTheClubScene.scss";

import { Canvas } from "@react-three/fiber";
import classNames from "classnames";
import Image from "next/image";
import React from "react";

import { useIsIOS, useIsMobile } from "@/utils/deciveDetection";
import { soundManager } from "@/utils/SoundManager";

import Rain from "../Rain/Rain";
import Smoke from "../Smoke/Smoke";
import { trackCategory } from "@/utils/tracking";

export interface PullinUpAtTheClubSceneProps {
  className?: string;
  sceneImageSrc?: string;
  carImageSrc?: string;
  launchDateISO?: string;

  revealDelay?: number;
  revealDuration?: number;
  zoomDelay?: number;
  zoomDuration?: number;
  zoomScale?: number;
  carDelay?: number;
  carDuration?: number;
  text1Delay?: number;
  text2Delay?: number;
  textFadeDuration?: number;

  carStartXPercent?: number;
  carStartYPercent?: number;
  carEndXPercent?: number;
  carEndYPercent?: number;

  onSequenceComplete?: () => void;
  nowOverride?: string;
  hideCarBelowVisibleFraction?: number;
  fogThickness?: number;
  rainIntensity?: number;
  pressDurationMs?: number;
  resetDurationMs?: number;
  onPrimaryClick?: () => void;

  // Car animation behavior:
  // - "moving": current behavior (drive in, overshoot, settle, brake flicker then off)
  // - "static": car remains stationary at end position and brake lights stay on
  carMode?: "moving" | "static";

  // When enabled, if the signed-in Spotify user is a superfan, show the deny entry state
  // This is a simple flag + value pair so parent scenes can decide the source of truth
  denyIfSuperfan?: boolean;
  isSuperfan?: boolean;

  // New gating mode: when set to "superfan", only Spotify superfans can enter; Apple always enters
  gatingMode?: "releaseDate" | "superfan";
  authProvider?: "spotify" | "apple";
  // Dev/test bypass: when true, ignore all gating requirements
  bypassAllRequirements?: boolean;
}

const PullinUpAtTheClubScene: React.FC<PullinUpAtTheClubSceneProps> = ({
  className,
  sceneImageSrc = "/assets/images/scene/DoorScene/pullinUpAtTheClub.webp",
  carImageSrc = "/assets/images/scene/DoorScene/car.webp",
  launchDateISO = "2025-09-26",

  revealDelay = 900,
  revealDuration = 3300,
  zoomDelay = 300,
  zoomDuration = 1500,
  zoomScale = 1.08,
  carDelay = 0,
  carDuration = 2500,
  text1Delay = 400,
  text2Delay = 1400,
  textFadeDuration = 600,

  carStartXPercent = -95,
  carStartYPercent = -20,
  carEndXPercent = -35,
  carEndYPercent = -20,

  onSequenceComplete,
  nowOverride,
  hideCarBelowVisibleFraction = 0.7,
  fogThickness = 0.04,
  rainIntensity = 0.33,
  pressDurationMs = 1400,
  resetDurationMs = 300,
  onPrimaryClick,
  denyIfSuperfan = false,
  isSuperfan = false,
  gatingMode = "releaseDate",
  authProvider,
  bypassAllRequirements = false,
  carMode = "static",
}) => {
  const [revealed, setRevealed] = React.useState(false);
  const [hideBlack, setHideBlack] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);
  const [carIn, setCarIn] = React.useState(false);
  const [carOvershoot, setCarOvershoot] = React.useState(false);
  const [carSettle, setCarSettle] = React.useState(false);
  const [captionIdx, setCaptionIdx] = React.useState<0 | 1 | 2>(0);
  const [caption1Exiting, setCaption1Exiting] = React.useState(false);
  const [brakeFlicker, setBrakeFlicker] = React.useState(false);
  const [brakeOff, setBrakeOff] = React.useState(false);
  const [imgAspect, setImgAspect] = React.useState<number | null>(null);
  const [viewport, setViewport] = React.useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [carHiddenByVisibility, setCarHiddenByVisibility] =
    React.useState(false);
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();

  const durationScale = isMobile ? 1 / 3 : 1;
  const revealDurationScaled = Math.max(
    50,
    Math.round(revealDuration * durationScale),
  );
  const zoomDurationScaled = Math.max(
    50,
    Math.round(zoomDuration * durationScale),
  );
  const carDurationScaled = Math.max(
    50,
    Math.round(carDuration * durationScale),
  );

  const textFadeDurationScaled = Math.max(
    50,
    Math.round(textFadeDuration * durationScale),
  );

  const [showVideo, setShowVideo] = React.useState(true);
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [animationsStarted, setAnimationsStarted] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const didStartJealousRef = React.useRef(false);

  const [isHover, setIsHover] = React.useState(false);
  const [isPressing, setIsPressing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const firedRef = React.useRef(false);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  React.useEffect(() => {
    setAnimationsStarted(true);
  }, []);

  React.useEffect(() => {
    if (!animationsStarted) return;
    const timeouts: number[] = [];
    const clampAtZero = (ms: number) => Math.max(0, ms);

    const tReveal = clampAtZero(revealDelay);
    timeouts.push(
      window.setTimeout(() => {
        setHideBlack(true);
        setRevealed(true);
        window.setTimeout(() => setHideBlack(false), revealDurationScaled);
      }, tReveal),
    );

    const tZoom = tReveal + revealDurationScaled + clampAtZero(zoomDelay);
    timeouts.push(window.setTimeout(() => setZoomed(true), tZoom));

    const tVideoStart = clampAtZero(tReveal + revealDurationScaled - 2300);
    timeouts.push(
      window.setTimeout(() => {
        const video = videoRef.current;
        if (video && video.paused && showVideo) {
          void video.play().catch(() => undefined);
        }
      }, tVideoStart),
    );

    const tCarStart = tZoom + zoomDurationScaled + clampAtZero(carDelay);
    if (carMode === "moving") {
      timeouts.push(
        window.setTimeout(() => {
          setCarIn(true);
          setCarOvershoot(true);
          if (showVideo) setShowVideo(false);
        }, tCarStart),
      );
    } else {
      timeouts.push(
        window.setTimeout(() => {
          if (showVideo) setShowVideo(false);
        }, tCarStart),
      );
    }

    const tCarOvershootDone = (tCarStart + carDurationScaled) / 2;
    const carSettleDuration = Math.round(2100 * durationScale);
    if (carMode === "moving") {
      timeouts.push(
        window.setTimeout(() => {
          setCarSettle(true);
        }, tCarOvershootDone),
      );
    }

    const tSettleDone = tCarOvershootDone + carSettleDuration;
    const tBrakeStart = tSettleDone + 500;
    if (carMode === "moving") {
      timeouts.push(
        window.setTimeout(() => setBrakeFlicker(true), tBrakeStart),
      );
      timeouts.push(
        window.setTimeout(() => {
          setBrakeFlicker(false);
          setBrakeOff(true);
        }, tBrakeStart + 700),
      );
    }

    const tText1 = 5000;
    timeouts.push(window.setTimeout(() => setCaptionIdx(1), tText1));

    const tText1Exit = 6100;
    const tText2 = 7500;
    timeouts.push(
      window.setTimeout(() => setCaption1Exiting(true), tText1Exit),
    );
    timeouts.push(
      window.setTimeout(() => {
        setCaptionIdx(2);
        onSequenceComplete?.();
      }, tText2),
    );

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [
    animationsStarted,
    revealDelay,
    revealDuration,
    zoomDelay,
    zoomDuration,
    carDelay,
    carDuration,
    text1Delay,
    text2Delay,
    textFadeDuration,
    onSequenceComplete,
    showVideo,
    carMode,
  ]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const duration = video.duration || 0;
      if (!duration) return;
      const halfway = duration / 2;
      if (video.currentTime >= halfway && !didStartJealousRef.current) {
        didStartJealousRef.current = true;
        soundManager.ensureLoaded(
          "jealous-main",
          "/assets/music/sample_tracks/dance_floor_music.mp3",
          { volume: 1, loop: true },
        );
        soundManager.stopStream("primary");
        soundManager.playOnStream("primary", "jealous-main", {
          loop: true,
          volume: 1,
        });
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoLoaded]);

  React.useEffect(() => {
    if (!isPressing) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (ts: number) => {
      const dt = ts - t0;
      const p = Math.min(1, dt / pressDurationMs);
      setProgress(p);
      if (p < 1 && isPressing) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPressing, pressDurationMs]);

  React.useEffect(() => {
    if (isPressing || progress === 0) return;
    const start = progress;
    const t0 = performance.now();
    let raf = 0;
    const tick = (ts: number) => {
      const dt = ts - t0;
      const p = Math.max(0, start * (1 - dt / resetDurationMs));
      setProgress(p);
      if (p > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgress(0);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPressing, progress, resetDurationMs]);

  React.useEffect(() => {
    if (progress >= 1 && !firedRef.current) {
      firedRef.current = true;
      setIsCompleted(true);
      setIsPressing(false);
      setProgress(0);
      trackCategory("enter_main_view_p2");
      setTimeout(() => {
        firedRef.current = false;
        onPrimaryClick?.();
      }, 2000);
    }
  }, [progress, onPrimaryClick]);

  const handlePressStart = () => {
    if (isIOS) {
      // For iOS, immediately trigger the action on tap when hover is active
      if (isHover) {
        setIsCompleted(true);
        setTimeout(() => {
          onPrimaryClick?.();
        }, 2000);
      }
    } else {
      setIsPressing(true);
    }
  };

  const handlePressEnd = () => {
    if (!isIOS) {
      setIsPressing(false);
    }
  };

  React.useEffect(() => {
    const handle = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  React.useEffect(() => {
    if (!viewport.w || !viewport.h || !imgAspect) {
      setCarHiddenByVisibility(false);
      return;
    }
    const viewportAspect = viewport.w / viewport.h;
    const zoom = zoomed ? zoomScale : 1;
    let scaledHeight: number;
    if (viewportAspect > imgAspect) {
      scaledHeight = (viewport.w / imgAspect) * zoom;
    } else {
      scaledHeight = viewport.h * zoom;
    }
    const visibleFraction = Math.min(1, viewport.h / scaledHeight);
    setCarHiddenByVisibility(visibleFraction < hideCarBelowVisibleFraction);
  }, [viewport, imgAspect, zoomed, zoomScale, hideCarBelowVisibleFraction]);

  const isAfterLaunch = React.useMemo(() => {
    const now = nowOverride ? new Date(nowOverride) : new Date();
    const launch = new Date(launchDateISO);
    return now.getTime() >= launch.getTime();
  }, [nowOverride, launchDateISO]);

  const canEnter = React.useMemo(() => {
    if (bypassAllRequirements) return true;
    if (isSuperfan) return true;
    return isAfterLaunch;
  }, [bypassAllRequirements, isSuperfan, isAfterLaunch]);

  const launchLabel = React.useMemo(() => {
    try {
      const d = new Date(launchDateISO);
      const month = d.toLocaleString(undefined, { month: "long" });
      const day = d.getDate();
      const suffix = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
      };
      return `${month} ${day}${suffix(day)}`;
    } catch {
      return "September 26th";
    }
  }, [launchDateISO]);

  const caption1 = "Door man nods...";
  const caption2 =
    !bypassAllRequirements && !isSuperfan && !isAfterLaunch ? (
      <>
        You&apos;re not on the list.
        <br />
        But don&apos;t walk away. Come back on{" "}
        <span className="ClubScene__date">{launchLabel}</span> to enter Club Vie
      </>
    ) : canEnter ? (
      <>
        You&apos;re on the list.
        <br />
        Dance the night away.
      </>
    ) : (
      "You're not on the list."
    );

  const showDenied = !canEnter && captionIdx >= 2;
  const showCTA = canEnter && captionIdx >= 2;

  return (
    <>
      {showVideo ? (
        <video
          ref={videoRef}
          className="ClubScene__introVideo"
          src="/assets/videos/club-intro.mp4"
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => {
            setShowVideo(false);
          }}
        />
      ) : null}

      <section
        className={classNames("ClubScene", className, {
          "is-revealed": revealed,
          "is-zoomed": zoomed,
          "is-car-in": carMode === "moving" && carIn,
          "is-car-overshoot": carMode === "moving" && carOvershoot,
          "is-car-settle": carMode === "moving" && carSettle,
          "is-brake-flicker": brakeFlicker,
          "is-brake-off": brakeOff,
        })}
        data-gating-mode={gatingMode}
        data-auth-provider={authProvider}
        data-deny-if-superfan={String(denyIfSuperfan)}
        style={
          {
            "--club-zoom-scale": String(zoomScale),
            "--car-start-x": `${carMode === "static" ? carEndXPercent : carStartXPercent}%`,
            "--car-start-y": `${carMode === "static" ? carEndYPercent : carStartYPercent}%`,
            "--car-end-x": `${carEndXPercent}%`,
            "--car-end-y": `${carEndYPercent}%`,
            "--reveal-duration": `${revealDurationScaled}ms`,
            "--zoom-duration": `${zoomDurationScaled}ms`,
            "--car-duration": `${carDurationScaled}ms`,
            "--text-fade-duration": `${textFadeDurationScaled}ms`,
            "--car-settle-duration": `${Math.round(2100 * durationScale)}ms`,
            "--press-zoom": isPressing ? 1.02 : 1,
            "--final-zoom": isCompleted ? 1.5 : 1,
            "--final-zoom-duration": isCompleted ? "1800ms" : "1800ms",
            "--final-zoom-timing": isCompleted
              ? "cubic-bezier(0.2, 0, 1, 1)" // ease-in
              : "cubic-bezier(0.4, 0, 0.2, 1)",
            "--scene-opacity": isCompleted ? 0 : 1,
            "--blackout": isCompleted ? 1 : 0,
          } as React.CSSProperties
        }
        aria-label="Pulling up at the club scene"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="ClubScene__bgWrap">
          <Image
            src={sceneImageSrc}
            alt="Scene"
            fill
            priority
            sizes={
              isMobile
                ? "(max-width: 480px) 200vw, (max-width: 768px) 150vw, 120vw"
                : "100vw"
            }
            className="ClubScene__bg"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalHeight > 0) {
                setImgAspect(img.naturalWidth / img.naturalHeight);
              }
            }}
            draggable={false}
          />
        </div>

        <div className="ClubScene__reveal" aria-hidden>
          <div className="ClubScene__panel ClubScene__panel--top" />
          <div className="ClubScene__panel ClubScene__panel--bottom" />
        </div>

        <div className="rose-light" />

        <div
          className={classNames("ClubScene__car", {
            "is-hidden-by-visibility": carHiddenByVisibility,
          })}
        >
          <div className="ClubScene__carInner">
            <div className="ClubScene__car-break-light a" />
            <div className="ClubScene__car-break-light b" />
            <Image
              src={carImageSrc}
              alt="Car"
              width={883}
              height={419}
              className="ClubScene__carImg"
              draggable={false}
            />
          </div>
        </div>

        <div className="ClubScene__fog" aria-hidden>
          <div className="ClubScene__fogCanvas">
            <Canvas
              gl={{
                antialias: false,
                alpha: true,
                powerPreference: "high-performance",
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: true,
              }}
              dpr={[1, 1.5]}
            >
              <ambientLight intensity={1} />
              <directionalLight position={[-1, 0, 1]} intensity={0.9} />
              <Smoke fogThickness={fogThickness} />
            </Canvas>
          </div>
        </div>

        {!hideBlack && <div className="ClubScene__blackout" aria-hidden />}

        <Rain rainIntensity={rainIntensity} />

        <div className="ClubScene__caption" aria-live="polite">
          <p
            className={classNames("ClubScene__captionLine", {
              "is-visible": captionIdx >= 1,
              "is-exiting": caption1Exiting,
            })}
          >
            {caption1}
          </p>
          <p
            className={classNames("ClubScene__captionLine", {
              "is-visible": captionIdx >= 2,
            })}
          >
            {caption2}
          </p>
        </div>

        {showCTA ? (
          <div className="ClubScene__cta">
            <button
              className={classNames("ClubScene__ctaWrap", {
                "is-hover": isHover,
              })}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              role="button"
              aria-label="Step inside"
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="ClubScene__ctaButton">
                <div className="ClubScene__ctaBase">
                  <span
                    className={classNames("ClubScene__ctaIcon", {
                      "is-active": progress > 0.85 || isPressing,
                    })}
                  />
                </div>

                {progress > 0 && (
                  <div className="ClubScene__ctaProgress" aria-hidden>
                    <svg viewBox="0 0 124 124">
                      <circle
                        r={radius}
                        cx="62"
                        cy="62"
                        style={{
                          strokeDasharray: `${circumference} ${circumference}`,
                          strokeDashoffset: `${circumference * (1 - progress)}`,
                          opacity: Math.min(1, progress * 4),
                        }}
                      />
                    </svg>
                  </div>
                )}
              </div>

              <p className="ClubScene__ctaLabel">
                {isIOS ? (
                  <>
                    TAP
                    <br />
                    TO STEP INSIDE
                  </>
                ) : (
                  <>
                    TAP &amp; HOLD
                    <br />
                    TO STEP INSIDE
                  </>
                )}
              </p>
            </button>
          </div>
        ) : null}

        <div
          className={classNames("ClubScene__denied", {
            "is-visible": showDenied,
          })}
          aria-hidden={!showDenied}
        >
          <Image
            src="/assets/images/scene/DoorScene/Denied.svg"
            alt="Entry denied"
            width={480}
            height={480}
            sizes="25vw"
            className="ClubScene__deniedImg"
            draggable={false}
          />
        </div>
      </section>
    </>
  );
};

export default PullinUpAtTheClubScene;
