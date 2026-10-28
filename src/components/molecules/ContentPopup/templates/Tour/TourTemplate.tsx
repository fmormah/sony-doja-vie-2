import "./TourTemplate.scss";

import Image from "next/image";
import React from "react";

const TourTemplate: React.FC = () => {
  return (
    <div className="TourTemplate">
      <div className="TourTemplate__imageWrap">
        <Image
          src="/assets/images/scene/DanceFloor/tour-img.webp"
          alt="Tour"
          width={1200}
          height={675}
          sizes="(max-width: 768px) 90vw, 60vw"
          priority
          className="TourTemplate__image"
        />
      </div>
    </div>
  );
};

export default TourTemplate;
