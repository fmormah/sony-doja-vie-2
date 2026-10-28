import {
  ClampToEdgeWrapping,
  NearestFilter,
  SRGBColorSpace,
  Texture,
} from "three";

import AssetLoader from "@/lib/webgl/Core/AssetLoader";

interface TextureConfig {
  minFilter?: typeof NearestFilter;
  magFilter?: typeof NearestFilter;
  wrapS?: typeof ClampToEdgeWrapping;
  wrapT?: typeof ClampToEdgeWrapping;
  generateMipmaps?: boolean;
}

class TextureManager {
  private textureCache: Map<string, Texture> = new Map();
  private assetLoader: AssetLoader;

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  async loadTexture(path: string, config?: TextureConfig): Promise<Texture> {
    if (this.textureCache.has(path)) {
      return this.textureCache.get(path)!;
    }

    try {
      const texture = await this.assetLoader.loadTexture(path);

      texture.colorSpace = SRGBColorSpace;
      texture.premultiplyAlpha = true;
      texture.minFilter = config?.minFilter || NearestFilter;
      texture.magFilter = config?.magFilter || NearestFilter;
      texture.wrapS = config?.wrapS || ClampToEdgeWrapping;
      texture.wrapT = config?.wrapT || ClampToEdgeWrapping;
      texture.generateMipmaps = config?.generateMipmaps ?? false;

      this.textureCache.set(path, texture);
      return texture;
    } catch (error) {
      console.error(`Failed to load texture: ${path}`, error);
      throw error;
    }
  }

  async loadTextures(
    paths: string[],
    config?: TextureConfig,
  ): Promise<Map<string, Texture>> {
    const promises = paths.map((path) =>
      this.loadTexture(path, config).then((texture) => ({ path, texture })),
    );

    const results = await Promise.all(promises);
    const textureMap = new Map<string, Texture>();

    results.forEach(({ path, texture }) => {
      textureMap.set(path, texture);
    });

    return textureMap;
  }

  getTexture(path: string): Texture | undefined {
    return this.textureCache.get(path);
  }

  hasTexture(path: string): boolean {
    return this.textureCache.has(path);
  }

  dispose(): void {
    this.textureCache.forEach((texture) => texture.dispose());
    this.textureCache.clear();
  }
}

export default TextureManager;
export type { TextureConfig };
