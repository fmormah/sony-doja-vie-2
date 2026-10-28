import { Howl, Howler, HowlOptions } from "howler";

// Maximum stream gain multiplier (used for boosting secondary/phone stream)
const STREAM_GAIN_MAX = 10;

type StreamId = "primary" | "secondary";
type StreamMode = "outside" | "inside" | "phone";

export type SoundMap = Record<string, Howl>;

interface StreamConfig {
  id: StreamId;
  mode: StreamMode;
  gainNode: GainNode | null;
  filterNode: BiquadFilterNode | null;
  volume?: number;
}

const DEFAULTS = {
  outside: { type: "lowpass" as BiquadFilterType, frequency: 300, q: 10 },
  inside: { type: "none" as const, frequency: 0, q: 0 },
  // Allow typical call tones (~400–480 Hz) to pass
  phone: { type: "highpass" as BiquadFilterType, frequency: 300, q: 1 },
};

function getMasterGain(): GainNode | null {
  try {
    return (Howler as unknown as { masterGain?: GainNode }).masterGain ?? null;
  } catch {
    return null;
  }
}

export class SoundManager {
  private sounds: SoundMap = {};
  private muted = false;
  private streams: Record<StreamId, StreamConfig> = {
    primary: {
      id: "primary",
      mode: "outside",
      gainNode: null,
      filterNode: null,
      volume: 1,
    },
    secondary: {
      id: "secondary",
      mode: "outside",
      gainNode: null,
      filterNode: null,
      volume: 1,
    },
  };
  // Track routing for active sound ids -> stream
  private soundIdToStream: Map<number, StreamId> = new Map();
  // Track ducking state
  private duckCounter = 0;
  private primaryVolumeBeforeDuck = 1;
  private secondaryVolumeBeforeBoost = 1;
  // Track paused primary sounds during phone/secondary playback
  private pausedPrimary: Map<number, Howl> = new Map();

  private ensureStreamNodes(streamId: StreamId) {
    if (!Howler.usingWebAudio) return; // filters require WebAudio
    const ctx = Howler.ctx;
    const master = getMasterGain();
    if (!master) return;

    const stream = this.streams[streamId];
    if (!stream.gainNode) {
      stream.gainNode = ctx.createGain();
    }
    // Keep gain in sync with stream volume
    try {
      stream.gainNode.gain.value = Math.max(
        0,
        Math.min(STREAM_GAIN_MAX, stream.volume ?? 1),
      );
    } catch {}

    // Update filter node per mode
    const cfg = DEFAULTS[stream.mode];
    const needsFilter = cfg.type !== "none";
    if (needsFilter) {
      if (!stream.filterNode) stream.filterNode = ctx.createBiquadFilter();
      stream.filterNode.type = cfg.type as BiquadFilterType;
      stream.filterNode.frequency.value = cfg.frequency;
      stream.filterNode.Q.value = cfg.q;
    } else {
      // Remove filter if present
      if (stream.filterNode) {
        try {
          stream.filterNode.disconnect();
        } catch {}
        stream.filterNode = null;
      }
    }

    // Rewire chain: streamGain -> (optional filter) -> master
    try {
      stream.gainNode.disconnect();
    } catch {}
    if (stream.filterNode) {
      try {
        stream.filterNode.disconnect();
      } catch {}
      stream.gainNode.connect(stream.filterNode);
      stream.filterNode.connect(master);
    } else {
      stream.gainNode.connect(master);
    }
  }

  getStreamVolume(streamId: StreamId): number {
    return this.streams[streamId]?.volume ?? 1;
  }

  setStreamVolume(streamId: StreamId, volume: number) {
    const stream = this.streams[streamId];
    if (!stream) return;
    stream.volume = Math.max(0, Math.min(STREAM_GAIN_MAX, volume));
    if (stream.gainNode) {
      try {
        stream.gainNode.gain.value = stream.volume;
      } catch {}
    }
  }

