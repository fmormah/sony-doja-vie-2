"use client";

import { styled } from "@phantomstudios/css-components";
import cn from "classnames";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import Hotspot, { HotspotProps } from "@/components/atoms/Hotspot";
import { FONT_VARIABLES } from "@/theme/fonts";
import { useIsMobile } from "@/utils/deciveDetection";
import useDragScroll from "@/utils/useDragScroll";

import css from "./DanceFloorScene.module.scss";

export interface DanceFloorSceneProps {
  hotspots?: HotspotProps[];
  imageSrc?: string;
  imageAlt?: string;
  /** Optional base background video (e.g., a .mp4 loop) */
  baseVideoSrc?: string;
  /** Optional overlay dancers video to render above the base layer */
  dancersVideoSrc?: string;
  onHotspotClick?: (index: number, hotspot: HotspotProps) => void;
  onImageBoundsChange?: (imgRect: DOMRectReadOnly) => void;
  className?: string;
}

const SceneContainer = styled("div", {
  css: [css.DanceFloorScene, FONT_VARIABLES],
});

const DanceFloorScene: React.FC<DanceFloorSceneProps> = ({
  hotspots = [],
  imageSrc = "/assets/images/scene/DanceFloor/dance-floor.webp",
  imageAlt = "Dance floor scene",
  dancersVideoSrc,
  onHotspotClick,
  onImageBoundsChange,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const hotspotsRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasCenteredOnLoadRef = useRef(false);
  const isMobile = useIsMobile();
  // Tutorial overlay is now handled at a higher layer (ClubScene) for correct stacking on mobile

  // Enable drag scrolling
  useDragScroll(containerRef);

  const handleHotspotClick = useCallback(
    (index: number, hotspot: HotspotProps) => {
      onHotspotClick?.(index, hotspot);
      hotspot.onClick?.();
    },
    [onHotspotClick],
  );

  // Keep hotspot overlay perfectly aligned to the rendered image bounds
  const updateOverlayBounds = useCallback(() => {
    const wrapper = containerRef.current?.querySelector(
      `.${css.sceneWrapper}`,
    ) as HTMLDivElement | null;
    const img = imgRef.current;
    const overlay = hotspotsRef.current;
    if (!wrapper || !img || !overlay) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const left = imgRect.left - wrapperRect.left;
    const top = imgRect.top - wrapperRect.top;

    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${imgRect.width}px`;
    overlay.style.height = `${imgRect.height}px`;

    // Notify parent about image bounds in viewport coordinates
    onImageBoundsChange?.(imgRect);
  }, [onImageBoundsChange]);

  useEffect(() => {
    if (!imageLoaded) return;
    updateOverlayBounds();

    const onResize = () => updateOverlayBounds();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    const container = containerRef.current;
    const onScroll = () => updateOverlayBounds();
    container?.addEventListener("scroll", onScroll, { passive: true });

    // Recompute after a tick to catch layout changes from scrollbars, etc.
    const id = window.setTimeout(updateOverlayBounds, 0);

    // Center initial scroll position once on load if content overflows
    if (!hasCenteredOnLoadRef.current) {
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const canScrollX = el.scrollWidth > el.clientWidth;
        const canScrollY = el.scrollHeight > el.clientHeight;
        if (canScrollX) {
          el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
        }
        if (canScrollY) {
          el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
        }
        hasCenteredOnLoadRef.current = true;
      });
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      container?.removeEventListener("scroll", onScroll as EventListener);
      window.clearTimeout(id);
    };
  }, [imageLoaded, updateOverlayBounds]);

  // Tutorial logic removed from here; managed by ClubScene for mobile-only overlay

  // Handle keyboard navigation between hotspots
  const handleKeyNavigation = useCallback(
    (currentIndex: number) => (e: React.KeyboardEvent<HTMLElement>) => {
      const totalHotspots = hotspots.length;
      if (!totalHotspots) return;

      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          nextIndex = (currentIndex + 1) % totalHotspots;
          break;
        case "ArrowLeft":
          nextIndex = (currentIndex - 1 + totalHotspots) % totalHotspots;
          break;
        case "ArrowDown":
          // Find next hotspot below
          nextIndex = hotspots.findIndex(
            (h, i) => i > currentIndex && h.y > hotspots[currentIndex].y,
          );
          if (nextIndex === -1) {
            nextIndex = hotspots.findIndex(
              (h) => h.y > hotspots[currentIndex].y,
            );
          }
          break;
        case "ArrowUp":
          // Find next hotspot above
          const above = hotspots
            .map((h, i) => ({ ...h, index: i }))
            .filter((h) => h.y < hotspots[currentIndex].y)
            .sort((a, b) => b.y - a.y);
          if (above.length > 0) {
            nextIndex = above[0].index;
          }
          break;
      }

      if (nextIndex !== null && nextIndex >= 0) {
        const nextButton = containerRef.current?.querySelector(
          `[data-hotspot-index="${nextIndex}"]`,
        ) as HTMLElement;
        nextButton?.focus();
      }
    },
    [hotspots],
  );

  return (
    <SceneContainer ref={containerRef} className={cn(className, css.container)}>
      <div className={css.sceneWrapper}>
        <Image
          src={
            isMobile
              ? "/assets/images/scene/DanceFloor/dance-floor-mobile.webp"
              : imageSrc
          }
          alt={imageAlt}
          fill
          sizes={
            isMobile
              ? "(max-width: 480px) 200vw, (max-width: 768px) 150vw, 120vw"
              : "100vw"
          }
          quality={95}
          className={cn(css.backgroundImage, {
            [css.loaded]: imageLoaded,
          })}
          style={{ objectFit: "contain" }}
          onLoad={({ currentTarget: img }) => {
            imgRef.current = img as unknown as HTMLImageElement;
            setImageLoaded(true);
            requestAnimationFrame(updateOverlayBounds);
          }}
          priority
        />

        {!isMobile && dancersVideoSrc ? (
          <video
            className={css.dancersVideo}
            src={dancersVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            aria-hidden
          />
        ) : null}

        <div className={css["club-lights"]}>
          <span className={css["club-light-1"]} />
          <span className={cn(css["candle-light"], css["candle-1"])} />
          <span className={cn(css["candle-light"], css["candle-2"])} />
          <span className={cn(css["candle-light"], css["candle-3"])} />
          <div className={css["overhead-lights"]}>
            <span className={css["overhead-light-1"]} />
            <span className={css["overhead-light-2"]} />
          </div>
        </div>

        {imageLoaded && (
          <div ref={hotspotsRef} className={css.hotspotsContainer}>
            {hotspots.map((hotspot, index) => (
              <div key={index} data-hotspot-index={index}>
                <Hotspot
                  {...hotspot}
                  onClick={() => handleHotspotClick(index, hotspot)}
                  onKeyDown={handleKeyNavigation(index)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </SceneContainer>
  );
};

export default DanceFloorScene;
