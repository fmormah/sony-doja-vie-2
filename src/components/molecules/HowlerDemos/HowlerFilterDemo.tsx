"use client";

import { Howl, Howler } from "howler";
import { useEffect, useMemo, useRef, useState } from "react";

type FilterType = "none" | "lowpass" | "highpass";

export interface HowlerFilterDemoProps {
  src?: string;
  initialVolume?: number;
}

const HowlerFilterDemo = ({
  src = "/assets/music/Jealous Type [Main].mp3",
  initialVolume = 0.8,
}: HowlerFilterDemoProps) => {
  const soundRef = useRef<Howl | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [filterType, setFilterType] = useState<FilterType>("none");
  const [frequency, setFrequency] = useState<number>(1000);
  const [q, setQ] = useState<number>(1);

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

  // Setup or teardown global filter chain
  useEffect(() => {
    if (!Howler.usingWebAudio) return;
    const ctx = Howler.ctx;
    const master = (Howler as unknown as { masterGain: GainNode }).masterGain;

    // Helper to restore default chain master -> destination
    const restore = () => {
      try {
        master.disconnect();
      } catch {}
      master.connect(ctx.destination);
    };

    if (filterType === "none") {
      // Remove filter if any
      if (filterRef.current) {
        try {
          filterRef.current.disconnect();
        } catch {}
        filterRef.current = null;
      }
      restore();
      return;
    }

    // Create or reconfigure the filter node
    const filter = filterRef.current ?? ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;

    // Wire: master -> filter -> destination
    try {
      master.disconnect();
    } catch {}
    try {
      filter.disconnect();
    } catch {}
    master.connect(filter);
    filter.connect(ctx.destination);
    filterRef.current = filter;

    return () => {
      // On unmount or change, clean up
      try {
        filter.disconnect();
      } catch {}
      restore();
    };
  }, [filterType, frequency, q]);

  // On unmount, ensure restore
  useEffect(() => {
    return () => {
      if (!Howler.usingWebAudio) return;
      const ctx = Howler.ctx;
      const master = (Howler as unknown as { masterGain: GainNode }).masterGain;
      try {
        if (filterRef.current) filterRef.current.disconnect();
      } catch {}
      try {
        master.disconnect();
      } catch {}
      master.connect(ctx.destination);
    };
  }, []);

  const canInteract = useMemo(() => isLoaded && !!soundRef.current, [isLoaded]);

  const handlePlay = () => soundRef.current?.play();
  const handlePause = () => soundRef.current?.pause();
  const handleStop = () => soundRef.current?.stop();

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <div className="headline--h5">Howler Low/High Pass Filter (global)</div>
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterType("none")}
            aria-pressed={filterType === "none"}
          >
            No Filter
          </button>
          <button
            onClick={() => setFilterType("lowpass")}
            aria-pressed={filterType === "lowpass"}
          >
            Low Pass
          </button>
          <button
            onClick={() => setFilterType("highpass")}
            aria-pressed={filterType === "highpass"}
          >
            High Pass
          </button>
        </div>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Frequency: {Math.round(frequency)} Hz</span>
          <input
            type="range"
            min={100}
            max={16000}
            step={10}
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            disabled={filterType === "none"}
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Q: {q.toFixed(2)}</span>
          <input
            type="range"
            min={0.1}
            max={20}
            step={0.1}
            value={q}
            onChange={(e) => setQ(Number(e.target.value))}
            disabled={filterType === "none"}
          />
        </label>
      </div>
      <div style={{ color: "#666" }}>
        Status: {isLoaded ? (isPlaying ? "Playing" : "Idle") : "Loading..."}
      </div>
      <div style={{ fontSize: "12px", color: "#999", marginTop: 8 }}>
        💡 Tip: Low Pass filters out high frequencies (muffled sound). High Pass
        filters out low frequencies (tinny sound).
      </div>
    </div>
  );
};

export default HowlerFilterDemo;
