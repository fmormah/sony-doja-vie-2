"use client";

import { Howl } from "howler";
import { useEffect, useMemo, useRef, useState } from "react";

export interface HowlerFadeDemoProps {
  src?: string;
  initialVolume?: number;
}

const HowlerFadeDemo = ({
  src = "/assets/music/sample-1.mp3",
  initialVolume = 0.8,
}: HowlerFadeDemoProps) => {
  const soundRef = useRef<Howl | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [fadeMs, setFadeMs] = useState<number>(1500);

  // Initialize Howl
  useEffect(() => {
    const sound = new Howl({
      src: [src],
      volume: initialVolume,
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
  }, [src, initialVolume]);

  // Keep Howl volume in sync
  useEffect(() => {
    const s = soundRef.current;
    if (!s) return;
    s.volume(volume);
  }, [volume]);

  const canInteract = useMemo(() => isLoaded && !!soundRef.current, [isLoaded]);

  const handlePlay = () => {
    const s = soundRef.current;
    if (!s) return;
    s.play();
  };

  const handlePause = () => {
    soundRef.current?.pause();
  };

  const handleStop = () => {
    soundRef.current?.stop();
  };

  const handleFadeIn = () => {
    const s = soundRef.current;
    if (!s) return;
    const to = volume;
    if (s.playing()) {
      // Already playing: just fade up from current volume
      const from = s.volume();
      s.fade(from, to, Math.max(0, fadeMs));
    } else {
      // Not playing: start at 0 and fade in the new instance
      s.volume(0);
      const id = s.play();
      s.fade(0, to, Math.max(0, fadeMs), id);
    }
  };

  const handleFadeOut = () => {
    const s = soundRef.current;
    if (!s) return;
    if (!s.playing()) return;
    const current = s.volume();
    s.once("fade", () => {
      if (s.volume() <= 0.02) s.pause();
    });
    s.fade(current, 0, Math.max(0, fadeMs));
  };

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
      <div className="headline--h5">Howler Fade In / Out</div>
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
          <span>Fade duration (ms): {fadeMs}</span>
          <input
            type="range"
            min={0}
            max={50000}
            step={100}
            value={fadeMs}
            onChange={(e) => setFadeMs(Number(e.target.value))}
          />
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleFadeIn} disabled={!canInteract}>
            Fade In
          </button>
          <button onClick={handleFadeOut} disabled={!canInteract || !isPlaying}>
            Fade Out
          </button>
        </div>
      </div>
      <div style={{ color: "#666" }}>
        Status: {isLoaded ? (isPlaying ? "Playing" : "Idle") : "Loading..."}
      </div>
      <div style={{ fontSize: "12px", color: "#999", marginTop: 8 }}>
        💡 Tip: Fade In starts from volume 0. Fade Out gradually reduces to 0
        and pauses.
      </div>
    </div>
  );
};

export default HowlerFadeDemo;
