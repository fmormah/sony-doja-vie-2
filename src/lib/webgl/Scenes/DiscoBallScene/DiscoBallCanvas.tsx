"use client";

import { useEffect, useRef, useState } from "react";

import Canvas from "@/lib/webgl/Canvas";

import DiscoBallScene, { DiscoBallSceneProps } from "./index";

interface Props extends DiscoBallSceneProps {
  fitContainer?: boolean;
}

export default function DiscoBallCanvas({
  position,
  rotation,
  zoom,
  fitContainer,
}: Props) {
  const [scene, setScene] = useState<DiscoBallScene | null>(null);
  const sceneRef = useRef<DiscoBallScene | null>(null);

  useEffect(() => {
    const newScene = new DiscoBallScene({ position, rotation, zoom });
    setScene(newScene);
    sceneRef.current = newScene;

    return () => {
      newScene.dispose();
    };
  }, []); // Empty deps - only create scene once

  // Update props without remounting
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateProps({ position, rotation, zoom });
    }
  }, [position, rotation, zoom]);

  return scene ? <Canvas scene={scene} fitContainer={fitContainer} /> : null;
}
