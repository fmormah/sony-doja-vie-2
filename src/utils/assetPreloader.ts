export interface AssetPreloaderOptions {
  minDuration?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  debug?: boolean;
}

export interface AssetToLoad {
  src: string;
  type: "image" | "video" | "audio" | "model";
}

export class AssetPreloader {
  private assets: AssetToLoad[] = [];
  private loaded = 0;
  private total = 0;
  private startTime = 0;
  private minDuration: number;
  private onProgress?: (progress: number) => void;
  private onComplete?: () => void;
  private completed = false;
  private debug: boolean;
  private failedAssets: string[] = [];
  private successfulAssets: string[] = [];

  constructor(options: AssetPreloaderOptions = {}) {
    this.minDuration = options.minDuration ?? 5000;
    this.onProgress = options.onProgress;
    this.onComplete = options.onComplete;
    this.debug = options.debug ?? false;
  }

  addAsset(src: string, type: "image" | "video" | "audio" | "model" = "image") {
    this.assets.push({ src, type });
    this.total++;
  }

  addAssets(assets: AssetToLoad[]) {
    assets.forEach((asset) => this.addAsset(asset.src, asset.type));
  }

  private loadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        if (this.debug) console.warn(`Image load timeout (10s): ${src}`);
        resolve(); // Resolve instead of reject to continue loading
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      img.onerror = () => {
        clearTimeout(timeout);
        if (this.debug) console.warn(`Failed to load image: ${src}`);
        resolve();
      };
      img.src = src;
    });
  }

  private loadVideo(src: string): Promise<void> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "auto";
      const timeout = setTimeout(() => {
        if (this.debug) console.warn(`Video load timeout (15s): ${src}`);
        resolve();
      }, 15000);

      video.onloadeddata = () => {
        clearTimeout(timeout);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(timeout);
        if (this.debug) console.warn(`Failed to load video: ${src}`);
        resolve();
      };
      video.src = src;
    });
  }

  private loadAudio(src: string): Promise<void> {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.preload = "auto";

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (this.debug) console.warn(`Audio load timeout (10s): ${src}`);
          cleanup();
          resolve();
        }
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeout);
        audio.oncanplaythrough = null;
        audio.onloadeddata = null;
        audio.onloadedmetadata = null;
        audio.onerror = null;
      };

      const handleLoad = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve();
        }
      };

      // Try multiple events for better compatibility
      audio.oncanplaythrough = handleLoad;
      audio.onloadeddata = handleLoad;
      audio.onloadedmetadata = handleLoad; // Add metadata event as additional fallback

      audio.onerror = () => {
        if (!resolved) {
          resolved = true;
          if (this.debug) console.warn(`Failed to load audio: ${src}`);
          cleanup();
          resolve();
        }
      };

      audio.src = src;
    });
  }

  private loadModel(src: string): Promise<void> {
    return fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch model: ${src}`);
        return res.arrayBuffer();
      })
      .then(() => void 0)
      .catch((err) => {
        console.warn(`Failed to load model: ${src}`, err);
      });
  }

  private async loadAsset(asset: AssetToLoad): Promise<void> {
    const startTime = Date.now();
    if (this.debug)
      console.log(
        `[AssetPreloader] Starting to load ${asset.type}: ${asset.src}`,
      );

    try {
      if (asset.type === "video") {
        await this.loadVideo(asset.src);
      } else if (asset.type === "audio") {
        await this.loadAudio(asset.src);
      } else if (asset.type === "model") {
        await this.loadModel(asset.src);
      } else {
        await this.loadImage(asset.src);
      }

      const loadTime = Date.now() - startTime;

      // Check if this was a timeout (took close to timeout duration)
      const wasTimeout =
        (asset.type === "video" && loadTime >= 14900) ||
        (asset.type !== "video" && loadTime >= 9900);

      if (wasTimeout) {
        this.failedAssets.push(asset.src);
        if (this.debug) {
          console.warn(
            `[AssetPreloader] Asset timed out, skipping: ${asset.type}: ${asset.src}`,
          );
        }
      } else {
        this.successfulAssets.push(asset.src);
        if (this.debug) {
          console.log(
            `[AssetPreloader] Successfully loaded ${asset.type}: ${asset.src} in ${loadTime}ms`,
          );
        }
      }

      this.loaded++;
      this.updateProgress();
    } catch (error) {
      this.failedAssets.push(asset.src);
      if (this.debug)
        console.warn(
          `[AssetPreloader] Failed to preload ${asset.type}: ${asset.src}`,
          error,
        );
      this.loaded++;
      this.updateProgress();
    }
  }

  private updateProgress() {
    const elapsed = Date.now() - this.startTime;
    const timeProgress = Math.min(1, elapsed / this.minDuration);
    const loadProgress = this.total > 0 ? this.loaded / this.total : 1;

    const actualProgress = Math.min(timeProgress, loadProgress);

    const finalProgress =
      elapsed >= this.minDuration ? loadProgress : actualProgress;

    this.onProgress?.(finalProgress);

    if (finalProgress >= 1 && !this.completed) {
      this.completed = true;

      this.onComplete?.();
    }
  }

  getStats() {
    return {
      total: this.total,
      loaded: this.loaded,
      successful: this.successfulAssets.length,
      failed: this.failedAssets.length,
      failedAssets: [...this.failedAssets],
      progress: this.total > 0 ? this.loaded / this.total : 1,
    };
  }

  async start(): Promise<void> {
    this.startTime = Date.now();
    this.loaded = 0;
    this.completed = false;
    this.failedAssets = [];
    this.successfulAssets = [];

    const minDurationPromise = new Promise<void>((resolve) => {
      const checkTime = () => {
        const elapsed = Date.now() - this.startTime;
        if (elapsed >= this.minDuration) {
          resolve();
        } else {
          this.updateProgress();
          requestAnimationFrame(checkTime);
        }
      };
      requestAnimationFrame(checkTime);
    });

    const loadPromises = this.assets.map((asset) => this.loadAsset(asset));

    await Promise.all([minDurationPromise, ...loadPromises]);

    this.updateProgress();
  }
}

export function collectAppAssets(): AssetToLoad[] {
  const assets: AssetToLoad[] = [];

  const staticAssets: AssetToLoad[] = [
    { src: "/assets/model/doja-phase2-disco-ball-2.glb", type: "model" },
    {
      src: "/assets/images/scene/DoorScene/pullinUpAtTheClub.webp",
      type: "image",
    },
    { src: "/assets/images/scene/DoorScene/car.webp", type: "image" },

    {
      src: "/assets/images/scene/DanceFloor/dance-floor-mobile.webp",
      type: "image",
    },
  ];

  assets.push(...staticAssets);

  return assets;
}
