import { Vector2 } from "three";

const ACTIVE = { passive: false };

class UserInputListener {
  onPointerMove?: (position: Vector2) => void;
  onPointerUp?: () => void;
  onPointerDown?: (position: Vector2) => void;
  onPinchStart?: (distance: number) => void;
  onPinchMove?: (distance: number) => void;
  onWheel?: (offset: Vector2) => void;
  onKey?: (key: string) => void;

  private readonly element: HTMLElement | Window;

  private readonly onTouchStartHandler = (evt: TouchEvent) => {
    evt.preventDefault();

    const target = evt.target as HTMLElement;
    if (!target) return;

    if (evt.touches.length === 1) {
      const position = this.getTouchPosition(evt.touches[0], target);
      if (this.onPointerDown) this.onPointerDown(position);
    } else if (evt.touches.length === 2) {
      const t0 = this.getTouchPosition(evt.touches[0], target);
      const t1 = this.getTouchPosition(evt.touches[1], target);
      const distance = t0.distanceTo(t1);
      if (this.onPinchStart) this.onPinchStart(distance);
    }
  };

  private readonly onTouchMoveHandler = (evt: TouchEvent) => {
    evt.preventDefault();

    const target = evt.target as HTMLElement;
    if (!target) return;

    if (evt.touches.length === 1) {
      const position = this.getTouchPosition(evt.touches[0], target);
      if (this.onPointerMove) this.onPointerMove(position);
    } else if (evt.touches.length === 2) {
      const t0 = this.getTouchPosition(evt.touches[0], target);
      const t1 = this.getTouchPosition(evt.touches[1], target);
      const distance = t0.distanceTo(t1);
      if (this.onPinchMove) this.onPinchMove(distance);
    }
  };

  private readonly onMouseDownHandler = (evt: MouseEvent) => {
    evt.preventDefault();

    const position = new Vector2(evt.offsetX, evt.offsetY);
    if (this.onPointerDown) this.onPointerDown(position);
  };

  private readonly onMouseMoveHandler = (evt: MouseEvent) => {
    evt.preventDefault();

    const position = new Vector2(evt.offsetX, evt.offsetY);
    if (this.onPointerMove) this.onPointerMove(position);
  };

  private readonly onPressEndHandler = (evt: MouseEvent) => {
    evt.preventDefault();
    if (this.onPointerUp) this.onPointerUp();
  };

  private readonly onWheelHandler = (evt: WheelEvent) => {
    evt.preventDefault();
    if (!evt.deltaX || !evt.deltaY) return;

    const offset = new Vector2(evt.deltaX, evt.deltaY);
    if (this.onWheel) this.onWheel(offset);
  };

  private readonly onKeyDownHandler = (evt: KeyboardEvent) => {
    if (this.onKey) this.onKey(evt.key);
  };

  constructor(element: HTMLElement | Window) {
    this.element = element;
    this.initListeners();
  }

  dispose() {
    this.removeListeners();
  }

  private getTouchPosition(touch: Touch, canvas: HTMLElement) {
    return new Vector2(
      touch.clientX - canvas.offsetLeft,
      touch.clientY - canvas.offsetTop,
    );
  }

  private initListeners() {
    // mouse
    this.element.addEventListener(
      "wheel",
      this.onWheelHandler as unknown as EventListener,
      ACTIVE,
    );
    this.element.addEventListener(
      "mousemove",
      this.onMouseMoveHandler as unknown as EventListener,
    );
    this.element.addEventListener(
      "mousedown",
      this.onMouseDownHandler as unknown as EventListener,
    );

    // touch
    this.element.addEventListener(
      "touchstart",
      this.onTouchStartHandler as unknown as EventListener,
      ACTIVE,
    );
    this.element.addEventListener(
      "touchmove",
      this.onTouchMoveHandler as unknown as EventListener,
      ACTIVE,
    );

    // type agnostic
    this.element.addEventListener(
      "pointerup",
      this.onPressEndHandler as unknown as EventListener,
    );
    this.element.addEventListener(
      "pointerout",
      this.onPressEndHandler as unknown as EventListener,
    );

    // keyboard
    window.addEventListener("keydown", this.onKeyDownHandler);
  }

  private removeListeners() {
    // mouse
    this.element.removeEventListener(
      "wheel",
      this.onWheelHandler as unknown as EventListener,
    );
    this.element.removeEventListener(
      "mousemove",
      this.onMouseMoveHandler as unknown as EventListener,
    );
    this.element.removeEventListener(
      "mousedown",
      this.onMouseDownHandler as unknown as EventListener,
    );

    // touch
    this.element.removeEventListener(
      "touchstart",
      this.onTouchStartHandler as unknown as EventListener,
    );
    this.element.removeEventListener(
      "touchmove",
      this.onTouchMoveHandler as unknown as EventListener,
    );

    // type agnostic
    this.element.removeEventListener(
      "pointerup",
      this.onPressEndHandler as unknown as EventListener,
    );
    this.element.removeEventListener(
      "pointerout",
      this.onPressEndHandler as unknown as EventListener,
    );

    // keyboard
    this.element.removeEventListener(
      "keydown",
      this.onKeyDownHandler as unknown as EventListener,
    );
  }
}

export default UserInputListener;
