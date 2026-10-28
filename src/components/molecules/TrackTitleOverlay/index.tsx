"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { trackCategory } from "@/utils/tracking";

import { CanvasContainerRef } from "@/components/organisms/CanvasContainer";
import { DOJA_CAT_CLIPS } from "@/config/musicTracks";

import css from "./TrackTitleOverlay.module.scss";

export interface TrackTitleOverlayProps {
  currentTime?: number;
  onSeekToTime?: (time: number) => void;
  canvasRef?: React.RefObject<CanvasContainerRef | null>;
}

const TrackTitleOverlay: React.FC<TrackTitleOverlayProps> = ({
  currentTime = 0,
  onSeekToTime,
  canvasRef,
}) => {
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textDragStart, setTextDragStart] = useState(0);
  const [textDragCurrent, setTextDragCurrent] = useState(0);
  const [totalStringWidth, setTotalStringWidth] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [accumulatedScrollDistance, setAccumulatedScrollDistance] = useState(0); // track total scroll across loops
  const measureRef = useRef<HTMLDivElement>(null);
  const lastMusicTimeRef = useRef(0); // track previous music time to detect loops
  const lastDragX = useRef(0); // track last drag position for incremental updates
  const hasTrackedSpinRef = useRef(false); // ensure one spin event per gesture

  // mapping data
  const titleString = DOJA_CAT_CLIPS.map((clip) => clip.title).join("  ") + " ";
  const totalDuration =
    DOJA_CAT_CLIPS[DOJA_CAT_CLIPS.length - 1].startTime +
    DOJA_CAT_CLIPS[DOJA_CAT_CLIPS.length - 1].duration;

  // track mappings using config-defined percentages
  const trackMappings = DOJA_CAT_CLIPS.map((clip) => ({
    trackName: clip.title,
    startTime: clip.startTime,
    duration: clip.duration,
    endTime: clip.startTime + clip.duration,
    startPercentage: clip.startPercentage,
  }));

  // triple the string for seamless looping
  const loopedString = `${titleString} ${titleString} ${titleString}`;

  // measure total string width once and initialize
  useEffect(() => {
    if (measureRef.current && totalStringWidth === 0) {
      const containerWidth = measureRef.current.scrollWidth;
      setTotalStringWidth(containerWidth / 3); // Divide by 3 since we tripled the string
    }
  }, [totalStringWidth]);

  // Removed per-character DOM measurement. Opacity/edge fade handled via CSS mask.

  // detect music loops and accumulate scroll distance
  useEffect(() => {
    const lastTime = lastMusicTimeRef.current;
    const currentTime_local = currentTime;

    // detect if music just looped (time went from high to low)
    if (
      lastTime > totalDuration * 0.8 &&
      currentTime_local < totalDuration * 0.2
    ) {
      // music looped! add one full string width to accumulated distance
      setAccumulatedScrollDistance((prev) => prev + totalStringWidth);
      console.log(
        `🔄 Music looped! Adding ${totalStringWidth}px to accumulated distance`,
      );
    }

    lastMusicTimeRef.current = currentTime_local;
  }, [currentTime, totalDuration, totalStringWidth]);

  // find current track based on time (with infinite loop support)
  const getCurrentTrack = useCallback(() => {
    const wrappedCurrentTime = currentTime % totalDuration;
    for (const track of trackMappings) {
      if (
        wrappedCurrentTime >= track.startTime &&
        wrappedCurrentTime < track.endTime
      ) {
        return track;
      }
    }
    return trackMappings[0]; // fallback
  }, [currentTime, trackMappings, totalDuration]);

  // calculate music-driven text position using percentage-based progress
  const calculateMusicDrivenPosition = useCallback(() => {
    if (totalStringWidth === 0) return 0;

    const screenCenter =
      typeof window !== "undefined" ? window.innerWidth / 2 : 960;

    // enable infinite loop: wrap current time around total duration
    const wrappedCurrentTime = currentTime % totalDuration;

    // what percentage of the string should have scrolled based on wrapped music time
    let totalPercentageScrolled = 0;

    for (const track of trackMappings) {
      const trackClip = DOJA_CAT_CLIPS.find(
        (clip) => clip.startTime === track.startTime,
      );
      if (!trackClip) continue;

      // calculate percentage range this track covers
      const nextTrack = trackMappings[trackMappings.indexOf(track) + 1];
      const trackEndPercentage = nextTrack ? nextTrack.startPercentage : 1.0;
      const trackPercentageRange =
        trackEndPercentage - trackClip.startPercentage;

      if (wrappedCurrentTime >= track.endTime) {
        // track completed - add full percentage range
        totalPercentageScrolled += trackPercentageRange;
      } else if (
        wrappedCurrentTime >= track.startTime &&
        wrappedCurrentTime < track.endTime
      ) {
        // current track - calculate partial progress
        const timeIntoTrack = wrappedCurrentTime - track.startTime;
        const trackProgress = Math.min(timeIntoTrack / track.duration, 1.0);
        const partialPercentage = trackProgress * trackPercentageRange;
        totalPercentageScrolled += partialPercentage;
        break;
      }
    }

    // convert percentage to pixel position
    const pixelMovement = totalPercentageScrolled * totalStringWidth;

    // add accumulated scroll distance from previous loops
    const totalPixelMovement = pixelMovement + accumulatedScrollDistance;

    // position so first track starts at center
    const position = screenCenter - totalPixelMovement;

    return position;
  }, [
    currentTime,
    totalStringWidth,
    trackMappings,
    getCurrentTrack,
    accumulatedScrollDistance,
  ]);

  // calculate final position - pure music-driven positioning when not dragging
  const calculateFinalPosition = useCallback(() => {
    if (isDraggingText) {
      // during drag: start from position when drag began + current drag offset
      const currentDragOffset = textDragCurrent - textDragStart;
      return dragStartPosition + currentDragOffset;
    } else {
      // normal mode: pure music-driven positioning
      return calculateMusicDrivenPosition();
    }
  }, [
    calculateMusicDrivenPosition,
    isDraggingText,
    textDragCurrent,
    textDragStart,
    dragStartPosition,
  ]);

  // calculate current string percentage (where red line is positioned in the string)
  const getCurrentStringPercentage = useCallback(() => {
    if (totalStringWidth === 0) return 0;

    const screenCenter =
      typeof window !== "undefined" ? window.innerWidth / 2 : 960;
    const totalTextPosition = calculateFinalPosition();

    // calculate how much of the string has passed the red line (center)
    const pixelsScrolled = screenCenter - totalTextPosition;
    const charWidth = totalStringWidth / titleString.length;
    const charactersScrolled = pixelsScrolled / charWidth;

    // allow infinite scroll: don't wrap but let it extend beyond 0-100%
    const rawPercentage = charactersScrolled / titleString.length;

    // the tripled string handles the visual looping, so we can allow percentage to go beyond bounds
    // this ensures previous content remains visible when looping
    return rawPercentage;
  }, [calculateFinalPosition, totalStringWidth, titleString.length]);

  // helper function to find target track based on current percentage
  const findTargetTrack = useCallback(
    (currentStringPercent: number) => {
      // wrap percentage to 0-100% range for track finding, but keep original for calculations
      let wrappedPercent = currentStringPercent % 1.0;
      if (wrappedPercent < 0) wrappedPercent += 1.0;

      for (const track of trackMappings) {
        const trackClip = DOJA_CAT_CLIPS.find(
          (clip) => clip.startTime === track.startTime,
        );
        if (!trackClip) continue;

        const nextTrack = trackMappings[trackMappings.indexOf(track) + 1];
        const trackEndPercentage = nextTrack ? nextTrack.startPercentage : 1.0;

        // use wrapped percentage to find the correct track
        if (
          wrappedPercent >= trackClip.startPercentage &&
          wrappedPercent <= trackEndPercentage
        ) {
          return { track, trackClip, trackEndPercentage, wrappedPercent };
        }
      }
      return null;
    },
    [trackMappings],
  );

  /* === DRAG HANDLERS === */

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // capture the current music-driven position
      const musicPosition = calculateMusicDrivenPosition();
      setDragStartPosition(musicPosition);

      setIsDraggingText(true);
      setTextDragStart(e.clientX);
      setTextDragCurrent(e.clientX);
      lastDragX.current = e.clientX;
      hasTrackedSpinRef.current = false;

      // start disco ball drag
      if (canvasRef?.current) {
        canvasRef.current.startDrag();
      }

      e.preventDefault();
    },
    [calculateMusicDrivenPosition, canvasRef],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingText) return;
      setTextDragCurrent(e.clientX);

      // update disco ball rotation
      const incrementalDeltaX = e.clientX - lastDragX.current;
      if (canvasRef?.current) {
        canvasRef.current.updateDrag(incrementalDeltaX);
      }
      // Track once per gesture: fire only on first meaningful direction
      if (!hasTrackedSpinRef.current) {
        if (incrementalDeltaX > 1) {
          trackCategory("discoball_spin_forward");
          hasTrackedSpinRef.current = true;
        } else if (incrementalDeltaX < -1) {
          trackCategory("discoball_spin_backwards");
          hasTrackedSpinRef.current = true;
        }
      }
      lastDragX.current = e.clientX;

      e.preventDefault();
    },
    [isDraggingText, canvasRef],
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingText) {
      // calculate what percentage the red line is at after drag
      const currentStringPercent = getCurrentStringPercentage();

      // find which track should be playing at this percentage
      const targetTrack = findTargetTrack(currentStringPercent);

      // seek music to match the text position
      if (targetTrack && onSeekToTime) {
        const { track, trackClip, trackEndPercentage, wrappedPercent } =
          targetTrack;
        const trackPercentageRange =
          trackEndPercentage - trackClip.startPercentage;
        const progressInTrack =
          (wrappedPercent - trackClip.startPercentage) / trackPercentageRange;
        const targetTime = track.startTime + progressInTrack * track.duration;

        onSeekToTime(targetTime);
      }

      // End disco ball drag
      if (canvasRef?.current) {
        canvasRef.current.endDrag();
      }

      // clean up
      setIsDraggingText(false);
      setTextDragStart(0);
      setTextDragCurrent(0);
      hasTrackedSpinRef.current = false;
    }
  }, [
    isDraggingText,
    getCurrentStringPercentage,
    findTargetTrack,
    onSeekToTime,
    canvasRef,
  ]);

  // touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // capture the current music-driven position
      const musicPosition = calculateMusicDrivenPosition();
      setDragStartPosition(musicPosition);

      setIsDraggingText(true);
      setTextDragStart(e.touches[0].clientX);
      setTextDragCurrent(e.touches[0].clientX);
      lastDragX.current = e.touches[0].clientX; // Initialize last drag position
      hasTrackedSpinRef.current = false;

      // start disco ball drag
      if (canvasRef?.current) {
        canvasRef.current.startDrag();
      }

      e.preventDefault();
    },
    [calculateMusicDrivenPosition, canvasRef],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingText) return;
      const clientX = e.touches[0].clientX;
      setTextDragCurrent(clientX);

      // update disco ball rotation with incremental deltaX (not cumulative)
      const incrementalDeltaX = clientX - lastDragX.current;
      if (canvasRef?.current) {
        canvasRef.current.updateDrag(incrementalDeltaX);
      }
      if (!hasTrackedSpinRef.current) {
        if (incrementalDeltaX > 1) {
          trackCategory("discoball_spin_forward");
          hasTrackedSpinRef.current = true;
        } else if (incrementalDeltaX < -1) {
          trackCategory("discoball_spin_backwards");
          hasTrackedSpinRef.current = true;
        }
      }
      lastDragX.current = clientX;
    },
    [isDraggingText, canvasRef],
  );

  const handleTouchEnd = useCallback(() => {
    if (isDraggingText) {
      // calculate what percentage the red line is at after drag
      const currentStringPercent = getCurrentStringPercentage();

      // find which track should be playing at this percentage
      const targetTrack = findTargetTrack(currentStringPercent);

      // seek music to match the text position
      if (targetTrack && onSeekToTime) {
        const { track, trackClip, trackEndPercentage, wrappedPercent } =
          targetTrack;
        const trackPercentageRange =
          trackEndPercentage - trackClip.startPercentage;
        const progressInTrack =
          (wrappedPercent - trackClip.startPercentage) / trackPercentageRange;
        const targetTime = track.startTime + progressInTrack * track.duration;

        onSeekToTime(targetTime);
      }

      // End disco ball drag
      if (canvasRef?.current) {
        canvasRef.current.endDrag();
      }

      // clean up
      setIsDraggingText(false);
      setTextDragStart(0);
      setTextDragCurrent(0);
      hasTrackedSpinRef.current = false;
    }
  }, [
    isDraggingText,
    getCurrentStringPercentage,
    findTargetTrack,
    onSeekToTime,
    canvasRef,
  ]);

  // final scroll position
  const scrollOffset = calculateFinalPosition();

  return (
    <div className={css.overlay}>
      <div className={css.centerLine} />
      <div className={css.textMask}>
        <div
          ref={measureRef}
          className={css.textContainer}
          style={{
            transform: `translateX(${scrollOffset}px) translateY(-50%)`,
            cursor: isDraggingText ? "grabbing" : "grab",
            userSelect: "none",
            pointerEvents: "auto",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className={css.textLine} aria-hidden="true">
            {loopedString}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrackTitleOverlay;
