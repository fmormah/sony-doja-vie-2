"use client";

import classNames from "classnames";
import React from "react";

import Button from "@/components/atoms/Button";
import { trackCategory } from "@/utils/tracking";

export interface PostLoadSceneProps {
  className?: string;
  topText?: string;
  bottomText?: string;
  onContinue?: () => void;
}

const DEFAULT_TOP = "PULLING UP AT THE CLUB.";
const DEFAULT_BOTTOM = "BUT WILL YOU GET IN?";

const PostLoadScene: React.FC<PostLoadSceneProps> = ({
  className,
  topText = DEFAULT_TOP,
  bottomText = DEFAULT_BOTTOM,
  onContinue,
}) => {
  const [entered, setEntered] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);
  const hasClickedRef = React.useRef(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleContinue = () => {
    if (hasClickedRef.current) return;
    hasClickedRef.current = true;
    trackCategory("enterclick");
    setExiting(true);
    timerRef.current = window.setTimeout(() => {
      onContinue?.();
    }, 500);
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <section className={classNames("PostLoadScene", className)}>
      <div className="PostLoadScene__content">
        <h1
          className={classNames(
            "headline--h2",
            "PostLoadScene__line",
            "PostLoadScene__line--top",
            {
              "is-entered": entered,
              "is-exiting": exiting,
            },
          )}
        >
          {topText}
        </h1>
        <h1
          className={classNames(
            "headline--h2",
            "PostLoadScene__line",
            "PostLoadScene__line--bottom",
            {
              "is-entered": entered,
              "is-exiting": exiting,
            },
          )}
        >
          {bottomText}
        </h1>

        <div className="PostLoadScene__actions">
          <Button
            label={"I don't care, just drive"}
            iconSrc="/assets/images/icons/priority.svg"
            className={classNames("PostLoadScene__button", {
              "is-entered": entered,
              "is-exiting": exiting,
            })}
            onClick={handleContinue}
          />
        </div>
      </div>
    </section>
  );
};

export default PostLoadScene;
