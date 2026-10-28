import "./HotlineTemplate.scss";

import Image from "next/image";
import React from "react";

const HotlineTemplate: React.FC = () => {
  return (
    <div className="HotlineTemplate">
      <div className="HotlineTemplate__imageWrap">
        <Image
          src="/assets/images/scene/DanceFloor/calling-card.webp"
          alt="Calling Card"
          width={1200}
          height={675}
          sizes="(max-width: 768px) 90vw, 60vw"
          priority
          className="HotlineTemplate__image"
        />
        {/* Neon ripple effect - positionable over phone speaker */}
        <div className="HotlineTemplate__ripples" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};

export default HotlineTemplate;
