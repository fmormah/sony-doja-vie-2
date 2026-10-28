"use client";

import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";

import { MUSIC_CONFIG } from "@/config/musicTracks";
import { isIOSDevice } from "@/utils/deciveDetection";
import { soundManager } from "@/utils/SoundManager";

export interface MusicManagerState {
  isLoaded: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface MusicManagerActions {
  play: () => void;
  pause: () => void;
  stop: () => void;
  fadeIn: () => void;
  fadeOut: () => void;
  seekToTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export const useMusicManager = (options?: {
  enabled?: boolean;
}): MusicManagerState & MusicManagerActions => {
  const enabled = options?.enabled ?? true;
  const soundRef = useRef<Howl | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(MUSIC_CONFIG.defaultVolume);

  const SOUND_ID = "disco-ball-concat";
  const isIOS = isIOSDevice();

  // initialize shared Howl instance via soundManager
  useEffect(() => {
    const sound = soundManager.ensureLoaded(SOUND_ID, MUSIC_CONFIG.filePath, {
      volume: MUSIC_CONFIG.defaultVolume,
      preload: true,
      loop: true,
      // On iOS, use HTML5 audio to stream the long track and avoid full decode
      html5: isIOS,
    });

    sound.once("load", () => {
      setIsLoaded(true);
      setDuration(sound.duration());
    });

    sound.on("play", () => {
      setIsPlaying(true);
    });

    sound.on("pause", () => {
      setIsPlaying(false);
    });

    sound.on("stop", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    soundRef.current = sound;

    return () => {
      sound.off();
      // Unload from manager on unmount to release resources
      soundManager.unload(SOUND_ID);
      soundRef.current = null;
    };
  }, [isIOS]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // only run updates if enabled (disco ball is zoomed) and playing
    if (isPlaying && enabled) {
      // Slightly relax polling interval on iOS to reduce CPU/battery
      const pollMs = isIOS ? 120 : 50;
      intervalId = setInterval(() => {
        // skip update if tab is hidden (saves CPU/battery)
        if (document.visibilityState === "hidden") {
          return;
        }

        const s = soundRef.current;
        if (s && s.playing()) {
          const seek = s.seek() as number;
          // validate the seek value before setting state
          if (typeof seek === "number" && !isNaN(seek) && isFinite(seek)) {
            setCurrentTime(seek);
          }
        }
      }, pollMs);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, enabled, isIOS]);

  // keep Howl volume in sync
  useEffect(() => {
    const s = soundRef.current;
    if (!s) return;
    s.volume(volume);
  }, [volume]);

  const play = useCallback(() => {
    const s = soundRef.current;
    if (!s || !isLoaded) return;
    // prevent overlap with any existing primary audio
    soundManager.stopStream("primary");
    // loaded with loop=true; play will route to primary (default) on 'play'
    s.play();
  }, [isLoaded]);

  const pause = useCallback(() => {
    const s = soundRef.current;
    if (!s) return;
    s.pause();
  }, []);

  const stop = useCallback(() => {
    const s = soundRef.current;
    if (!s) return;
    s.stop();
  }, []);

  const fadeIn = useCallback(() => {
    const s = soundRef.current;
    if (!s || !isLoaded) return;

    if (s.playing()) {
      // already playing: fade up from current volume
      const from = s.volume();
      s.fade(from, volume, MUSIC_CONFIG.fadeInDuration);
    } else {
      // stop anything on primary, then start at 0 and fade in
      soundManager.stopStream("primary");
      s.volume(0);
      const id = s.play();
      s.fade(0, volume, MUSIC_CONFIG.fadeInDuration, id);
    }
  }, [isLoaded, volume]);

  const fadeOut = useCallback(() => {
    const s = soundRef.current;
    if (!s || !s.playing()) return;

    const current = s.volume();
    s.once("fade", () => {
      if (s.volume() <= 0.02) {
        s.pause();
      }
    });
    s.fade(current, 0, MUSIC_CONFIG.fadeOutDuration);
  }, []);

  const seekToTime = useCallback(
    (time: number) => {
      const s = soundRef.current;
      if (!s || !isLoaded) return;

      // clamp time to valid range
      const clampedTime = Math.max(0, Math.min(duration, time));
      s.seek(clampedTime);
      setCurrentTime(clampedTime);
    },
    [isLoaded, duration],
  );

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      const s = soundRef.current;
      if (!s || !isLoaded) return;

      // clamp rate between 0.5 and 3.0 for playback speeds
      const clampedRate = Math.max(0.5, Math.min(3.0, rate));
      s.rate(clampedRate);
    },
    [isLoaded],
  );

  return {
    isLoaded,
    isPlaying,
    currentTime,
    duration,
    volume,

    play,
    pause,
    stop,
    fadeIn,
    fadeOut,
    seekToTime,
    setVolume,
    setPlaybackRate,
  };
};
