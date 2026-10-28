"use client";

import React from "react";
import * as THREE from "three";

interface SmokeProps {
  fogThickness?: number;
}

const Smoke: React.FC<SmokeProps> = ({ fogThickness = 0.04 }) => {
  const smokeParticlesRef = React.useRef<THREE.Mesh[]>([]);
  const materialRef = React.useRef<THREE.MeshLambertMaterial | null>(null);
  const geometryRef = React.useRef<THREE.PlaneGeometry | null>(null);
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);

  // Load texture with local-first, remote-fallback strategy
  React.useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();

    const localUrl = "/assets/images/clouds.png";
    const absoluteLocal =
      typeof window !== "undefined"
        ? new URL(localUrl, window.location.origin).href
        : localUrl;

    const finish = (tex: THREE.Texture) => {
      if (cancelled) return;
      // Configure texture to reduce GPU pressure
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      setTexture(tex);
    };

    const loadFallback = () => {
      const remoteUrl =
        "https://raw.githubusercontent.com/marcobiedermann/playground/master/three.js/smoke-particles/dist/assets/images/clouds.png";
      loader.load(remoteUrl, finish, undefined, () => {
        // If even fallback fails, leave texture null; component will render nothing
        if (!cancelled) setTexture(null);
      });
    };

    loader.load(absoluteLocal, finish, undefined, loadFallback);

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!texture) return;

    const smokeMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    materialRef.current = smokeMaterial;

    const smokeGeometry = new THREE.PlaneGeometry(300, 300);
    geometryRef.current = smokeGeometry;

    const smokeMeshes: THREE.Mesh[] = [];
    const maxParticles = 300; // baseline
    const limit = Math.max(
      0,
      Math.floor((fogThickness ?? 0.04) * maxParticles),
    );

    for (let i = 0; i < limit; i++) {
      const smokeMesh = new THREE.Mesh(smokeGeometry, smokeMaterial);
      smokeMesh.position.set(
        Math.random() * 500 - 250,
        Math.random() * 500 - 250,
        Math.random() * 1000 - 100,
      );
      smokeMesh.rotation.z = Math.random() * 360;
      smokeMeshes.push(smokeMesh);
    }
    smokeParticlesRef.current = smokeMeshes;

    return () => {
      smokeParticlesRef.current = [];
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, [texture, fogThickness]);

  React.useEffect(() => {
    return () => {
      // Cleanup texture when component unmounts
      texture?.dispose?.();
    };
  }, [texture]);

  // Animate rotation
  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      for (let i = 0; i < smokeParticlesRef.current.length; i++) {
        smokeParticlesRef.current[i].rotation.z += 0.2 * (1 / 60);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!texture) {
    return null;
  }

  return (
    <group>
      {smokeParticlesRef.current.map((particle, index) => (
        <primitive key={index} object={particle} />
      ))}
    </group>
  );
};

export default Smoke;