  private routeSoundToStream(howl: Howl, soundId: number, streamId: StreamId) {
    if (!Howler.usingWebAudio) return; // cannot route in HTML5 mode
    const stream = this.streams[streamId];
    if (!stream) return;
    this.ensureStreamNodes(streamId);
    const master = getMasterGain();
    if (!master || !stream.gainNode) return;
    try {
      const anyHowl = howl as unknown as {
        _soundById: (id: number) => { _node?: AudioNode | null } | null;
      };
      const snd = anyHowl._soundById(soundId);
      const node = snd && (snd as unknown as { _node?: unknown })._node;
      const isAudioNodeLike =
        !!node &&
        typeof (node as { connect?: unknown }).connect === "function" &&
        typeof (node as { disconnect?: unknown }).disconnect === "function";
      if (isAudioNodeLike) {
        try {
          // Detach from previous chain (likely master)
          (node as AudioNode).disconnect();
        } catch {}
        // Attach to stream gain
        try {
          (node as AudioNode).connect(stream.gainNode);
        } catch {}
        this.soundIdToStream.set(soundId, streamId);
      }
    } catch {
      // no-op; best-effort routing
    }
  }

  setStreamMode(streamId: StreamId, mode: StreamMode) {
    const stream = this.streams[streamId];
    if (!stream) return;
    stream.mode = mode;
    this.ensureStreamNodes(streamId);
  }

  /**
   * Smoothly transition the primary stream from the "outside" filtered sound
   * to the unfiltered "inside" state by opening the low-pass cutoff over time.
   * Falls back to an immediate switch if WebAudio is not available.
   */
  fadePrimaryOutsideToInside(durationMs = 3000) {
    const streamId: StreamId = "primary";
    if (!Howler.usingWebAudio) {
      this.setStreamMode(streamId, "inside");
      return;
    }

    // Ensure we are in outside mode with a filter in place
    this.setStreamMode(streamId, "outside");
    const stream = this.streams[streamId];
    const ctx = Howler.ctx;
    if (!stream || !ctx) {
      this.setStreamMode(streamId, "inside");
      return;
    }

    this.ensureStreamNodes(streamId);
    const filter = stream.filterNode;
    if (!filter) {
      // No filter available; just switch immediately
      this.setStreamMode(streamId, "inside");
      return;
    }

    const now = ctx.currentTime;
    const dur = Math.max(0.001, durationMs / 1000);

    try {
      // Start from current frequency or default outside cutoff, ramp to a very high value
      const startFreq = Math.max(
        10,
        filter.frequency.value || DEFAULTS.outside.frequency,
      );
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.setValueAtTime(startFreq, now);
      filter.frequency.linearRampToValueAtTime(20000, now + dur);

      // Loosen Q to avoid resonance during the sweep
      const startQ = filter.Q.value;
      filter.Q.cancelScheduledValues(now);
      filter.Q.setValueAtTime(startQ, now);
      filter.Q.linearRampToValueAtTime(0.707, now + dur);
    } catch {}

    // After the ramp completes, fully switch to inside (no filter) to clean up
    window.setTimeout(() => {
      this.setStreamMode(streamId, "inside");
    }, durationMs);
  }

  getStreamMode(streamId: StreamId): StreamMode | undefined {
    return this.streams[streamId]?.mode;
  }

  load(id: string, src: string | string[], options?: Omit<HowlOptions, "src">) {
    if (this.sounds[id]) return this.sounds[id];
    const sound = new Howl({
      src: Array.isArray(src) ? src : [src],
      html5: false, // ensure WebAudio so we can route nodes
      preload: true,
      ...options,
    });
    // Attach a play listener to attempt routing when used via plain play()
    sound.on("play", (id) => {
      // Default to primary unless caller routes explicitly later
      this.routeSoundToStream(sound, id, "primary");
    });
    this.sounds[id] = sound;
    return sound;
  }

  get(id: string): Howl | undefined {
    return this.sounds[id];
  }

  play(id: string) {
    const s = this.sounds[id];
    if (s) s.play();
  }

  playOnStream(
    streamId: StreamId,
    id: string,
    opts?: {
      loop?: boolean;
      volume?: number;
      rate?: number;
      onEnd?: () => void;
    },
  ) {
    const s = this.sounds[id];
    if (!s) return;
    // Avoid spawning duplicate concurrent instances of the same Howl
    if (s.playing()) {
      this.ensureStreamNodes(streamId);
      return;
    }
    if (typeof opts?.loop === "boolean") s.loop(opts.loop);
    if (typeof opts?.volume === "number") s.volume(opts.volume);
    // Route on play
    const handler = (soundId: number) => {
      if (typeof opts?.rate === "number") {
        try {
          s.rate(opts.rate, soundId);
        } catch {}
      }
      this.routeSoundToStream(s, soundId, streamId);
      if (opts?.onEnd) {
        s.once("end", opts.onEnd, soundId);
      }
    };
    s.once("play", handler);
    s.play();
  }

