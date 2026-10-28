"use client";

import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  AssetPreloader,
  type AssetToLoad,
  collectAppAssets,
} from "@/utils/assetPreloader";

export interface HighwayLoadingSceneProps {
  className?: string;
  height?: string | number;
  streakCount?: number;
  baseColor?: string;
  blurFadeAlpha?: number;
  streakLengthPercent?: number;
  /** Vertical band height as a percentage of canvas height that contains streak lanes */
  verticalSpreadPercent?: number;
  /** Horizontal spawn range as % of canvas width to randomise gaps between streaks */
  horizontalSpawnRangePercent?: number;
  speedMin?: number;
  speedVar?: number;
  onLoadComplete?: () => void;
  minLoadDuration?: number;
  assets?: AssetToLoad[];
  /** Easing function to shape mph growth from progress (0-1 -> 0-1) */
  mphEasing?: (t: number) => number;
}

const HighwayLoadingScene = ({
  className,
  height = "90vh",
  streakCount = 4,
  baseColor = "#E41E26",
  blurFadeAlpha = 0.24,
  streakLengthPercent = 40,
  verticalSpreadPercent = 25,
  horizontalSpawnRangePercent = 100,
  speedMin = 12,
  speedVar = 16,
  onLoadComplete,
  minLoadDuration = 5000,
  assets,
  mphEasing,
}: HighwayLoadingSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let heightPx = 0;
    let rafId = 0;
    let running = true;

    type Streak = {
      laneIndex: number;
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      reset: () => void;
      update: () => void;
      draw: () => void;
    };

    const streaks: Streak[] = [];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = canvas.width = Math.max(1, Math.floor(rect.width));
      heightPx = canvas.height = Math.max(1, Math.floor(rect.height));

      // Re-init streaks when canvas size changes
      streaks.length = 0;
      for (let i = 0; i < streakCount; i += 1) {
        streaks.push(createStreak(i));
      }
    };

    const createStreak = (laneIndex: number): Streak => {
      const s: Partial<Streak> = { laneIndex, height: 2 };

      const reset = () => {
        const w = Math.max(1, Math.floor((streakLengthPercent / 100) * width));
        s.width = w;
        const spawnRange =
          (Math.max(0, Math.min(300, horizontalSpawnRangePercent)) / 100) *
          width;
        s.x = -w - Math.random() * spawnRange;
        const spread = Math.max(0, Math.min(100, verticalSpreadPercent));
        const containerHeight = heightPx * (spread / 100);
        const containerTop = (heightPx - containerHeight) / 2;
        const laneHeight = containerHeight / streakCount;
        s.y =
          containerTop +
          laneIndex * laneHeight +
          laneHeight / 2 -
          (s.height || 2) / 2;
        s.speed = Math.random() * speedVar + speedMin;
      };

      const update = () => {
        if (typeof s.x !== "number" || typeof s.speed !== "number") return;
        s.x += s.speed;
        if (s.x > width) reset();
      };

      const draw = () => {
        if (
          typeof s.x !== "number" ||
          typeof s.y !== "number" ||
          typeof s.width !== "number" ||
          typeof s.height !== "number"
        )
          return;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = baseColor;
        ctx.fillRect(s.x, s.y, s.width, s.height);
      };

      s.reset = reset;
      s.update = update;
      s.draw = draw;

      reset();
      return s as Streak;
    };

    const animate = () => {
      if (!running) return;
      ctx.fillStyle = `rgba(0, 0, 0, ${blurFadeAlpha})`;
      ctx.fillRect(0, 0, width, heightPx);

      ctx.globalCompositeOperation = "lighter";
      for (const s of streaks) {
        s.update();
        s.draw();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";

      rafId = requestAnimationFrame(animate);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    animate();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [
    blurFadeAlpha,
    baseColor,
    speedMin,
    speedVar,
    streakCount,
    streakLengthPercent,
    verticalSpreadPercent,
    horizontalSpawnRangePercent,
  ]);

  // Initialize and start asset preloader
  useEffect(() => {
    const preloader = new AssetPreloader({
      minDuration: minLoadDuration,
      onProgress: (progress) => {
        setLoadProgress(progress);
      },
      onComplete: () => {
        onLoadComplete?.();
      },
      debug: process.env.NODE_ENV === "development", // Enable debug logging in development
    });

    // Collect all app assets
    const list = Array.isArray(assets) ? assets : collectAppAssets();
    preloader.addAssets(list);

    // Start preloading
    preloader.start();
  }, [assets, minLoadDuration, onLoadComplete]);

  // MPH odometer animation tied to load progress (max 110)
  // Apply ease-in by default so it's slow at the beginning and speeds up
  const easeInCubic = (t: number) => Math.max(0, Math.min(1, t)) ** 3.5;
  const progressForMph = (mphEasing ?? easeInCubic)(loadProgress);
  const mph = Math.floor(progressForMph * 110);

  const mphDigits = useMemo(() => {
    const clamped = Math.min(110, Math.max(0, mph));
    const str = clamped.toString().padStart(3, "0");
    return str.split("").map((d) => Number(d));
  }, [mph]);

  return (
    <div
      ref={containerRef}
      className={classNames("HighwayLoadingScene", className)}
      style={{ height }}
      aria-label="Highway loading animation"
      role="img"
    >
      <canvas ref={canvasRef} className="HighwayLoadingScene__canvas" />
      <div className="HighwayLoadingScene__loading headline--h5">LOADING</div>
      <div className="HighwayLoadingScene__mph headline--h1" aria-live="polite">
        <span className="screen-reader-only">{mph} miles per hour</span>
        <div className="HighwayLoadingScene__odometer" aria-hidden>
          {mphDigits.map((digit, idx) => (
            <div className="HighwayLoadingScene__odometer-column" key={idx}>
              <div
                className="HighwayLoadingScene__odometer-strip"
                style={{ transform: `translateY(-${digit * 10}%)` }}
              >
                {Array.from({ length: 10 }).map((_, n) => (
                  <div className="HighwayLoadingScene__odometer-digit" key={n}>
                    {n}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <span className="HighwayLoadingScene__mph-unit">MPH</span>
      </div>
    </div>
  );
};

export default HighwayLoadingScene;
