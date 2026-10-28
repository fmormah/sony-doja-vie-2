import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

import GameLoop from "../Core/GameLoop";
import ResizeManager from "../Core/ResizeManager";

interface SceneBaseOptions {
  antialias?: boolean;
  powerPreference?: "default" | "high-performance" | "low-power";
}

class SceneBase {
  protected renderer: WebGLRenderer;
  protected scene: Scene;
  protected camera: PerspectiveCamera;
  private gameLoop = new GameLoop();
  protected resizeManager: ResizeManager;

  constructor(options?: SceneBaseOptions) {
    this.renderer = new WebGLRenderer({
      antialias: options?.antialias ?? true,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: options?.powerPreference ?? "default",
    });

    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    this.resizeManager = new ResizeManager(this.renderer, this.camera);

    this.scene.add(this.camera);
  }

  get clock() {
    return this.gameLoop.clock;
  }

  async init(container: HTMLDivElement) {
    this.initListeners();
    container.appendChild(this.renderer.domElement);
    this.resizeManager.setTarget(container);
    this.resizeManager.resize();
  }

  start() {
    this.gameLoop.start();
  }

  pause() {
    this.gameLoop.stop();
  }

  resume() {
    this.gameLoop.start();
  }

  update() {}

  dispose() {
    this.renderer.domElement.remove();
    this.renderer.dispose();
    this.resizeManager.dispose();
    this.camera.removeFromParent();
    this.gameLoop.dispose();
    this.gameLoop.onFrame = undefined;
  }

  protected render() {
    this.renderer.render(this.scene, this.camera);
  }

  public forceRender(): void {
    this.render();
  }

  protected initListeners() {
    this.gameLoop.onFrame = () => {
      this.update();
      this.render();
    };
  }
}

export default SceneBase;
