import { PerspectiveCamera, Vector2, Vector3 } from "three";

class CoordinateConverter {
  private camera: PerspectiveCamera;
  private canvas: HTMLElement;
  private canvasScale = new Vector2();
  private canvasOffset = new Vector2();

  constructor(camera: PerspectiveCamera, canvas: HTMLElement) {
    this.camera = camera;
    this.canvas = canvas;

    this.updateCanvasScale();
    this.updateCamera();
  }

  setCanvasOffset(offset: Vector2) {
    this.canvasOffset.set(offset.x, offset.y);
  }

  positionPxToUv(pxPosition: Vector2) {
    pxPosition.x -= this.canvasOffset.x;
    pxPosition.y -= this.canvasOffset.y;

    pxPosition.divide(this.canvasScale);
    pxPosition.y = 1 - pxPosition.y;
    return pxPosition.subScalar(0.5).multiplyScalar(2);
  }

  positionPxToWorld(pxPosition: Vector2, worldZ: number) {
    const depth = this.worldZToDepth(worldZ);
    if (depth === 0) return new Vector3();
    const uvPosition = this.positionPxToUv(pxPosition);
    const worldPosition = this.positionUvToWorld(uvPosition, depth);
    return worldPosition;
  }

  distancePxToWorld(distance: number, worldZ: number) {
    const depth = this.camera.position.z - worldZ;
    const uvDistance = (distance / this.canvasScale.x) * 2;

    const endWorld = this.positionUvToWorld(new Vector2(uvDistance, 0), depth);
    return endWorld.x;
  }

  update() {
    this.updateCamera();
    this.updateCanvasScale();
  }

  private positionUvToWorld(uvPosition: Vector2, worldZ: number) {
    const screenPosition = new Vector3(
      uvPosition.x,
      uvPosition.y,
      this.depthWorldToSceen(worldZ),
    );
    const worldPosition = screenPosition;
    worldPosition.unproject(this.camera);
    return worldPosition;
  }

  private depthWorldToSceen(worldZ: number) {
    return new Vector3(0, 0, -worldZ).applyMatrix4(
      this.camera.projectionMatrix.clone(),
    ).z;
  }

  private worldZToDepth(worldZ: number) {
    return this.camera.position.z - worldZ;
  }

  private updateCanvasScale() {
    const { offsetWidth, offsetHeight } = this.canvas;
    this.canvasScale.set(offsetWidth, offsetHeight);
  }

  private updateCamera() {
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();
  }
}

export default CoordinateConverter;