  stop(id: string) {
    const s = this.sounds[id];
    if (s) s.stop();
  }

  stopStream(streamId: StreamId) {
    // Best-effort: stop any sounds currently routed to this stream
    this.soundIdToStream.forEach((sidStream, soundId) => {
      if (sidStream !== streamId) return;
      // We don't know which Howl the id belongs to; stop all Howls that contain it
      Object.values(this.sounds).forEach((howl) => {
        try {
          const anyHowl = howl as unknown as {
            _soundById: (id: number) => object | null;
          };
          if (anyHowl._soundById(soundId)) {
            howl.stop(soundId);
          }
        } catch {}
      });
      this.soundIdToStream.delete(soundId);
    });
    // If stopping secondary (phone), restore ducking state
    if (streamId === "secondary") {
      this.duckCounter = 0;
      this.setStreamVolume("primary", this.primaryVolumeBeforeDuck);
      this.setStreamVolume("secondary", this.secondaryVolumeBeforeBoost);
      // Resume any previously paused primary sounds
      this.resumePrimaryFromPaused();
    }
  }

  /**
   * Stop all audio across both streams immediately and reset ducking/boosting.
   * Does not unload sounds. Intended for hard resets when changing scenes/UI.
   */
  stopAll() {
    // Stop every Howl instance managed by this SoundManager
    Object.values(this.sounds).forEach((howl) => {
      try {
        howl.stop();
      } catch {}
    });

    // Clear routing and paused state tracking
    this.soundIdToStream.clear();
    this.pausedPrimary.clear();

    // Reset ducking/boosting state
    this.duckCounter = 0;
    this.setStreamVolume("primary", this.primaryVolumeBeforeDuck);
    this.setStreamVolume("secondary", this.secondaryVolumeBeforeBoost);

    // Ensure secondary is no longer in phone mode to avoid residual filters
    this.setStreamMode("secondary", "outside");
  }

  /**
   * Deep cleanup of audio resources to free memory.
   * Useful for preventing memory leaks on mobile devices, especially iOS.
   */
  deepCleanup() {
    // First stop all sounds
    this.stopAll();

    // Unload all sounds to free memory
    const soundIds = Object.keys(this.sounds);
    soundIds.forEach((id) => {
      try {
        const sound = this.sounds[id];
        if (sound) {
          sound.unload();
        }
      } catch (e) {
        console.warn(`[SoundManager] Error unloading sound ${id}:`, e);
      }
    });

    // Clear the sounds object
    this.sounds = {};

    // Reset Howler global state if needed
    try {
      // This helps clear any internal Howler caches
      Howler.unload();
    } catch (e) {
      console.warn("[SoundManager] Error resetting Howler:", e);
    }
  }

  unload(id: string) {
    const s = this.sounds[id];
    if (s) s.unload();
    delete this.sounds[id];
  }

  getSoundIds(): string[] {
    return Object.keys(this.sounds);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    Howler.mute(muted);
  }

  isMuted() {
    return this.muted;
  }

  // High-level helpers for this app's flows
  ensureLoaded(
    id: string,
    src: string | string[],
    options?: Omit<HowlOptions, "src">,
  ) {
    return this.sounds[id] ?? this.load(id, src, options);
  }

  private async waitForHowlLoad(h: Howl): Promise<void> {
    return new Promise((resolve) => {
      if (h.state() === "loaded") return resolve();
      h.once("load", () => resolve());
    });
  }

