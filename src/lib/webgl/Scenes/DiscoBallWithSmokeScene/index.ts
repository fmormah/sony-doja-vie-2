import {
  AnimationMixer,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Vector3,
} from "three";

import AssetLoader from "@/lib/webgl/Core/AssetLoader";
import SceneBase from "@/lib/webgl/SceneBase";
import { SmokeFogMaterial } from "@/lib/webgl/Shaders/SmokeFogShader";
import DiscoBallRotationManager, {
  RotationMode,
} from "@/lib/webgl/Utils/DiscoBallRotationManager";
import SmoothVector3 from "@/lib/webgl/Utils/SmoothVector3";
import { isMobileDevice } from "@/utils/deciveDetection";

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
  animation: {
    speed: 0.3,
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
  smoke: {
    density: 2.0,
    speed: 0.1,
    opacity: 0.3,
    color: { r: 0.5, g: 0.5, b: 0.6 },
  },
  rotation: {
    sensitivity: 0.0006,
    friction: 0.95,
    minVelocity: 0.001,
  },
};

export interface DiscoBallWithSmokeSceneProps {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  zoom?: number;
  smokeDensity?: number;
  smokeSpeed?: number;
  smokeOpacity?: number;
  smokeColor?: { r: number; g: number; b: number };
  renderSmoke?: boolean;
  enableInteraction?: boolean;
  isZooming?: boolean;
  onMusicSeek?: (timeInSeconds: number) => void;
  onVelocityUpdate?: (playbackRate: number) => void;
  onDragOffset?: (offset: number) => void;
  musicDuration?: number;
}

class DiscoBallWithSmokeScene extends SceneBase {
  private discoBall: Group | null = null;
  private assetLoader: AssetLoader;
  private animationMixer: AnimationMixer | null = null;
  private originalLightIntensities: Map<string, number> = new Map();
  private smoothPosition: SmoothVector3;
  private smoothRotation: SmoothVector3;
  private smoothCameraPosition: SmoothVector3;

  // Performance optimization flags
  private isMobile: boolean = isMobileDevice();
  private needsPositionUpdate = false;
  private needsRotationUpdate = false;
  private needsCameraUpdate = false;
  private animationSpeed = 1.0;
  private lastUpdateTime = 0;
  private readonly UPDATE_INTERVAL = this.isMobile ? 1000 / 30 : 1000 / 60; // 30fps on mobile, 60fps on desktop

  // Smoke overlay
  private smokeScene?: Scene;
  private smokeCamera?: OrthographicCamera;
  private smokeMaterial?: SmokeFogMaterial;
  private smokePlane?: Mesh;
  private renderSmoke: boolean;

  private rotationManager: DiscoBallRotationManager;
  private enableInteraction: boolean;
  private isZooming: boolean;

  constructor(props?: DiscoBallWithSmokeSceneProps) {
    super();
    
    // WebGL context optimization for mobile
    if (this.isMobile) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = false;
    }
    
    this.assetLoader = new AssetLoader(this.renderer, { isDraco: true });
    this.enableInteraction = props?.enableInteraction ?? false;
    this.isZooming = props?.isZooming ?? false;

    this.rotationManager = new DiscoBallRotationManager({
      config: {
        rotationSensitivity: CONFIG.rotation.sensitivity,
        friction: CONFIG.rotation.friction,
        minVelocity: CONFIG.rotation.minVelocity,
      },
      element: this.renderer.domElement,
      useExternalDragInput: true, // handle drag input from TextTitleOverlay
      onRotationUpdate: (rotation: Vector3) => {
        if (
          this.discoBall &&
          this.rotationManager.getMode() !== RotationMode.TRANSITION
        ) {
          this.discoBall.rotation.set(rotation.x, rotation.y, rotation.z);
        }
      },
      onMusicSeek: props?.onMusicSeek,
      onVelocityUpdate: props?.onVelocityUpdate,
      onDragOffset: props?.onDragOffset,
      musicDuration: props?.musicDuration,
    });

    // Initialize smooth animation helpers
    this.smoothPosition = new SmoothVector3(
      new Vector3(
        props?.position?.x ?? 0,
        props?.position?.y ?? 4.2,
        props?.position?.z ?? -3,
      ),
      0.35,
    );
    this.smoothRotation = new SmoothVector3(
      new Vector3(
        props?.rotation?.x ?? 0.71,
        props?.rotation?.y ?? 0,
        props?.rotation?.z ?? 0,
      ),
      0.35,
    );

