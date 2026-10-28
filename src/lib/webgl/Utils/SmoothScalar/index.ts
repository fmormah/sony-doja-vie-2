import { clamp, lerp } from "three/src/math/MathUtils.js";

import Clock from "../../Core/Clock";

class SmoothScalar {
  private damping: number;
  private _target = 0;
  private _value = 0;

  constructor(damping = 0.1) {
    this.damping = damping;
  }

  set(value: number) {
    this._target = value;
  }

  get() {
    return this._value;
  }

  update({ deltaTime }: Clock) {
    const timeDamping = clamp(this.damping * deltaTime, 0, 1);
    this._value = lerp(this._value, this._target, timeDamping);
  }
}

export default SmoothScalar;
