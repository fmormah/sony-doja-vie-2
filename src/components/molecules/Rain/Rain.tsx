"use client";

import "./Rain.scss";

import React, { useEffect, useState } from "react";

interface Drop {
  id: number;
  left: string;
  top: string;
}

interface RainProps {
  rainIntensity?: number;
  angleDeg?: number;
}

const Rain: React.FC<RainProps> = ({ rainIntensity = 0.33, angleDeg = 0 }) => {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    const nbDrop = Math.floor((rainIntensity ?? 0.33) * 1500);

    function randRange(minNum: number, maxNum: number) {
      return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    }

    const newDrops: Drop[] = [];
    for (let i = 1; i < nbDrop; i++) {
      const dropLeft = randRange(0, 1600);
      const dropTop = randRange(-1000, 1400);

      newDrops.push({
        id: i,
        left: `${dropLeft}px`,
        top: `${dropTop}px`,
      });
    }
    setDrops(newDrops);
  }, [rainIntensity]);

  const radians = (angleDeg * Math.PI) / 180;
  const tan = Math.tan(radians);

  return (
    <section
      className="rain"
      style={
        {
          "--fall-x": `${900 * tan}px`,
          "--drop-rotate": `${angleDeg}deg`,
        } as React.CSSProperties
      }
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="drop"
          style={{
            left: drop.left,
            top: drop.top,
          }}
        >
          <div className="drop-rod" />
        </div>
      ))}
    </section>
  );
};

export default Rain;
