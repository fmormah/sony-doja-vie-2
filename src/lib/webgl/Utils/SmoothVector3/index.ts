import { Vector3 } from "three";

/**
 * Smoothly animates a Vector3 to target values
 */
class SmoothVector3 {
  private current: Vector3;
  private target: Vector3;
  private velocity: Vector3;
  private smoothTime: number;

  constructor(initial: Vector3 = new Vector3(), smoothTime = 0.3) {
    this.current = initial.clone();
    this.target = initial.clone();
    this.velocity = new Vector3();
    this.smoothTime = smoothTime;
  }

  setTarget(x: number, y: number, z: number) {
    this.target.set(x, y, z);
  }

  setTargetVector(target: Vector3) {
    this.target.copy(target);
  }

  update(deltaTime: number) {
    if (this.current.equals(this.target)) return;

    const smoothFactor = 1 - Math.exp(-deltaTime / this.smoothTime);

    this.velocity.subVectors(this.target, this.current);
    this.velocity.multiplyScalar(smoothFactor);
    this.current.add(this.velocity);
  }

  get value() {
    return this.current;
  }

  setSmoothTime(time: number) {
    this.smoothTime = time;
  }
}

export default SmoothVector3;
