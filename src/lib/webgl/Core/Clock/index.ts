const TIME_SCALE = 0.001;

class Clock {
  needsRefresh = false;
  private time = performance.now() * TIME_SCALE;
  private _startTime = 0;
  private _deltaTime = 0;
  private _elapsedTime = 0;

  get startTime() {
    return this._startTime;
  }

  get deltaTime() {
    return this._deltaTime;
  }

  get elapsedTime() {
    return this._elapsedTime;
  }

  start() {
    this._startTime = this.time;
  }

  resetDeltaTime() {
    this._deltaTime = 0;
    this.time = performance.now() * TIME_SCALE;
  }

  update() {
    if (this.needsRefresh) {
      this.resetDeltaTime();
      this.needsRefresh = false;
    }
    const newTime = performance.now() * TIME_SCALE;
    this._deltaTime = newTime - this.time;
    this._elapsedTime += this._deltaTime;
    this.time = newTime;
  }
}

export default Clock;
