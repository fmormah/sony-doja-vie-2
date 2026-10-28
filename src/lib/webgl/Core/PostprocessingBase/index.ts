import { Camera, Scene, WebGLRenderer } from "three";
import {
  EffectComposer,
  OutputPass,
  RenderPass,
  ShaderPass,
} from "three/examples/jsm/Addons.js";

class PostProcessingBase {
  protected composer: EffectComposer;
  private isReady = false;
  private readonly scene: Scene;
  private readonly camera: Camera;
  private readonly renderer: WebGLRenderer;

  constructor(scene: Scene, camera: Camera, renderer: WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.composer = new EffectComposer(renderer);
  }

  protected setup(passes: ShaderPass[]) {
    const renderPass = new RenderPass(this.scene, this.camera);
    const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    for (const pass of passes) {
      this.composer.addPass(pass);
    }
    this.composer.addPass(outputPass);
    this.isReady = true;
  }

  resize() {
    const { clientWidth, clientHeight } = this.renderer.domElement;
    this.composer.setSize(clientWidth, clientHeight);
    this.composer.setPixelRatio(window.devicePixelRatio);
  }

  setPixelRatio(ratio: number) {
    this.composer.setPixelRatio(ratio);
  }

  render() {
    if (!this.isReady) {
      console.error("PostProcessing has not been initialised");
      return;
    }
    this.composer.render();
  }

  dispose() {
    this.composer.dispose();
    this.isReady = false;
  }
}

export default PostProcessingBase;
