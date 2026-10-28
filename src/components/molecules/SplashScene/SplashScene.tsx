"use client";

import "./SplashScene.scss";

import React from "react";

export interface SplashSceneProps {
  onContinue?: () => void;
  src?: string;
}

const DEFAULT_SRC = "/assets/videos/splash-screen.mp4";

const SplashScene: React.FC<SplashSceneProps> = ({ onContinue, src }) => {
  const timeoutRef = React.useRef<number | null>(null);
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  const handleEnded = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsFadingOut(true);
    timeoutRef.current = window.setTimeout(() => {
      onContinue?.();
    }, 3000);
  }, [onContinue]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`SplashScene${isFadingOut ? " is-fading" : ""}`}
      onClick={(e) => e.stopPropagation()}
      aria-label="Splash"
    >
      <video
        className="SplashScene__video"
        src={src || DEFAULT_SRC}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
      />
    </div>
  );
};

export default SplashScene;
