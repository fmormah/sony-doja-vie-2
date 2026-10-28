"use client";

import { Howl } from "howler";
import { useEffect, useMemo, useRef, useState } from "react";

export interface HowlerPlaylistDemoProps {
  tracks?: { id: string; title: string; src: string }[];
}

const DEFAULT_TRACKS: { id: string; title: string; src: string }[] = [
  { id: "t1", title: "Sample 1", src: "/assets/music/sample-1.mp3" },
  { id: "t2", title: "Sample 2", src: "/assets/music/sample-2.mp3" },
  { id: "t3", title: "Sample 3", src: "/assets/music/sample-3.mp3" },
];

const HowlerPlaylistDemo = ({
  tracks = DEFAULT_TRACKS,
}: HowlerPlaylistDemoProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [seek, setSeek] = useState<number>(0);
  const soundRef = useRef<Howl | null>(null);

  const loadTrack = (index: number) => {
    const track = tracks[index];
    if (!track) return;
    // Unload previous
    if (soundRef.current) {
      soundRef.current.off();
      soundRef.current.unload();
      soundRef.current = null;
    }
    const sound = new Howl({ src: [track.src], preload: true, html5: false });
    sound.once("load", () => {
      setIsLoaded(true);
      setDuration(sound.duration());
    });
    sound.on("play", () => setIsPlaying(true));
    sound.on("pause", () => setIsPlaying(false));
    sound.on("stop", () => setIsPlaying(false));
    sound.on("end", () => {
      // Auto-advance
      next();
    });
    soundRef.current = sound;
  };

  useEffect(() => {
    loadTrack(currentIndex);
    return () => {
      if (soundRef.current) {
        soundRef.current.off();
        soundRef.current.unload();
        soundRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Poll progress while playing
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

  const play = () => soundRef.current?.play();
  const pause = () => soundRef.current?.pause();
  const stop = () => soundRef.current?.stop();

  const previous = () => {
    setIsLoaded(false);
    setSeek(0);
    setDuration(0);
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
  };

  const next = () => {
    setIsLoaded(false);
    setSeek(0);
    setDuration(0);
    setCurrentIndex((i) => (i + 1) % tracks.length);
  };

  const selectTrack = (index: number) => {
    setIsLoaded(false);
    setSeek(0);
    setDuration(0);
    setCurrentIndex(index);
  };

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

  const current = tracks[currentIndex];

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 600 }}>
      <div className="headline--h5">Howler Playlist</div>
      <div style={{ color: "#888" }}>Current: {current?.title}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={previous} disabled={tracks.length <= 1}>
          Prev
        </button>
        <button onClick={play} disabled={!canInteract}>
          Play
        </button>
        <button onClick={pause} disabled={!canInteract}>
          Pause
        </button>
        <button onClick={stop} disabled={!canInteract}>
          Stop
        </button>
        <button onClick={next} disabled={tracks.length <= 1}>
          Next
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
            disabled={!canInteract}
          />
        </label>
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        <div>Track List</div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 4,
          }}
        >
          {tracks.map((t, i) => (
            <li key={t.id}>
              <button
                onClick={() => selectTrack(i)}
                aria-pressed={i === currentIndex}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: i === currentIndex ? "#eee" : undefined,
                }}
              >
                {t.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ color: "#666" }}>
        Status: {isLoaded ? (isPlaying ? "Playing" : "Idle") : "Loading..."}
      </div>
      <div style={{ fontSize: "12px", color: "#999", marginTop: 8 }}>
        💡 Tip: Tracks auto-advance when finished. Click any track in the list
        to jump to it.
      </div>
    </div>
  );
};

export default HowlerPlaylistDemo;
