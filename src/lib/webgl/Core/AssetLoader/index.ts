import { MeshoptDecoder } from "meshoptimizer";
import {
  Group,
  HalfFloatType,
  LoadingManager,
  Material,
  Mesh,
  MirroredRepeatWrapping,
  Object3D,
  Object3DEventMap,
  PMREMGenerator,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from "three";
import {
  DRACOLoader,
  EXRLoader,
  Font,
  FontLoader,
  GLTF,
  GLTFLoader,
  KTX2Loader,
  RGBELoader,
  UltraHDRLoader,
} from "three/examples/jsm/Addons";

export type GltfNodes = Record<string, Object3D>;

// we need this type as nodes will be any extension of Object3D
// eslint-disable-next-line
export interface ObjectAny extends Mesh, Record<string, any> {}
export interface IGLTFGraph extends IGraph, GLTF {}

export interface IGraph {
  nodes: GltfNodes;
  materials: Record<string, Material>;
}

interface Options {
  isDraco?: boolean;
  isKtx?: boolean;
  isMeshOpt?: boolean;
}

interface DecoderPaths {
  draco: string | null;
  ktx: string | null;
}

const DECODER_PATHS: DecoderPaths = {
  draco: "/assets/wgl/loaders/draco/",
  ktx: null,
};

const DEFAULT_OPTIONS: Options = {
  isDraco: false,
  isKtx: false,
  isMeshOpt: false,
};

class AssetLoader {
  manager: LoadingManager;
  private gltfLoader: GLTFLoader;
  private hdriLoader: RGBELoader;
  private exrLoader: EXRLoader;
  private textureLoader: TextureLoader;
  private renderer: WebGLRenderer;
  private pmremGenerator: PMREMGenerator;
  private ultraHdrLoader = new UltraHDRLoader();
  private fontLoader = new FontLoader();

  constructor(
    renderer: WebGLRenderer,
    options = DEFAULT_OPTIONS,
    onProgress?: (progress: number) => void,
  ) {
    this.renderer = renderer;
    this.manager = new LoadingManager();

    this.gltfLoader = new GLTFLoader(this.manager);
    this.hdriLoader = new RGBELoader(this.manager);
    this.exrLoader = new EXRLoader(this.manager);
    this.textureLoader = new TextureLoader(this.manager);
    this.pmremGenerator = new PMREMGenerator(renderer);

    this.manager.onProgress = (_: string, loaded: number, total: number) => {
      if (onProgress) onProgress(loaded / total);
    };

    this.initLoaders(options);
  }

  private toAbsoluteUrl(source: string): string {
    // Ensure asset URLs are resolved against origin so no credentials are present
    if (typeof window === "undefined") return source;
    try {
      return new URL(source, window.location.origin).toString();
    } catch {
      return source;
    }
  }

  async loadTextures(sources: string[]) {
    const promises = [];
    for (const source of sources) {
      promises.push(this.loadTexture(source));
    }
    return Promise.all(promises);
  }

  async loadEnvmaps(sources: string[]) {
    const promises = [];
    for (const source of sources) {
      promises.push(this.loadEnvmap(source));
    }
    return Promise.all(promises);
  }

  async loadFont(source: string) {
    return new Promise<Font>((resolve) => {
      const url = this.toAbsoluteUrl(source);
      this.fontLoader.load(url, (font: Font) => {
        return resolve(font);
      });
    });
  }

  async loadTexture(source: string) {
    return new Promise<Texture>((resolve) => {
      const url = this.toAbsoluteUrl(source);
      this.textureLoader.load(
        url,
        (texture: Texture) => {
          texture.wrapS = MirroredRepeatWrapping;
          texture.wrapT = MirroredRepeatWrapping;
          texture.flipY = true;
          return resolve(texture);
        },
        () => undefined,
        (error: unknown) => {
          console.error(error);
        },
      );
    });
  }

  async loadEnvmap(source: string) {
    return new Promise<Texture>((resolve) => {
      const url = this.toAbsoluteUrl(source);
      this.hdriLoader.load(
        url,
        (texture: Texture) => {
          texture.flipY = true;
          const rt = this.pmremGenerator.fromEquirectangular(texture);
          resolve(rt.texture);
          this.pmremGenerator.dispose();
        },
        () => undefined,
        (error: unknown) => {
          console.error(error);
        },
      );
    });
  }

  async loadUltraHdr(source: string) {
    return new Promise<Texture>((resolve) => {
      this.ultraHdrLoader.setDataType(HalfFloatType);
      const url = this.toAbsoluteUrl(source);
      this.ultraHdrLoader.load(
        url,
        (texture: Texture) => {
          texture.flipY = true;
          const rt = this.pmremGenerator.fromEquirectangular(texture);
          resolve(rt.texture);
          this.pmremGenerator.dispose();
        },
        () => undefined,
        (error: unknown) => {
          console.error(error);
        },
      );
    });
  }

  async loadExr(source: string) {
    return new Promise<Texture>((resolve) => {
      const url = this.toAbsoluteUrl(source);
      this.exrLoader.load(
        url,
        (texture: Texture) => {
          const rt = this.pmremGenerator.fromEquirectangular(texture);
          resolve(rt.texture);
          this.pmremGenerator.dispose();
        },
        () => undefined,
        (error: unknown) => {
          console.error(error);
        },
      );
    });
  }

  async loadModels(sources: string[]) {
    const promises = [];
    for (const source of sources) {
      promises.push(this.loadModel(source));
    }
    return Promise.all(promises);
  }

  async loadModel(source: string) {
    return new Promise<IGLTFGraph>((resolve) => {
      const url = this.toAbsoluteUrl(source);
      this.gltfLoader.load(
        url,
        (gltf: GLTF) => {
          const graph = this.buildGraph(gltf.scene);
          Object.assign(gltf, graph);
          resolve(gltf as IGLTFGraph);
        },
        () => undefined,
        (error: unknown) => {
          console.error(error);
        },
      );
    });
  }

  async loadModelFromArrayBuffer(arrayBuffer: ArrayBuffer, source = "") {
    return new Promise<IGLTFGraph>((resolve) => {
      this.gltfLoader.parse(
        arrayBuffer,
        source,
        (gltf: GLTF) => {
          const graph = this.buildGraph(gltf.scene);
          Object.assign(gltf, graph);
          resolve(gltf as IGLTFGraph);
        },
        (error: unknown) => {
          console.error(error);
        },
      );
    });
  }

  private initLoaders(options: Options) {
    if (options.isDraco && DECODER_PATHS.draco) {
      this.initDracoLoader(DECODER_PATHS.draco);
    }
    if (options.isKtx && DECODER_PATHS.ktx) {
      this.initKtxLoader(DECODER_PATHS.ktx);
    }
    if (options.isMeshOpt) this.initMeshOptLoader();
  }

  private initKtxLoader(decoderPath: string) {
    const ktx2Loader = new KTX2Loader();
    const url = this.toAbsoluteUrl(decoderPath);
    ktx2Loader.setTranscoderPath(url).detectSupport(this.renderer);
    this.gltfLoader.setKTX2Loader(ktx2Loader);
  }

  private initMeshOptLoader() {
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }

  private initDracoLoader(decoderPath: string) {
    const dracoLoader = new DRACOLoader();
    const url = this.toAbsoluteUrl(decoderPath);
    dracoLoader.setDecoderPath(url);
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  private buildGraph(scene: Group<Object3DEventMap>) {
    const data: IGraph = {
      nodes: {},
      materials: {},
    };

    if (scene) {
      scene.traverse((obj) => {
        const mesh = obj as ObjectAny;
        if (obj.name) data.nodes[obj.name] = mesh;

        const material = mesh.material as Material;

        if (material && !data.materials[material.name]) {
          data.materials[material.name] = material;
        }
      });
    }
    return data;
  }
}

export default AssetLoader;
