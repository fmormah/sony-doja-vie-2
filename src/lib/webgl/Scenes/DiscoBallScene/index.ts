import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import AssetLoader from "@/lib/webgl/Core/AssetLoader";
import SceneBase from "@/lib/webgl/SceneBase";
import SmoothVector3 from "@/lib/webgl/Utils/SmoothVector3";

const CONFIG = {
  camera: {
    position: new Vector3(0, 0, 5),
  },
  model: {
    path: "/assets/model/doja-phase2-disco-ball-2.glb",
  },
  envMap: {
    path: "/assets/wgl/env-map/512p-highway-overpass.exr",
  },
  lighting: {
    environmentIntensity: 1,
    backgroundIntensity: 0,
    gltfLights: {
      light: true,
      "light-red-1": true,
      "light-red-2": true,
    },
    gltfLightIntensity: {
      light: 1.5,
      "light-red-1": 1.5,
      "light-red-2": 2,
    },
  },
};

export interface DiscoBallSceneProps {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  zoom?: number;
}

class DiscoBallScene extends SceneBase {
  private controls: OrbitControls;
  private discoBall: Group | null = null;
  private assetLoader: AssetLoader;
  private originalLightIntensities: Map<string, number> = new Map();
  private smoothPosition: SmoothVector3;
  private smoothRotation: SmoothVector3;
  private smoothCameraPosition: SmoothVector3;
  private targetProps: DiscoBallSceneProps = {};

  constructor(props?: DiscoBallSceneProps) {
    super();
    this.assetLoader = new AssetLoader(this.renderer, { isDraco: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Initialize smooth animation helpers
    this.smoothPosition = new SmoothVector3(
      new Vector3(
        props?.position?.x ?? 0,
        props?.position?.y ?? 0.9,
        props?.position?.z ?? 0,
      ),
      0.5,
    );
    this.smoothRotation = new SmoothVector3(
      new Vector3(
        props?.rotation?.x ?? 0,
        props?.rotation?.y ?? 0,
        props?.rotation?.z ?? 0,
      ),
      0.5,
    );

    const initialZoom = props?.zoom ?? 5;
    this.smoothCameraPosition = new SmoothVector3(
      new Vector3(0, 0, initialZoom),
      0.5,
    );
    this.camera.position.copy(this.smoothCameraPosition.value);

    this.targetProps = { ...props };
    this.loadAssets();
  }

  private async loadAssets() {
    try {
      const isExrFile = CONFIG.envMap.path.toLowerCase().endsWith(".exr");
      const [envMapTexture, gltf] = await Promise.all([
        isExrFile
          ? this.assetLoader.loadExr(CONFIG.envMap.path)
          : this.assetLoader.loadEnvmap(CONFIG.envMap.path),
        this.assetLoader.loadModel(CONFIG.model.path),
      ]);

      this.scene.environment = envMapTexture;
      this.scene.environmentIntensity = CONFIG.lighting.environmentIntensity;
      this.scene.background = envMapTexture;
      this.scene.backgroundIntensity = CONFIG.lighting.backgroundIntensity;

      this.discoBall = gltf.scene;

      const camerasToRemove: Object3D[] = [];
      this.discoBall.traverse((child) => {
        if (child.type === "PerspectiveCamera") {
          camerasToRemove.push(child);
        } else if (child.type === "PointLight") {
          const light = child as PointLight;
          this.originalLightIntensities.set(light.name, light.intensity);

          const lightName =
            light.name as keyof typeof CONFIG.lighting.gltfLights;
          const intensityScalar = CONFIG.lighting.gltfLightIntensity[lightName];
          light.intensity =
            this.originalLightIntensities.get(light.name)! * intensityScalar;

          const isEnabled = CONFIG.lighting.gltfLights[lightName] !== false;
          light.visible = isEnabled;
        } else if (child.type === "Mesh" || child.type === "SkinnedMesh") {
          const mesh = child as Mesh;

          // remove original metalness map
          const material = (mesh.material as MeshStandardMaterial).clone();
          if (material && material.metalnessMap) {
            material.metalnessMap = null;
            material.needsUpdate = true;
            mesh.material = material;
          }
        }
      });

      camerasToRemove.forEach((item) => {
        if (item.parent) {
          item.parent.remove(item);
        }
      });

      this.discoBall.position.copy(this.smoothPosition.value);
      this.discoBall.rotation.set(
        this.smoothRotation.value.x,
        this.smoothRotation.value.y,
        this.smoothRotation.value.z,
      );
      this.scene.add(this.discoBall);

    } catch (error) {
      console.error("DiscoBallScene: Error loading assets:", error);
    }
  }

  override update() {
    super.update();
    this.controls.update();

    // Smooth transitions
    this.smoothPosition.update(this.clock.deltaTime);
    this.smoothRotation.update(this.clock.deltaTime);
    this.smoothCameraPosition.update(this.clock.deltaTime);

    // Apply smooth values
    if (this.discoBall) {
      this.discoBall.position.copy(this.smoothPosition.value);
      this.discoBall.rotation.set(
        this.smoothRotation.value.x,
        this.smoothRotation.value.y,
        this.smoothRotation.value.z,
      );
    }

    this.camera.position.copy(this.smoothCameraPosition.value);

  }

  updateProps(props: DiscoBallSceneProps) {
    if (props.position) {
      this.smoothPosition.setTarget(
        props.position.x,
        props.position.y,
        props.position.z,
      );
    }
    if (props.rotation) {
      this.smoothRotation.setTarget(
        props.rotation.x,
        props.rotation.y,
        props.rotation.z,
      );
    }
    if (props.zoom !== undefined) {
      this.smoothCameraPosition.setTarget(0, 0, props.zoom);
    }
    this.targetProps = { ...this.targetProps, ...props };
  }

  override dispose() {
    super.dispose();
    if (this.discoBall) {
      this.scene.remove(this.discoBall);
    }
  }
}

export default DiscoBallScene;