    const initialZoom = props?.zoom ?? 7.9;
    this.smoothCameraPosition = new SmoothVector3(
      new Vector3(0, 0, initialZoom),
      0.1,
    );
    this.camera.position.copy(this.smoothCameraPosition.value);

    this.renderSmoke = props?.renderSmoke !== false; // default true
    // Setup smoke overlay (conditionally)
    if (this.renderSmoke) {
      this.smokeScene = new Scene();
      this.smokeCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // Create smoke material and plane
      this.smokeMaterial = new SmokeFogMaterial();
      if (props?.smokeDensity !== undefined) {
        this.smokeMaterial.setDensity(props.smokeDensity);
      }
      if (props?.smokeSpeed !== undefined) {
        this.smokeMaterial.setSpeed(props.smokeSpeed);
      }
      if (props?.smokeOpacity !== undefined) {
        this.smokeMaterial.setOpacity(props.smokeOpacity);
      }
      if (props?.smokeColor) {
        this.smokeMaterial.setColor(
          props.smokeColor.r,
          props.smokeColor.g,
          props.smokeColor.b,
        );
      }

      const smokeGeometry = new PlaneGeometry(2, 2);
      this.smokePlane = new Mesh(smokeGeometry, this.smokeMaterial);
      this.smokeScene.add(this.smokePlane);
    }

    this.updateRotationMode();

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

      // Keep background transparent so dance floor shows through
      this.scene.environment = envMapTexture;
      this.scene.environmentIntensity = CONFIG.lighting.environmentIntensity;
      this.scene.background = null;
      this.scene.backgroundIntensity = 0;

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

          // Remove original metalness map
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

