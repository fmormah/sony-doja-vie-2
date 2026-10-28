"use client";

import { styled } from "@phantomstudios/css-components";
import cn from "classnames";
import React, { forwardRef, useCallback, useState } from "react";

import { FONT_VARIABLES } from "@/theme/fonts";

import css from "./Hotspot.module.scss";

export interface HotspotProps {
  x: number; // Percentage position X (0-100)
  y: number; // Percentage position Y (0-100)
  label?: string;
  size?: "small" | "medium" | "large";
  visible?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

const HotspotElement = styled("div", {
  css: [css.Hotspot, FONT_VARIABLES],
});

const Hotspot = forwardRef<HTMLButtonElement, HotspotProps>(
  (
    {
      x,
      y,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      label,
      size = "medium",
      visible = true,
      onClick,
      onKeyDown,
      className,
      style,
    },
    ref,
  ) => {
    const [isActive, setIsActive] = useState(false);

    const handleClick = useCallback(() => {
      setIsActive(true);
      onClick?.();
      setTimeout(() => setIsActive(false), 600);
    }, [onClick]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleClick();
        }
        onKeyDown?.(e);
      },
      [handleClick, onKeyDown],
    );

    return (
      <HotspotElement
        className={cn(
          className,
          css[`size-${size}`],
          { [css.active]: isActive },
          { [css.flipLabel]: x > 50 },
          { [css.hidden]: visible === false },
        )}
        style={{
          ...style,
          left: `${x}%`,
          top: `${y}%`,
        }}
      >
        <div className={css.ring}>
          <div className={css.ringGlow} />
        </div>
        {/* {label && <span className={css.label}>{label}</span>} */}
        <button
          ref={ref}
          className={css.button}
          type="button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        />
      </HotspotElement>
    );
  },
);

Hotspot.displayName = "Hotspot";

export default Hotspot;
