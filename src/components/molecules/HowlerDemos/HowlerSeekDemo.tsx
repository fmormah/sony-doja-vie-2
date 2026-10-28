"use client";

import { Howl } from "howler";
import { useEffect, useMemo, useRef, useState } from "react";

export interface HowlerSeekDemoProps {
  src?: string;
}

const HowlerSeekDemo = ({
  src = "/assets/music/sample-1.mp3",
}: HowlerSeekDemoProps) => {
  const soundRef = useRef<Howl | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [seek, setSeek] = useState<number>(0);

  useEffect(() => {
    const sound = new Howl({ src: [src], preload: true });
    sound.once("load", () => {
      setIsLoaded(true);
      setDuration(sound.duration());
    });
    sound.on("play", () => setIsPlaying(true));
    sound.on("pause", () => setIsPlaying(false));
    sound.on("stop", () => setIsPlaying(false));
    soundRef.current = sound;
    return () => {
      sound.off();
      sound.unload();
      soundRef.current = null;
    };
  }, [src]);

  // Poll current position while playing
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const s = soundRef.current;
      if (s && s.playing()) {
        setSeek(s.seek() as number);
        raf = requestAnimationFrame(update);
      }
    };
    if (isPlaying) raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  const canInteract = useMemo(() => isLoaded && !!soundRef.current, [isLoaded]);

  const handlePlay = () => soundRef.current?.play();
  const handlePause = () => soundRef.current?.pause();
  const handleStop = () => soundRef.current?.stop();

  const handleSeek = (value: number) => {
    const s = soundRef.current;
    if (!s) return;
    s.seek(value);
    setSeek(value);
  };

  const fmt = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <div className="headline--h5">Howler Seek Within Track</div>
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
          <span>
            Position: {fmt(seek)} / {fmt(duration)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0.01, duration)}
            step={0.01}
            value={Math.min(seek, duration)}
            onChange={(e) => handleSeek(Number(e.target.value))}
          />
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => handleSeek(0)} disabled={!canInteract}>
            Jump to Start
          </button>
          <button
            onClick={() => handleSeek(Math.max(0, (duration || 0) / 2))}
            disabled={!canInteract}
          >
            Jump to Middle
          </button>
          <button
            onClick={() => handleSeek(Math.max(0, (duration || 0) - 5))}
            disabled={!canInteract}
          >
            -5s from End
          </button>
        </div>
      </div>
      <div style={{ color: "#666" }}>
        Status: {isLoaded ? (isPlaying ? "Playing" : "Idle") : "Loading..."}
      </div>
      <div style={{ fontSize: "12px", color: "#999", marginTop: 8 }}>
        💡 Tip: Use the slider or buttons to jump to different points in the
        track.
      </div>
    </div>
  );
};

export default HowlerSeekDemo;