  playPrimarySequenceOnceThenLoop(
    introId: string,
    introSrc: string | string[],
    loopId: string,
    loopSrc: string | string[],
    volume = 1,
  ) {
    this.ensureLoaded(introId, introSrc, { volume, loop: false });
    this.ensureLoaded(loopId, loopSrc, { volume, loop: true });

    const loop = this.get(loopId)!;
    // If the loop track is already playing, don't start another
    if (loop.playing()) {
      return;
    }

    // Stop anything currently on the primary stream to prevent overlap
    this.stopStream("primary");

    // Play intro on primary, then start loop on end
    this.playOnStream("primary", introId, {
      loop: false,
      volume,
      onEnd: () => {
        this.playOnStream("primary", loopId, { loop: true, volume });
      },
    });
  }

  async playPrimaryIntroMatchDurationThenLoop(
    introId: string,
    introSrc: string | string[],
    loopId: string,
    loopSrc: string | string[],
    targetSeconds: number,
    volume = 1,
  ) {
    if (!isFinite(targetSeconds) || targetSeconds <= 0) {
      this.playPrimarySequenceOnceThenLoop(
        introId,
        introSrc,
        loopId,
        loopSrc,
        volume,
      );
      return;
    }

    this.ensureLoaded(introId, introSrc, { volume, loop: false });
    this.ensureLoaded(loopId, loopSrc, { volume, loop: true });

    const intro = this.get(introId)!;
    const loop = this.get(loopId)!;
    if (loop.playing()) return;

    await this.waitForHowlLoad(intro);
    const introDur = intro.duration();
    let rate = introDur > 0 ? introDur / targetSeconds : 1;
    rate = Math.max(0.5, Math.min(2.0, rate));

    this.stopStream("primary");

    // Temporarily disable filters for the intro (no low/high pass)
    const prevMode = this.getStreamMode("primary") ?? "outside";
    this.setStreamMode("primary", "inside");

    this.playOnStream("primary", introId, {
      loop: false,
      volume,
      rate,
      onEnd: () => {
        // Restore previous stream mode before starting the loop
        this.setStreamMode("primary", prevMode);
        this.playOnStream("primary", loopId, { loop: true, volume });
      },
    });
  }

  playPhoneOnce(id: string, src: string | string[], volume = 1) {
    this.setStreamMode("secondary", "phone");
    this.ensureLoaded(id, src, { volume, loop: false });
    // Duck primary to 1/100 of phone level while phone audio is active
    const prevPrimary = this.getStreamVolume("primary");
    if (this.duckCounter === 0) {
      this.primaryVolumeBeforeDuck = prevPrimary;
      this.secondaryVolumeBeforeBoost = this.getStreamVolume("secondary");
      // Boost secondary stream while phone audio is active
      const boostTo = STREAM_GAIN_MAX; // max out secondary stream during phone audio
      this.setStreamVolume("secondary", boostTo);
      // Pause all currently playing primary sounds
      this.pausePrimaryPlayingSounds();
    }
    this.duckCounter++;

    this.playOnStream("secondary", id, {
      loop: false,
      volume,
      onEnd: () => {
        this.duckCounter = Math.max(0, this.duckCounter - 1);
        if (this.duckCounter === 0) {
          this.setStreamVolume("primary", this.primaryVolumeBeforeDuck);
          this.setStreamVolume("secondary", this.secondaryVolumeBeforeBoost);
          // Resume any previously paused primary sounds
          this.resumePrimaryFromPaused();
        }
      },
    });
  }

  private pausePrimaryPlayingSounds() {
    // Pause all playing sounds currently routed to the primary stream
    this.soundIdToStream.forEach((sidStream, soundId) => {
      if (sidStream !== "primary") return;
      // Find owning Howl and pause this specific instance
      for (const howl of Object.values(this.sounds)) {
        try {
          const anyHowl = howl as unknown as {
            _soundById: (id: number) => object | null;
          };
          if (anyHowl._soundById(soundId)) {
            // Only pause if currently playing
            if ((howl as Howl).playing(soundId)) {
              (howl as Howl).pause(soundId);
              this.pausedPrimary.set(soundId, howl);
            }
            break;
          }
        } catch {}
      }
    });
  }

  private resumePrimaryFromPaused() {
    // Resume all instances that were paused by pausePrimaryPlayingSounds
    this.pausedPrimary.forEach((howl, soundId) => {
      try {
        howl.play(soundId);
      } catch {}
    });
    this.pausedPrimary.clear();
  }
}

export const soundManager = new SoundManager();
