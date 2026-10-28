import { Vector2, Vector3 } from "three";

import UserInputListener from "@/lib/webgl/Core/Interaction/UserInputListener";

export interface DiscoBallRotationConfig {
  rotationSensitivity: number;
  friction: number;
  minVelocity: number;
  baseRotationSpeed: Vector3;
}

export interface DiscoBallRotationManagerProps {
  config?: Partial<DiscoBallRotationConfig>;
  element?: HTMLElement;
  onRotationUpdate?: (rotation: Vector3) => void;
  onMusicSeek?: (timeInSeconds: number) => void;
  onVelocityUpdate?: (velocityMagnitude: number) => void;
  onDragOffset?: (offset: number) => void;
  musicDuration?: number;
  useExternalDragInput?: boolean;
}

const DEFAULT_CONFIG: DiscoBallRotationConfig = {
  rotationSensitivity: 0.0002,
  friction: 0.97,
  minVelocity: 0.001,
  baseRotationSpeed: new Vector3(0, -0.005, 0),
};

// const IS_VELOCITY_IMPACT_ON = false;

export enum RotationMode {
  TRANSITION = "transition",
  INTERACTIVE = "interactive",
}

class DiscoBallRotationManager {
  private config: DiscoBallRotationConfig;
  private inputListener: UserInputListener | null = null;
  private mode: RotationMode = RotationMode.INTERACTIVE;
  private useExternalDragInput: boolean = false;
  
  private isDragging = false;
  private lastMouseX = 0;
  private rotationVelocityY = 0;
  private interactiveRotationY = 0;
  
  private currentRotation = new Vector3();
  private baseRotation = new Vector3();
  
  private onRotationUpdate?: (rotation: Vector3) => void;
  private onMusicSeek?: (timeInSeconds: number) => void;
  private onVelocityUpdate?: (velocityMagnitude: number) => void;
  private onDragOffset?: (offset: number) => void;
  private musicDuration: number = 0;
  private cumulativeDragOffset: number = 0;

  constructor(props?: DiscoBallRotationManagerProps) {
    this.config = { ...DEFAULT_CONFIG, ...props?.config };
    this.onRotationUpdate = props?.onRotationUpdate;
    this.onMusicSeek = props?.onMusicSeek;
    this.onVelocityUpdate = props?.onVelocityUpdate;
    this.onDragOffset = props?.onDragOffset;
    this.musicDuration = props?.musicDuration || 0;
    this.useExternalDragInput = props?.useExternalDragInput ?? false;
    
    if (props?.element && !this.useExternalDragInput) {
      this.initializeInteraction(props.element);
    }
  }

  setMode(mode: RotationMode) {
    const previousMode = this.mode;
    this.mode = mode;
    
    // switching from interactive mode, preserve current rotation as base
    if (previousMode === RotationMode.INTERACTIVE && mode !== RotationMode.INTERACTIVE) {
      this.baseRotation.copy(this.currentRotation);
      this.interactiveRotationY = 0;
      this.rotationVelocityY = 0;
    }
    
    // switching to interactive mode, start from current position
    if (mode === RotationMode.INTERACTIVE && previousMode !== RotationMode.INTERACTIVE) {
      this.baseRotation.copy(this.currentRotation);
      this.interactiveRotationY = 0;
      this.rotationVelocityY = 0;
    }
  }

  setElement(element: HTMLElement) {
    if (this.inputListener) {
      this.inputListener.dispose();
    }
    if (!this.useExternalDragInput) {
      this.initializeInteraction(element);
    }
  }

  setBaseRotation(rotation: Vector3) {
    this.baseRotation.copy(rotation);
  }

  getRotation(): Vector3 {
    return this.currentRotation.clone();
  }

  getMode(): RotationMode {
    return this.mode;
  }

  setMusicDuration(duration: number) {
    this.musicDuration = duration;
  }

  setMusicSeekCallback(callback?: (timeInSeconds: number) => void) {
    this.onMusicSeek = callback;
  }

  setVelocityCallback(callback?: (velocityMagnitude: number) => void) {
    this.onVelocityUpdate = callback;
  }

  setDragOffsetCallback(callback?: (offset: number) => void) {
    this.onDragOffset = callback;
  }

  // external drag input control
  startExternalDrag() {
    if (this.useExternalDragInput && this.mode === RotationMode.INTERACTIVE) {
      this.isDragging = true;
    }
  }

  updateExternalDrag(deltaX: number) {
    if (this.useExternalDragInput && this.isDragging && this.mode === RotationMode.INTERACTIVE) {
      const externalDragSensitivity = this.config.rotationSensitivity * 0.5;
      this.rotationVelocityY += deltaX * externalDragSensitivity;
      
      this.cumulativeDragOffset += deltaX;
      if (this.onDragOffset) {
        this.onDragOffset(this.cumulativeDragOffset);
      }
    }
  }

  endExternalDrag() {
    if (this.useExternalDragInput) {
      this.isDragging = false;
    }
  }

  update(deltaTime: number) {
    switch (this.mode) {
      case RotationMode.TRANSITION:
        break;
        
      case RotationMode.INTERACTIVE:
        this.updateInteractiveRotation(deltaTime);
        break;
    }
  }

  private updateInteractiveRotation(deltaTime: number) {
    this.interactiveRotationY += this.rotationVelocityY * deltaTime * 60;
    this.rotationVelocityY *= this.config.friction;
    if (Math.abs(this.rotationVelocityY) < this.config.minVelocity) {
      this.rotationVelocityY = 0;
    }

    this.currentRotation.set(
      this.baseRotation.x,
      this.baseRotation.y + this.interactiveRotationY,
      this.baseRotation.z
    );

    this.notifyRotationUpdate();
    this.updateVelocity();
  }

  private updateVelocity() {
    if (this.onVelocityUpdate) {
      this.onVelocityUpdate(1.0);
    }
  }

  private initializeInteraction(element: HTMLElement) {
    if (this.inputListener) {
      this.inputListener.dispose();
    }
    
    this.inputListener = new UserInputListener(element);
    
    this.inputListener.onPointerDown = (position: Vector2) => {
      if (this.mode !== RotationMode.INTERACTIVE) {
        return;
      }
      this.isDragging = true;
      this.lastMouseX = position.x;
    };

    this.inputListener.onPointerMove = (position: Vector2) => {
      if (!this.isDragging || this.mode !== RotationMode.INTERACTIVE) return;
      const deltaX = position.x - this.lastMouseX;
      this.rotationVelocityY += deltaX * this.config.rotationSensitivity;
      
      // track cumulative drag offset for text movement
      this.cumulativeDragOffset += deltaX;
      if (this.onDragOffset) {
        this.onDragOffset(this.cumulativeDragOffset);
      }
      
      this.lastMouseX = position.x;
    };

    this.inputListener.onPointerUp = () => {
      this.isDragging = false;
    };
  }

  private notifyRotationUpdate() {
    if (this.onRotationUpdate) {
      this.onRotationUpdate(this.currentRotation);
    }
  }

  updateConfig(config: Partial<DiscoBallRotationConfig>) {
    this.config = { ...this.config, ...config };
  }

  dispose() {
    if (this.inputListener) {
      this.inputListener.dispose();
      this.inputListener = null;
    }
  }
}

export default DiscoBallRotationManager;