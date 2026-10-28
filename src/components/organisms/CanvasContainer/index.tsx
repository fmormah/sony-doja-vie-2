"use client";

import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import Canvas from "@/lib/webgl/Canvas";
import DiscoBallWithSmokeScene from "@/lib/webgl/Scenes/DiscoBallWithSmokeScene";

export interface CanvasContainerProps {
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
  className?: string;
  containerStyle?: CSSProperties;
  onMusicSeek?: (timeInSeconds: number) => void;
  onVelocityUpdate?: (playbackRate: number) => void;
  onDragOffset?: (offset: number) => void;
  musicDuration?: number;
}

export interface CanvasContainerRef {
  startDrag: () => void;
  updateDrag: (deltaX: number) => void;
  endDrag: () => void;
}

const CanvasContainer = forwardRef<CanvasContainerRef, CanvasContainerProps>(
  (
    {
      position,
      rotation,
      zoom,
      smokeDensity,
      smokeSpeed,
      smokeOpacity,
      smokeColor,
      renderSmoke,
      enableInteraction = false,
      isZooming = false,
      className,
      containerStyle,
      onMusicSeek,
      onVelocityUpdate,
      onDragOffset,
      musicDuration,
    },
    ref,
  ) => {
    const [scene, setScene] = useState<DiscoBallWithSmokeScene | null>(null);
    const sceneRef = useRef<DiscoBallWithSmokeScene | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        startDrag: () => {
          if (sceneRef.current) {
            sceneRef.current.startDrag();
          }
        },
        updateDrag: (deltaX: number) => {
          if (sceneRef.current) {
            sceneRef.current.updateDrag(deltaX);
          }
        },
        endDrag: () => {
          if (sceneRef.current) {
            sceneRef.current.endDrag();
          }
        },
      }),
      [],
    );

    useEffect(() => {
      const newScene = new DiscoBallWithSmokeScene({
        position,
        rotation,
        zoom,
        smokeDensity,
        smokeSpeed,
        smokeOpacity,
        smokeColor,
        renderSmoke,
        enableInteraction,
        isZooming,
        onMusicSeek,
        onVelocityUpdate,
        onDragOffset,
        musicDuration,
      });
      setScene(newScene);
      sceneRef.current = newScene;

      return () => {
        newScene.dispose();
      };
    }, []);

    useEffect(() => {
      if (sceneRef.current) {
        sceneRef.current.updateProps({
          position,
          rotation,
          zoom,
          smokeDensity,
          smokeSpeed,
          smokeOpacity,
          smokeColor,
          renderSmoke,
          enableInteraction,
          isZooming,
          onMusicSeek,
          onVelocityUpdate,
          onDragOffset,
          musicDuration,
        });
      }
    }, [
      position,
      rotation,
      zoom,
      smokeDensity,
      smokeSpeed,
      smokeOpacity,
      smokeColor,
      enableInteraction,
      isZooming,
      onMusicSeek,
      onVelocityUpdate,
      onDragOffset,
      musicDuration,
    ]);

    return scene ? (
      <div className={className} style={containerStyle}>
        <Canvas
          scene={scene}
          transparentBg
          noPointerEvents={!enableInteraction || isZooming}
          fitContainer
        />
      </div>
    ) : null;
  },
);

CanvasContainer.displayName = "CanvasContainer";

export default CanvasContainer;
