"use client";

import classNames from "classnames";
import Image from "next/image";
import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  iconSrc?: string;
  fullWidth?: boolean;
  iconOnly?: boolean;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  iconSrc,
  fullWidth = false,
  iconOnly = false,
  href,
  className,
  ...rest
}) => {
  const classList = classNames(
    "Button",
    {
      "Button--full-width": fullWidth,
      "Button--icon-only": iconOnly,
      "Button--no-icon": !iconSrc,
    },
    className,
  );

  const content = (
    <>
      {iconSrc ? (
        <span className="Button__icon" aria-hidden>
          <Image src={iconSrc} alt="" width={24} height={24} />
        </span>
      ) : null}
      {!iconOnly ? (
        <span className="Button__label">
          <span className="Button__label-text">{label}</span>
          <span className="Button__label-text" aria-hidden>
            {label}
          </span>
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        className={classList}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...(rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classList} {...rest}>
      {content}
    </button>
  );
};

export default Button;
