"use client";

// styles loaded globally via src/theme/components/index.scss

import classNames from "classnames";
import Image from "next/image";
import React from "react";

import { MuteToggle } from "@/components/atoms/MuteToggle";
import { useAppActions, useAppSelector } from "@/store/AppStore";
import { soundManager } from "@/utils/SoundManager";

export interface FooterProps {
  className?: string;
  muted?: boolean;
  defaultMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  showMuteButton?: boolean;
}

const Footer: React.FC<FooterProps> = ({
  className,
  muted,
  defaultMuted,
  onMutedChange,
  showMuteButton = true,
}) => {
  const isMuted = useAppSelector((s) => s.audioMuted);
  const { setAudioMuted } = useAppActions();
  const handleMutedChange = (m: boolean) => {
    setAudioMuted(m);
    soundManager.setMuted(m);
    onMutedChange?.(m);
  };
  return (
    <footer className={classNames("Footer", className)}>
      <div className="Footer__container">
        <div className="Footer__left">
          <p className="Footer__copy">
            <span className="Footer__copy Footer__copy--top-level">
              <Image
                className="Footer__logo"
                src="/assets/images/rca.svg"
                alt="RCA"
                width={44}
                height={12}
              />
              &copy; 2025{" "}
              <a
                href="https://www.sonymusic.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Sony Music Entertainment
              </a>{" "}
              All Rights Reserved.
            </span>
            <span className="Footer__copy Footer__copy--muted">
              <a
                href="https://www.sonymusic.com/terms-and-conditions/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Terms and Conditions
              </a>{" "}
              <a
                href="https://www.sonymusic.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Privacy Policy
              </a>{" "}
              <a
                href="https://www.sonymusic.com/how-we-use-your-data/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                How We Use Your Data
              </a>
              <br />
              <a
                href="https://www.sonymusic.com/privacy-policy/#your-california-privacy-rights"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Your California Privacy Rights
              </a>{" "}
              <a
                href="https://www.sonymusic.com/ccpa-contact-form/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Do Not Sell My Personal Information
              </a>
            </span>
          </p>
        </div>

        {showMuteButton && (
          <MuteToggle
            muted={muted ?? isMuted}
            defaultMuted={defaultMuted}
            onMutedChange={handleMutedChange}
          />
        )}
      </div>
    </footer>
  );
};

export default Footer;
