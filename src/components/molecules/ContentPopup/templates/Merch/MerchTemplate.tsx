import "./MerchTemplate.scss";

import Image from "next/image";
import React from "react";

const MerchTemplate: React.FC = () => {
  const rackRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div className="MerchTemplate">
      <div className="MerchTemplate__rack" ref={rackRef}>
        <div className="MerchTemplate__scroll" role="list">
          <div className="MerchTemplate__barWrap" aria-hidden>
            <Image
              src="/assets/images/scene/DanceFloor/Bar.webp"
              alt="Clothing rack bar"
              width={1400}
              height={120}
              sizes="(max-width: 768px) 90vw, 70vw"
              priority
              className="MerchTemplate__bar"
            />
          </div>
          <div className="MerchTemplate__shirt s1" role="listitem">
            <Image
              src="/assets/images/scene/DanceFloor/shirt-1.webp"
              alt="Graphic shirt one"
              width={800}
              height={1000}
              sizes="(max-width: 768px) 80vw, 400px"
              className="MerchTemplate__shirtImage"
              priority={false}
            />
          </div>
          <div className="MerchTemplate__shirt s2" role="listitem">
            <Image
              src="/assets/images/scene/DanceFloor/shirt-2.webp"
              alt="Graphic shirt two"
              width={800}
              height={1000}
              sizes="(max-width: 768px) 80vw, 400px"
              className="MerchTemplate__shirtImage"
              priority={false}
            />
          </div>
          <div className="MerchTemplate__shirt s3" role="listitem">
            <Image
              src="/assets/images/scene/DanceFloor/shirt-3.webp"
              alt="Graphic shirt three"
              width={800}
              height={1000}
              sizes="(max-width: 768px) 80vw, 400px"
              className="MerchTemplate__shirtImage"
              priority={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchTemplate;
