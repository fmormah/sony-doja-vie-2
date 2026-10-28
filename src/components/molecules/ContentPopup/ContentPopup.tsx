"use client";

import "./ContentPopup.scss";

import classNames from "classnames";
import Image from "next/image";
import React from "react";

import Button from "@/components/atoms/Button";
import { trackCategory } from "@/utils/tracking";
import HotlineTemplate from "@/components/molecules/ContentPopup/templates/Hotline/HotlineTemplate";
import MerchTemplate from "@/components/molecules/ContentPopup/templates/Merch/MerchTemplate";
import TourTemplate from "@/components/molecules/ContentPopup/templates/Tour/TourTemplate";
import VinylsTemplate from "@/components/molecules/ContentPopup/templates/Vinyls/VinylsTemplate";
import { soundManager } from "@/utils/SoundManager";

export type ContentType = "tour" | "hotline" | "merch" | "vinyls" | "default";

export interface ContentPopupProps {
  isOpen: boolean;
  contentType?: ContentType;
  hotspotLabel?: string;
  onClose: () => void;
}

const ContentPopup: React.FC<ContentPopupProps> = ({
  isOpen,
  contentType = "default",
  hotspotLabel,
  onClose,
}) => {
  const [isIntroPlaying, setIsIntroPlaying] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isOutroPlaying, setIsOutroPlaying] = React.useState(false);
  const [shouldReverse, setShouldReverse] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const reverseRafRef = React.useRef<number | null>(null);

  const introSrc = React.useMemo(() => {
    // Default test video; can be swapped per content type later
    return "/assets/videos/white-to-black.mp4";
  }, []);

  const outroSrc = introSrc; // reuse intro asset and play it in reverse on close

  // Prevent body scroll when popup is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        // Only hard-reset audio and restart Jealous when closing the hotline popup
        if (contentType === "hotline") {
          soundManager.stopAll();
          soundManager.ensureLoaded(
            "jealous-main",
            "/assets/music/Jealous Type [Main].mp3",
            { volume: 0.7, loop: true },
          );
          soundManager.playOnStream("primary", "jealous-main", {
            loop: true,
            volume: 0.7,
          });
        }
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, contentType]);

  // Start intro video on open for non-default content
  React.useEffect(() => {
    if (isOpen && contentType !== "default") {
      setIsIntroPlaying(true);
    } else {
      setIsIntroPlaying(false);
      setIsClosing(false);
      setIsOutroPlaying(false);
      setShouldReverse(false);
      if (reverseRafRef.current) {
        cancelAnimationFrame(reverseRafRef.current);
        reverseRafRef.current = null;
      }
    }
  }, [isOpen, contentType]);

  // Hotline: ensure cleanup while open/close; audio starts in user gesture (ClubScene)
  React.useEffect(() => {
    if (isOpen && contentType === "hotline") {
      return () => {
        soundManager.stopStream("secondary");
        soundManager.setStreamMode("secondary", "outside");
      };
    } else {
      soundManager.stopStream("secondary");
      soundManager.setStreamMode("secondary", "outside");
    }
    return;
  }, [isOpen, contentType]);

  const handleRequestClose = React.useCallback(() => {
    // Only hard-reset audio and restart Jealous when closing the hotline popup
    if (contentType === "hotline") {
      soundManager.stopAll();
      soundManager.ensureLoaded(
        "jealous-main",
        "/assets/music/Jealous Type [Main].mp3",
        { volume: 0.7, loop: true },
      );
      soundManager.playOnStream("primary", "jealous-main", {
        loop: true,
        volume: 0.7,
      });
    }

    // Fade out content first, then play outro transition video, then close
    if (contentType !== "default") {
      if (isClosing || isOutroPlaying) return; // prevent double trigger
      setIsIntroPlaying(false);
      setIsClosing(true);
      setShouldReverse(true);
    } else {
      onClose();
    }
  }, [contentType, isClosing, isOutroPlaying, onClose]);

  // When closing begins, wait for opacity transition to finish before starting outro video
  React.useEffect(() => {
    if (!isClosing) return;
    const node = contentRef.current;
    if (!node) {
      // Fallback: if no node, start outro immediately
      setIsOutroPlaying(true);
      return;
    }

    let didTrigger = false;
    const handleTransitionEnd = (e: Event) => {
      if (didTrigger) return;
      const te = e as TransitionEvent;
      if (te.propertyName !== "opacity") return;
      didTrigger = true;
      setIsOutroPlaying(true);
    };

    node.addEventListener("transitionend", handleTransitionEnd, { once: true });

    // Safety fallback in case transitionend doesn't fire
    const timeoutId = window.setTimeout(() => {
      if (!didTrigger) {
        setIsOutroPlaying(true);
      }
    }, 300);

    return () => {
      node.removeEventListener("transitionend", handleTransitionEnd);
      window.clearTimeout(timeoutId);
    };
  }, [isClosing]);

  const renderContent = () => {
    switch (contentType) {
      case "tour":
        return <TourTemplate />;
      case "hotline":
        return <HotlineTemplate />;
      case "merch":
        return <MerchTemplate />;
      case "vinyls":
        return <VinylsTemplate />;
      default:
        return (
          <div className="ContentPopup__default">
            {/* <h2>Content for {hotspotLabel}</h2> */}
            <p>Content coming soon...</p>
          </div>
        );
    }
  };

  // Configure CTAs by content type
  type CTA = {
    key: string;
    label: string;
    iconSrc: string;
    href: string;
    onClick?: () => void;
  };

  const ctas: CTA[] = React.useMemo(() => {
    const safeLabel =
      hotspotLabel ||
      (contentType === "hotline"
        ? "CallingCard"
        : contentType === "tour"
          ? "Tours"
          : contentType === "merch"
            ? "MerchStore"
            : contentType === "vinyls"
              ? "Vinyls"
              : "");
    const slug = safeLabel.replace(/\s+/g, "_");
    if (contentType === "hotline") {
      return [
        {
          key: "hotline",
          label: "Text Now (747) 246-728",
          iconSrc: "/assets/images/icons/whatsapp.svg",
          href: "https://dojacat.lnk.to/text",
          onClick: () => {
            if (slug) trackCategory(`hotspot_cta_${slug}`);
            // Stop phone audio and restore primary when navigating
            soundManager.stopStream("secondary");
            soundManager.setStreamMode("secondary", "outside");
          },
        },
      ];
    }
    if (contentType === "tour") {
      return [
        {
          key: "tour",
          label: "View Tour",
          iconSrc: "/assets/images/icons/world.svg",
          href: "https://www.dojacat.com/tour/",
          onClick: () => slug && trackCategory(`hotspot_cta_${slug}`),
        },
      ];
    }
    if (contentType === "merch") {
      return [
        {
          key: "merch-official",
          label: "Official Merch",
          iconSrc: "/assets/images/icons/world.svg",
          href: "https://dojacat.lnk.to/merch",
          onClick: () => slug && trackCategory(`hotspot_cta_${slug}`),
        },
      ];
    }
    if (contentType === "vinyls") {
      return [
        {
          key: "vinyls",
          label: "Shop Vinyls",
          iconSrc: "/assets/images/icons/world.svg",
          href: "https://lnk.to/DojaCatStore",
          onClick: () => slug && trackCategory(`hotspot_cta_${slug}`),
        },
      ];
    }
    return [];
  }, [contentType, hotspotLabel]);

  if (!isOpen) return null;

  return (
    <div
      className={classNames("ContentPopup", {
        "is-open": isOpen,
        "is-intro": isIntroPlaying,
        "is-outro": isClosing || isOutroPlaying,
      })}
      onClick={(e) => {
        e.stopPropagation();
        handleRequestClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="ContentPopup__container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with CTA + Close Button */}
        <div className="ContentPopup__header">
          {ctas.length > 0
            ? ctas
                .slice(0, 1)
                .map((cta) => (
                  <Button
                    key={cta.key}
                    className="ContentPopup__viewMore"
                    label={cta.label}
                    iconSrc={cta.iconSrc}
                    href={cta.href}
                    onClick={cta.onClick}
                  />
                ))
            : null}

          <button
            className="ContentPopup__close"
            onClick={handleRequestClose}
            aria-label="Back to the dancefloor"
          >
            <span className="ContentPopup__closeText">
              Back to the dancefloor
            </span>
            <span className="ContentPopup__closeIcon" aria-hidden>
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
        </div>

        {/* Intro video overlay */}
        {isIntroPlaying || isOutroPlaying ? (
          <div className="ContentPopup__introOverlay" aria-hidden>
            <video
              ref={videoRef}
              className="ContentPopup__introVideo"
              key={isOutroPlaying ? "outro" : "intro"}
              src={isOutroPlaying ? outroSrc : introSrc}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => {
                const video = videoRef.current;
                if (!video) return;
                // Clear any existing reverse animation
                if (reverseRafRef.current) {
                  cancelAnimationFrame(reverseRafRef.current);
                  reverseRafRef.current = null;
                }

                if (shouldReverse) {
                  // Manual reverse playback for broad browser support
                  const speed = 1.5; // seconds per second
                  try {
                    video.pause();
                  } catch {}
                  const duration = isFinite(video.duration)
                    ? video.duration
                    : 0;
                  try {
                    video.currentTime = Math.max(0, duration - 0.01);
                  } catch {}

                  let previousTs: number | null = null;
                  const step = (ts: number) => {
                    if (!videoRef.current) return;
                    const v = videoRef.current;
                    if (previousTs == null) {
                      previousTs = ts;
                    }
                    const dt = Math.max(0, (ts - previousTs) / 1000);
                    previousTs = ts;
                    const nextTime = Math.max(0, v.currentTime - dt * speed);
                    try {
                      v.currentTime = nextTime;
                    } catch {}

                    if (nextTime <= 0.01) {
                      reverseRafRef.current = null;
                      setIsOutroPlaying(false);
                      setIsClosing(false);
                      setShouldReverse(false);
                      onClose();
                      return;
                    }
                    reverseRafRef.current = requestAnimationFrame(step);
                  };
                  reverseRafRef.current = requestAnimationFrame(step);
                } else {
                  // Normal forward playback speed
                  video.playbackRate = 1.5;
                }
              }}
              onEnded={() => {
                if (isOutroPlaying) {
                  setIsOutroPlaying(false);
                  setIsClosing(false);
                  setShouldReverse(false);
                  onClose();
                } else {
                  setIsIntroPlaying(false);
                }
              }}
              onError={() => {
                if (isOutroPlaying) {
                  setIsOutroPlaying(false);
                  setIsClosing(false);
                  setShouldReverse(false);
                  onClose();
                } else {
                  setIsIntroPlaying(false);
                }
              }}
            />
          </div>
        ) : null}

        {/* Content Area */}
        <div className="ContentPopup__content" ref={contentRef}>
          {renderContent()}
          {/* Mobile CTA sits just under templates */}
          <div className="ContentPopup__mobileCTA">
            {ctas.length > 0
              ? ctas.map((cta) => (
                  <Button
                    key={cta.key}
                    className="ContentPopup__viewMore"
                    label={cta.label}
                    iconSrc={cta.iconSrc}
                    href={cta.href}
                    onClick={cta.onClick}
                    fullWidth
                  />
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPopup;
