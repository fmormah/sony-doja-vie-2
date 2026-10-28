import { PerspectiveCamera, WebGLRenderer } from "three";

class ResizeManager {
  onResize?: () => void;
  private observer: ResizeObserver;
  private target: HTMLElement;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private resizeTimeout: NodeJS.Timeout | null = null;

  private readonly onResizeEvent = () => {
    // Clear any pending resize
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Debounce resize to prevent flickering
    this.resizeTimeout = setTimeout(() => {
      const container = this.renderer.domElement.parentElement;
      if (!container) return;

      if (this.onResize) this.onResize();
      this.resizeRenderer(container);
      this.resizeCamera(container);
    }, 16); // ~60fps
  };

  constructor(renderer: WebGLRenderer, camera: PerspectiveCamera) {
    this.renderer = renderer;
    this.camera = camera;
    this.observer = new ResizeObserver(this.onResizeEvent);
    this.target = document.body;
    this.observer.observe(this.target);
    // Immediate resize without debounce on initial load
    this.immediateResize();
  }

  setTarget(element: HTMLElement) {
    this.observer.unobserve(this.target);
    this.target = element;
    this.observer.observe(this.target);
  }

  resize() {
    this.onResizeEvent();
  }

  private immediateResize() {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    if (this.onResize) this.onResize();
    this.resizeRenderer(container);
    this.resizeCamera(container);
  }

  dispose() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.observer.disconnect();
  }

  private resizeRenderer(container: HTMLElement) {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
  }

  private resizeCamera(container: HTMLElement) {
    this.camera.aspect = container.offsetWidth / container.offsetHeight;
    this.camera.updateProjectionMatrix();
  }
}

export default ResizeManager;
