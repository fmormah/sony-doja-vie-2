// @refresh reset
"use client";
import { useEffect, useRef } from "react";

import SceneBase from "../SceneBase";
import { CanvasElement } from "./styles";
import css from "./styles.module.scss";

interface Props {
  scene: SceneBase;
  children?: React.ReactNode;
  fitContainer?: boolean;
  transparentBg?: boolean;
  noPointerEvents?: boolean;
}

export default function Canvas({
  scene,
  fitContainer,
  transparentBg,
  noPointerEvents,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneBase>(null);

  const initScene = async (container: HTMLDivElement) => {
    if (!sceneRef.current) return;
    await sceneRef.current.init(container);
    sceneRef.current.start();
  };

  useEffect(() => {
    const sceneCache = sceneRef.current;
    if (containerRef.current && !sceneRef.current && scene) {
      sceneRef.current = scene;
      initScene(containerRef.current);
    }

    return () => {
      sceneCache?.dispose();
    };
  }, [scene]);

  const className = [
    fitContainer ? css.fitContainer : undefined,
    transparentBg ? css.transparent : undefined,
    noPointerEvents ? css.noPointer : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <CanvasElement
      ref={containerRef}
      className={className || undefined}
    ></CanvasElement>
  );
}
