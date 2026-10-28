"use client";

import Image from "next/image";
import React from "react";

import { useIsMobile } from "@/utils/deciveDetection";

import styles from "./RotateOverlay.module.scss";

const RotateOverlay: React.FC = () => {
  const isMobile = useIsMobile();
  const [isLandscape, setIsLandscape] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  if (!(isMobile && isLandscape)) return null;

  return (
    <div
      className={styles.RotateOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Rotate your device"
    >
      <Image
        src="/assets/images/Rotate.webp"
        alt=""
        fill
        sizes="100vw"
        priority
        className={styles.RotateOverlayImage}
      />
      <span className="screen-reader-only">
        Please rotate your device to portrait
      </span>
    </div>
  );
};

export default RotateOverlay;
