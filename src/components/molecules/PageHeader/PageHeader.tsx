import classNames from "classnames";
import Image from "next/image";
import React from "react";

export interface PageHeaderProps {
  src: string;
  alt?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  src,
  alt = "Dojacat",
  className,
}) => {
  return (
    <div className={classNames("PageHeader", className)}>
      <Image
        className={"PageHeader__logo"}
        src={src}
        alt={alt}
        width={184}
        height={24}
        priority
      />
    </div>
  );
};

export default PageHeader;
