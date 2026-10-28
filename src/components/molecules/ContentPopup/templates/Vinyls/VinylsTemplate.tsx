import "./VinylsTemplate.scss";

import Image from "next/image";
import React from "react";

const VinylsTemplate: React.FC = () => {
  return (
    <div className="VinylsTemplate">
      <div className="VinylsTemplate__imageWrap">
        <Image
          src="/assets/images/scene/DanceFloor/vinyls.webp"
          alt="Vinyls"
          width={1200}
          height={675}
          sizes="(max-width: 768px) 90vw, 60vw"
          priority
          className="VinylsTemplate__image"
        />
      </div>
    </div>
  );
};

export default VinylsTemplate;
