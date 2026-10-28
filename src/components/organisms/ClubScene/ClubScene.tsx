"use client";

import cn from "classnames";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Howler } from "howler";

import { HotspotProps } from "@/components/atoms/Hotspot";
import ContentPopup, { ContentType } from "@/components/molecules/ContentPopup";
import DanceFloorScene from "@/components/molecules/DanceFloorScene";
import TrackTitleOverlay from "@/components/molecules/TrackTitleOverlay";
import CanvasContainer, {
  CanvasContainerRef,
} from "@/components/organisms/CanvasContainer";
import { useIsIOS, useIsMobile } from "@/utils/deciveDetection";
import { soundManager } from "@/utils/SoundManager";
import { useMusicManager } from "@/utils/useMusicManager";

import css from "./ClubScene.module.scss";
import { trackCategory } from "@/utils/tracking";

export interface ClubSceneProps {
  // Dance floor props
  hotspots?: HotspotProps[];
  danceFloorImage?: string;
  baseVideoSrc?: string;
  dancersVideoSrc?: string;
  onHotspotClick?: (index: number, hotspot: HotspotProps) => void;

  // Disco ball props
  discoBallPosition?: { x: number; y: number; z: number };
  discoBallRotation?: { x: number; y: number; z: number };
  discoBallZoom?: number;

  // Smoke props
  smokeDensity?: number;
  smokeSpeed?: number;
  smokeOpacity?: number;
  smokeColor?: { r: number; g: number; b: number };
}

