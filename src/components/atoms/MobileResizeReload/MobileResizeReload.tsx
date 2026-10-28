"use client";

import React from "react";

import { isAndroidDevice } from "@/utils/deciveDetection";

export default function MobileResizeReload(): React.ReactElement | null {
  React.useEffect(() => {
    // Only apply resize reload logic to Android phones
    if (!isAndroidDevice()) return;

    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;

    const PIXEL_THRESHOLD = 160; // ignore small chrome/safari UI shifts
    const PERCENT_THRESHOLD = 0.2; // 20%
    const DEBOUNCE_MS = 300;

    let debounceId: number | undefined;

    const shouldReload = () => {
      const widthDelta = Math.abs(window.innerWidth - initialWidth);
      const heightDelta = Math.abs(window.innerHeight - initialHeight);
      const widthPct = widthDelta / Math.max(1, initialWidth);
      const heightPct = heightDelta / Math.max(1, initialHeight);
      return (
        widthDelta >= PIXEL_THRESHOLD ||
        heightDelta >= PIXEL_THRESHOLD ||
        widthPct >= PERCENT_THRESHOLD ||
        heightPct >= PERCENT_THRESHOLD
      );
    };

    const onResize = () => {
      if (debounceId) window.clearTimeout(debounceId);
      debounceId = window.setTimeout(() => {
        if (shouldReload()) {
          window.location.reload();
        }
      }, DEBOUNCE_MS);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (debounceId) window.clearTimeout(debounceId);
    };
  }, []);

  return null;
}