      if (gltf.animations && gltf.animations.length > 0) {
        this.animationMixer = new AnimationMixer(this.discoBall);
        gltf.animations.forEach((clip) => {
          const action = this.animationMixer!.clipAction(clip);
          action.timeScale = -CONFIG.animation.speed;
          action.play();
        });
      }

    } catch (error) {
      console.error("DiscoBallWithSmokeScene: Error loading assets:", error);
    }
  }

  private updateRotationMode() {
    let newMode: RotationMode;
    if (this.isZooming) {
      newMode = RotationMode.TRANSITION;
    } else {
      newMode = RotationMode.INTERACTIVE;
    }
    this.rotationManager.setMode(newMode);
  }

  override update() {
    super.update();

    const now = performance.now();
    const deltaTime = this.clock.deltaTime;
    const safeDeltaTime = Math.min(deltaTime, 0.1); // cap deltaTime to prevent jumps
    
    // always update rotation manager for smooth interaction
    this.rotationManager.update(safeDeltaTime);

    // throttle non-critical updates
    const shouldUpdateThrottled = (now - this.lastUpdateTime) >= this.UPDATE_INTERVAL;

    if (shouldUpdateThrottled) {
      this.lastUpdateTime = now;

      // update smooth transitions (they handle their own completion internally)
      this.smoothPosition.update(safeDeltaTime);
      this.needsPositionUpdate = true;

      this.smoothRotation.update(safeDeltaTime);
      this.needsRotationUpdate = true;

      this.smoothCameraPosition.update(safeDeltaTime);
      this.needsCameraUpdate = true;
    }

    // apply updates only when needed (dirty flag pattern)
    if (this.discoBall) {
      if (this.needsPositionUpdate) {
        this.discoBall.position.copy(this.smoothPosition.value);
        this.needsPositionUpdate = false;
      }

      // apply smooth rotation during transition mode
      if (this.needsRotationUpdate && this.rotationManager.getMode() === RotationMode.TRANSITION) {
        this.discoBall.rotation.set(
          this.smoothRotation.value.x,
          this.smoothRotation.value.y,
          this.smoothRotation.value.z,
        );
        this.needsRotationUpdate = false;
      }
    }

    if (this.needsCameraUpdate) {
      this.camera.position.copy(this.smoothCameraPosition.value);
      this.needsCameraUpdate = false;
    }

    // update AnimationMixer with variable speed (can be paused by setting animationSpeed = 0)
    if (this.animationMixer && this.animationSpeed > 0) {
      // Desktop: always update, Mobile: throttled updates
      if (!this.isMobile || shouldUpdateThrottled) {
        this.animationMixer.update(safeDeltaTime * this.animationSpeed);
      }
    }

    // update smoke animation (always smooth)
    if (this.renderSmoke && this.smokeMaterial) {
      this.smokeMaterial.updateTime(this.clock.elapsedTime);
    }
  }

  protected override render() {
    // render main scene (disco ball)
    this.renderer.render(this.scene, this.camera);

    // render smoke overlay on top
    if (this.renderSmoke && this.smokeScene && this.smokeCamera) {
      this.renderer.autoClear = false;
      this.renderer.render(this.smokeScene, this.smokeCamera);
      this.renderer.autoClear = true;
    }
  }

  // external drag control methods for TrackTitleOverlay integration
  startDrag() {
    this.rotationManager.startExternalDrag();
  }

  updateDrag(deltaX: number) {
    this.rotationManager.updateExternalDrag(deltaX);
  }

  endDrag() {
    this.rotationManager.endExternalDrag();
  }

  override dispose() {
    super.dispose();
    if (this.discoBall) {
      this.scene.remove(this.discoBall);
    }
    if (this.animationMixer) {
      this.animationMixer.stopAllAction();
    }
    this.rotationManager.dispose();
    if (this.renderSmoke && this.smokeMaterial && this.smokePlane) {
      this.smokeMaterial.dispose();
      this.smokePlane.geometry.dispose();
    }
  }

  // performance control methods
  setAnimationSpeed(speed: number) {
    this.animationSpeed = Math.max(0, speed);
  }

  pauseAnimations() {
    this.setAnimationSpeed(0);
  }

  resumeAnimations() {
    this.setAnimationSpeed(1);
  }

  updateProps(props: DiscoBallWithSmokeSceneProps) {
    if (props.position) {
      this.smoothPosition.setTarget(
        props.position.x,
        props.position.y,
        props.position.z,
      );
      this.needsPositionUpdate = true; // Force update on next frame
    }
    if (props.rotation) {
      this.smoothRotation.setTarget(
        props.rotation.x,
        props.rotation.y,
        props.rotation.z,
      );
      this.needsRotationUpdate = true; // Force update on next frame
    }
    if (props.zoom !== undefined) {
      this.smoothCameraPosition.setTarget(0, 0, props.zoom);
      this.needsCameraUpdate = true; // Force update on next frame
    }
    if (this.renderSmoke && this.smokeMaterial) {
      if (props.smokeDensity !== undefined) {
        this.smokeMaterial.setDensity(props.smokeDensity);
      }
      if (props.smokeSpeed !== undefined) {
        this.smokeMaterial.setSpeed(props.smokeSpeed);
      }
      if (props.smokeOpacity !== undefined) {
        this.smokeMaterial.setOpacity(props.smokeOpacity);
      }
      if (props.smokeColor) {
        this.smokeMaterial.setColor(
          props.smokeColor.r,
          props.smokeColor.g,
          props.smokeColor.b,
        );
      }
    }

    if (
      props.renderSmoke !== undefined &&
      props.renderSmoke !== this.renderSmoke
    ) {
      this.renderSmoke = props.renderSmoke;
    }

    if (props.onMusicSeek !== undefined) {
      this.rotationManager.setMusicSeekCallback(props.onMusicSeek);
    }

    if (props.onVelocityUpdate !== undefined) {
      this.rotationManager.setVelocityCallback(props.onVelocityUpdate);
    }
    
    if (props.onDragOffset !== undefined) {
      this.rotationManager.setDragOffsetCallback(props.onDragOffset);
    }
    
    if (props.musicDuration !== undefined && props.musicDuration > 0) {
      this.rotationManager.setMusicDuration(props.musicDuration);
    }

    let needsRotationModeUpdate = false;
    if (
      props.enableInteraction !== undefined &&
      props.enableInteraction !== this.enableInteraction
    ) {
      this.enableInteraction = props.enableInteraction;
      needsRotationModeUpdate = true;
    }
    if (props.isZooming !== undefined && props.isZooming !== this.isZooming) {
      this.isZooming = props.isZooming;
      needsRotationModeUpdate = true;
    }

    if (needsRotationModeUpdate) {
      this.updateRotationMode();
      if (
        !this.isZooming &&
        this.rotationManager.getMode() === RotationMode.INTERACTIVE
      ) {
        this.rotationManager.setBaseRotation(this.smoothRotation.value);
      }
    }
  }
}

export default DiscoBallWithSmokeScene;