const ClubScene: React.FC<ClubSceneProps> = ({
  hotspots = [],
  danceFloorImage,
  baseVideoSrc = "/assets/videos/club-intro.mp4",
  dancersVideoSrc = "/assets/videos/dancers.mp4",
  onHotspotClick,
  discoBallPosition: defaultDiscoBallPosition = { x: -0.43, y: 4.9, z: -3 },
  discoBallRotation: defaultDiscoBallRotation = { x: 0.71, y: 0, z: 0 },
  discoBallZoom: defaultDiscoBallZoom = 7.9,
  smokeDensity: defaultSmokeDensity = 2.0,
  smokeSpeed = 0.2,
  smokeOpacity: defaultSmokeOpacity = 0.35,
  smokeColor = { r: 0.5, g: 0.5, b: 0.6 },
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<string>("");
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // Content popup state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContentType, setPopupContentType] =
    useState<ContentType>("default");
  const [popupHotspotLabel, setPopupHotspotLabel] = useState<string>("");

  // Disco ball state management
  const [isDiscoBallZoomed, setIsDiscoBallZoomed] = useState(false);
  const [discoBallPosition, setDiscoBallPosition] = useState(
    defaultDiscoBallPosition,
  );
  const [discoBallRotation, setDiscoBallRotation] = useState(
    defaultDiscoBallRotation,
  );
  const [discoBallZoom, setDiscoBallZoom] = useState(defaultDiscoBallZoom);
  const [smokeDensity, setSmokeDensity] = useState(defaultSmokeDensity);
  const [smokeOpacity, setSmokeOpacity] = useState(defaultSmokeOpacity);
  const [danceFloorOpacity, setDanceFloorOpacity] = useState(1);
  const [showMixBlend, setShowMixBlend] = useState(true);
  const [showMobileTutorial, setShowMobileTutorial] = useState(false);
  const hasSeenMobileTutorialRef = useRef(false);
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();
  const [isJealousTrackPlaying, setIsJealousTrackPlaying] = useState(false);
  const canvasRef = useRef<CanvasContainerRef>(null);
  const iosSafetyTimeoutRef = useRef<number | null>(null);

  const musicManager = useMusicManager({ enabled: isDiscoBallZoomed });

  // Helper function to clean up audio memory
  const cleanupAudioMemory = useCallback(
    (preserveDiscoBall = false) => {
      // Stop all sounds but preserve the ones we need
      soundManager.stopAll();

      // If not preserving disco ball, do deep cleanup
      if (!preserveDiscoBall) {
        // Only unload non-critical sounds
        const soundsToKeep = ["disco-ball-concat", "jealous-main"];
        const allSounds = soundManager.getSoundIds();
        allSounds.forEach((id) => {
          if (!soundsToKeep.includes(id)) {
            soundManager.unload(id);
          }
        });
      }

      // Force garbage collection by clearing audio contexts if possible
      if (typeof window !== "undefined" && isIOS) {
        // On iOS, we need to be extra careful with memory
        // Clear any lingering audio buffers
        const audioContext =
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext ||
          (window as unknown as { AudioContext?: typeof AudioContext })
            .AudioContext;
        if (audioContext) {
          try {
            // Create a new context to replace the old one (forces cleanup)
            const ctx = new audioContext();
            ctx.close();
          } catch (e) {
            console.warn("[ClubScene] Could not reset audio context:", e);
          }
        }
      }

      // Small delay to ensure cleanup completes
      return new Promise((resolve) => setTimeout(resolve, 200));
    },
    [isIOS],
  );

  // auto-start music when disco ball is zoomed and fade out when leaving
  useEffect(() => {
    if (isDiscoBallZoomed) {
      // Stop any dance floor music if playing
      if (isJealousTrackPlaying) {
        soundManager.stop("jealous-main");
        setIsJealousTrackPlaying(false);
      }

      // Small delay to ensure music manager is ready after any cleanup
      setTimeout(() => {
        // fadeIn will ensure the disco ball music is loaded and playing
        musicManager.fadeIn();
      }, 300);

      // iOS safety: Add a timeout to prevent memory crashes after long playback
      if (isIOS) {
        // Clean up and restart music after 2 minutes on iOS to prevent crashes
        iosSafetyTimeoutRef.current = window.setTimeout(async () => {
          if (musicManager.isPlaying) {
            const currentTime = musicManager.currentTime;

            // Clean up audio memory but preserve disco ball music
            await cleanupAudioMemory(true);

            // Wait a bit then restart music
            setTimeout(() => {
              // fadeIn will ensure the music is loaded
              musicManager.fadeIn();
              // Try to restore position
              if (currentTime > 0) {
                musicManager.seekToTime(currentTime);
              }
            }, 300);
          }
        }, 120000); // 2 minutes
      }
    } else if (!isDiscoBallZoomed) {
      // Leaving disco ball mode
      // Clear iOS safety timeout when leaving
      if (iosSafetyTimeoutRef.current) {
        clearTimeout(iosSafetyTimeoutRef.current);
        iosSafetyTimeoutRef.current = null;
      }

      // Stop disco ball music
      if (musicManager.isPlaying) {
        musicManager.stop();
      }

      // Start dance floor music after a small delay
      // IMPORTANT: Don't start if hotline popup is open
      setTimeout(() => {
        // Check if hotline popup is open to prevent audio conflict
        if (isPopupOpen && popupContentType === "hotline") {
          console.log(
            "[ClubScene] Skipping dance floor music - hotline popup is open",
          );
          return;
        }

        soundManager.ensureLoaded(
          "jealous-main",
          "/assets/music/sample_tracks/dance_floor_music.mp3",
          {
            volume: 0.7,
            loop: true,
            // Prefer HTML5 streaming on iOS to avoid large-buffer crashes
            html5: isIOS,
          },
        );

        soundManager.playOnStream("primary", "jealous-main", {
          loop: true,
          volume: 0.7,
        });
        setIsJealousTrackPlaying(true);
      }, 100);
    }

    return () => {
      // Cleanup on unmount
      if (iosSafetyTimeoutRef.current) {
        clearTimeout(iosSafetyTimeoutRef.current);
        iosSafetyTimeoutRef.current = null;
      }
    };
  }, [
    isDiscoBallZoomed,
    musicManager,
    isJealousTrackPlaying,
    isIOS,
    cleanupAudioMemory,
    isPopupOpen,
    popupContentType,
  ]);

  // Toggle disco ball zoom with audio memory cleanup
  const toggleDiscoBall = useCallback(async () => {
    if (isDiscoBallZoomed) {
      // Return to default state
      setDiscoBallPosition(defaultDiscoBallPosition);
      setDiscoBallRotation(defaultDiscoBallRotation);
      setDiscoBallZoom(defaultDiscoBallZoom);
      setSmokeDensity(defaultSmokeDensity);
      setSmokeOpacity(defaultSmokeOpacity);
      setDanceFloorOpacity(1);
      setShowMixBlend(true);
      setIsDiscoBallZoomed(false);
    } else {
      // Clean up audio memory but preserve disco ball music
      await cleanupAudioMemory(true);
      if (isMobile) {
        setDiscoBallPosition({ x: 0, y: 0.95, z: 1.4 });
        setDiscoBallRotation({ x: -Math.PI / 8, y: 0, z: 0 });
        setDiscoBallZoom(6);
      } else {
        setDiscoBallPosition({ x: 0, y: 0.8, z: 2.3 });
        setDiscoBallRotation({ x: -Math.PI / 6, y: 0, z: 0 });
        setDiscoBallZoom(5);
      }

      setSmokeDensity(0.5);
      setSmokeOpacity(0.1);
      setDanceFloorOpacity(0.1);
      setShowMixBlend(false);
      setIsDiscoBallZoomed(true);
    }
  }, [
    cleanupAudioMemory,
    isDiscoBallZoomed,
    isMobile,
    defaultDiscoBallPosition,
    defaultDiscoBallRotation,
    defaultDiscoBallZoom,
    defaultSmokeDensity,
    defaultSmokeOpacity,
  ]);

  // Map hotspot labels to content types
  const getContentType = (label?: string): ContentType => {
    if (!label) return "default";

    const labelLower = label.toLowerCase();
    if (labelLower.includes("tour")) return "tour";
    if (
      labelLower.includes("calling") ||
      labelLower.includes("hotline") ||
      labelLower.includes("card")
    )
      return "hotline";
    if (labelLower.includes("merch") || labelLower.includes("store"))
      return "merch";
    if (labelLower.includes("vinyl")) return "vinyls";

    return "default";
  };

  const handleHotspotClick = async (index: number, hotspot: HotspotProps) => {
    setSelectedHotspot(hotspot.label || `Hotspot ${index}`);

    // Check if this hotspot should toggle the disco ball (no popup for disco ball)
    if (hotspot.label === "DJ Booth" || hotspot.label === "DiscoBall") {
      trackCategory("discoball_enter");
      await toggleDiscoBall();
    } else {
      const ct = getContentType(hotspot.label);

      // Start hotline audio inside the user gesture on click for iOS reliability
      if (ct === "hotline") {
        try {
          (
            Howler as unknown as { ctx?: { resume?: () => void } }
          ).ctx?.resume?.();
        } catch {}

        // Hard stop everything to avoid overlap
        soundManager.stopAll();

        // On non-iOS, enable phone filter via WebAudio. On iOS (html5), skip filter.
        if (!isIOS) {
          soundManager.setStreamMode("secondary", "phone");
        } else {
          soundManager.setStreamMode("secondary", "outside");
        }

        // Ensure and play hotline audio; use HTML5 on iOS to bypass gesture gating
        soundManager.ensureLoaded("call-line", "/assets/sfx/call-line.mp3", {
          volume: 1,
          loop: false,
          html5: isIOS,
        });
        soundManager.playOnStream("secondary", "call-line", {
          loop: false,
          volume: 1,
        });
      }

      // Show content popup for other hotspots (and hotline after starting audio)
      setPopupContentType(ct);
      setPopupHotspotLabel(hotspot.label || `Hotspot ${index}`);
      setIsPopupOpen(true);

      // Track hotspot enter for non-discoball hotspots
      const label = hotspot.label || `Hotspot ${index}`;
      const slug = label.replace(/\s+/g, "_");
      trackCategory(`hotspot_enter_${slug}`);
    }

    onHotspotClick?.(index, hotspot);

    // Clear selection after 3 seconds
    setTimeout(() => setSelectedHotspot(""), 3000);
  };

  const handleClosePopup = () => {
    if (popupHotspotLabel) {
      const slug = popupHotspotLabel.replace(/\s+/g, "_");
      trackCategory(`hotspot_exit_${slug}`);
    }
    setIsPopupOpen(false);
  };

  // Handle returning to the dance floor from disco ball
  const handleBackToDanceFloor = useCallback(() => {
    // Simply toggle the disco ball state
    // The music transition will be handled by the effect watching isDiscoBallZoomed
    if (isDiscoBallZoomed) {
      trackCategory("discoball_exit");
      toggleDiscoBall();
    }
  }, [isDiscoBallZoomed, toggleDiscoBall]);

  // Update canvas container position without causing re-renders
  const updateCanvasPosition = (rect: DOMRectReadOnly) => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.style.left = `${rect.left}px`;
      canvasContainerRef.current.style.top = `${rect.top}px`;
      canvasContainerRef.current.style.width = `${rect.width}px`;
      canvasContainerRef.current.style.height = `${rect.height}px`;

      // Set ready flag after first bounds update
      if (!canvasReady) {
        setCanvasReady(true);
      }
    }
  };

  useEffect(() => {
    if (isMobile && !isDiscoBallZoomed && !hasSeenMobileTutorialRef.current) {
      setShowMobileTutorial(true);
    } else if (!isMobile || isDiscoBallZoomed) {
      setShowMobileTutorial(false);
    }
  }, [isMobile, isDiscoBallZoomed]);

  const dismissMobileTutorial = useCallback(() => {
    hasSeenMobileTutorialRef.current = true;
    setShowMobileTutorial(false);
  }, []);

  useEffect(() => {
    if (!showMobileTutorial) return;

    const events = [
      "touchstart",
      "pointerdown",
      "mousedown",
      "keydown",
      "click",
    ] as const;

    events.forEach((event) => {
      window.addEventListener(
        event,
        dismissMobileTutorial as unknown as EventListener,
        {
          passive: true,
          once: true,
        } as AddEventListenerOptions,
      );
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(
          event,
          dismissMobileTutorial as unknown as EventListener,
        );
      });
    };
  }, [showMobileTutorial, dismissMobileTutorial]);

  return (
    <div className={css.ClubScene}>
      {/* Background: Dance Floor Scene */}
      <div
        ref={overlayRef}
        className={css.background}
        style={{ ["--dance-opacity" as unknown as string]: danceFloorOpacity }}
      >
        <DanceFloorScene
          hotspots={hotspots.map((h) => ({
            ...h,
            // When disco ball is zoomed in, disable all hotspots except the togglers
            visible: isDiscoBallZoomed
              ? h.label === "DJ Booth" || h.label === "DiscoBall"
              : h.visible !== false,
          }))}
          imageSrc={danceFloorImage}
          baseVideoSrc={baseVideoSrc}
          dancersVideoSrc={dancersVideoSrc}
          onHotspotClick={handleHotspotClick}
          onImageBoundsChange={updateCanvasPosition}
        />
      </div>

      {isMobile && showMobileTutorial && !isDiscoBallZoomed && (
        <div
          className={css.mobileTutorialOverlay}
          aria-live="polite"
          onClick={dismissMobileTutorial}
        >
          <Image
            className={css.mobileTutorialImage}
            src="/assets/images/scene/DanceFloor/dance-floor-tutorial.svg"
            alt="Swipe to explore the scene"
            width={320}
            height={320}
            priority
            draggable={false}
          />
        </div>
      )}

      {/* Foreground: Disco Ball with Smoke */}
      <div className={cn(css.foreground, { [css.isBlended]: showMixBlend })}>
        <div
          ref={canvasContainerRef}
          className={cn(css.canvasWrap, {
            [css.isReady]: canvasReady,
            [css.isDiscoBallZoomed]: isDiscoBallZoomed,
          })}
        >
          <CanvasContainer
            ref={canvasRef}
            position={discoBallPosition}
            rotation={discoBallRotation}
            zoom={discoBallZoom}
            renderSmoke={!isMobile}
            smokeDensity={isMobile ? 0 : smokeDensity}
            smokeSpeed={isMobile ? 0 : smokeSpeed}
            smokeOpacity={isMobile ? 0 : smokeOpacity}
            smokeColor={smokeColor}
            enableInteraction={isDiscoBallZoomed}
            isZooming={!isDiscoBallZoomed}
            containerStyle={{
              position: isDiscoBallZoomed ? "fixed" : "absolute",
              inset: 0,
              // iOS optimization: reduce GPU load
              ...(isIOS && isDiscoBallZoomed
                ? {
                    transform: "translateZ(0)",
                    willChange: "transform",
                  }
                : {}),
            }}
          />

          {isDiscoBallZoomed && (
            <>
              <TrackTitleOverlay
                currentTime={musicManager.currentTime}
                onSeekToTime={musicManager.seekToTime}
                canvasRef={canvasRef}
              />
              <p className={css.discoBallInstruction}>
                Spin the discoball to discover
                <br />
                exclusive Vie snippets
              </p>
              <button
                className={css.backToDanceFloorButton}
                onClick={handleBackToDanceFloor}
                aria-label="Back to the dancefloor"
              >
                <span className={css.backButtonText}>
                  Back to the dancefloor
                </span>
                <span className={css.backButtonIcon} aria-hidden>
                  <Image
                    src="/assets/images/scene/DanceFloor/icon-cross-btclose.svg"
                    alt=""
                    width={24}
                    height={24}
                    draggable={false}
                    priority
                  />
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* UI Overlay: Show selected hotspot */}
      {selectedHotspot && (
        <div className={css.message}>Selected: {selectedHotspot}</div>
      )}

      {/* Content Popup */}
      <ContentPopup
        isOpen={isPopupOpen}
        contentType={popupContentType}
        hotspotLabel={popupHotspotLabel}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default ClubScene;
