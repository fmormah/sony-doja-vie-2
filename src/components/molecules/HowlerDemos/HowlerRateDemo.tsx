"use client";

import { Howl } from "howler";
import { useEffect, useMemo, useRef, useState } from "react";

export interface HowlerRateDemoProps {
  src?: string;
  initialVolume?: number;
  initialRate?: number;
}

const HowlerRateDemo = ({
  src = "/assets/music/sample-3.mp3",
  initialVolume = 0.8,
  initialRate = 1,
}: HowlerRateDemoProps) => {
  const soundRef = useRef<Howl | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [rate, setRate] = useState<number>(initialRate);

  useEffect(() => {
    const sound = new Howl({
      src: [src],
      volume: initialVolume,
      rate: initialRate,
      preload: true,
    });
    sound.once("load", () => setIsLoaded(true));
    sound.on("play", () => setIsPlaying(true));
    sound.on("pause", () => setIsPlaying(false));
    sound.on("stop", () => setIsPlaying(false));
    soundRef.current = sound;
    return () => {
      sound.off();
      sound.unload();
      soundRef.current = null;
    };
  }, [src, initialVolume, initialRate]);

  useEffect(() => {
    const s = soundRef.current;
    if (!s) return;
    s.volume(volume);
  }, [volume]);

  useEffect(() => {
    const s = soundRef.current;
    if (!s) return;
    // Apply to current and future playbacks
    s.rate(rate);
  }, [rate]);

  const canInteract = useMemo(() => isLoaded && !!soundRef.current, [isLoaded]);

  const handlePlay = () => soundRef.current?.play();
  const handlePause = () => soundRef.current?.pause();
  const handleStop = () => soundRef.current?.stop();

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <div className="headline--h5">Howler Playback Rate</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={handlePlay} disabled={!canInteract}>
          Play
        </button>
        <button onClick={handlePause} disabled={!canInteract || !isPlaying}>
          Pause
        </button>
        <button onClick={handleStop} disabled={!canInteract}>
          Stop
        </button>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Volume: {volume.toFixed(2)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Rate: {rate.toFixed(2)}x</span>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.01}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>
        <div style={{ color: "#666" }}>
          Tip: Playback rate changes affect pitch in most browsers.
        </div>
      </div>
      <div style={{ color: "#666" }}>
        Status: {isLoaded ? (isPlaying ? "Playing" : "Idle") : "Loading..."}
      </div>
    </div>
  );
};

export default HowlerRateDemo;
