"use client";

import classNames from "classnames";
import Image from "next/image";
import React from "react";

export interface MuteToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  defaultMuted?: boolean;
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
}

const MuteToggle: React.FC<MuteToggleProps> = ({
  defaultMuted = false,
  muted,
  onMutedChange,
  className,
  onClick,
  ...rest
}) => {
  const isControlled = typeof muted === "boolean";
  const [uncontrolledMuted, setUncontrolledMuted] =
    React.useState<boolean>(defaultMuted);
  const effectiveMuted = isControlled ? (muted as boolean) : uncontrolledMuted;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (isControlled) {
      onMutedChange?.(!effectiveMuted);
    } else {
      setUncontrolledMuted((prev) => !prev);
      onMutedChange?.(!uncontrolledMuted);
    }
    onClick?.(event);
  };
  return (
    <button
      type="button"
      aria-pressed={effectiveMuted}
      aria-label={effectiveMuted ? "Unmute" : "Mute"}
      className={classNames(
        "MuteToggle",
        { "MuteToggle--muted": effectiveMuted },
        className,
      )}
      onClick={handleClick}
      {...rest}
    >
      <Image
        className="MuteToggle__icon"
        src="/assets/images/unmuted.svg"
        alt="Audio"
        width={48}
        height={48}
      />
    </button>
  );
};

export default MuteToggle;
