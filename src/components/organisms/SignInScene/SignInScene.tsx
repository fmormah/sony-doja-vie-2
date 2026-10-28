"use client";

import classNames from "classnames";
import React from "react";

import Button from "@/components/atoms/Button";
import EmailInput from "@/components/atoms/EmailInput";
import { environment } from "@/config/ae";
import { useAE } from "@/contexts/AEProvider";
import { useAppleMusic } from "@/contexts/AppleMusicProvider";
import { useAppActions } from "@/store/AppStore";
import { AEService } from "@/types/ae";
import { SESSION_KEYS, setTimedFlag } from "@/utils/session";
import { SPOTIFY_BTN_DATA_ATTRIBUTE, spotifyApi } from "@/utils/spotify";
import { checkSuperFan, FanType } from "@/utils/superfan";
import { trackCategory, trackFanType } from "@/utils/tracking";

export interface SignInSceneProps {
  className?: string;
  onConnectSpotify?: () => void;
  onConnectApple?: () => void;
  onEmailSubmit?: (email: string) => void;
  onAuthSuccess?: () => void;
  authMode?: "localhost" | "localMe" | "prod";
}

const SignInScene: React.FC<SignInSceneProps> = ({
  className,
  onConnectSpotify,
  onConnectApple,
  onEmailSubmit,
  onAuthSuccess,
  authMode = "localMe",
}) => {
  const [showEmailInput, setShowEmailInput] = React.useState(false);
  const [introText, setIntroText] = React.useState(
    authMode === "localhost" ? "Explore Club Vie.\nNo sign-in needed for this demo." : "Connect your music\nto get on the guestlist.",
  );
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const { libraryLoaded, authenticate, user, getServiceToken } = useAE();
  const { isReady: isAppleReady, authenticate: authenticateApple } =
    useAppleMusic();
  const { set } = useAppActions();

  // Check if user is already authenticated
  const hasAdvancedRef = React.useRef(false);

  React.useEffect(() => {
    if (authMode === "localhost") return; // bypass real user flow in localhost mode
    if (user && !hasAdvancedRef.current) {
      setIntroText("Let's ride...");
      setIsAuthenticated(true);
      hasAdvancedRef.current = true;

      // Get the Spotify token and set it in the API client
      const spotifyToken = getServiceToken(AEService.SPOTIFY);
      if (spotifyToken) {
        trackCategory("spotify_auth_success_p2");
        spotifyApi.setAccessToken(spotifyToken);
        set({ authProvider: "spotify" });
        // Persist recent provider for auto-skip on reload
        setTimedFlag(SESSION_KEYS.lastSignIn, "spotify");

        // Check superfan status after setting the token
        checkSuperFan(
          (fanType: FanType) => {
            trackFanType(fanType);
            set({ isSuperfan: fanType === FanType.SUPERFAN });
          },
          (error) => {
            console.error("Failed to check superfan status:", error);
          },
        );
      } else {
        console.error("No Spotify token available after authentication");
      }

      // Small delay to ensure state updates are processed before advancing
      setTimeout(() => {
        onAuthSuccess?.();
      }, 100);
    }
  }, [user, getServiceToken, onAuthSuccess, authMode, set]);

  const bypassAdvance = () => {
    setIntroText("Let's ride...");
    setIsAuthenticated(true);
    setTimedFlag(SESSION_KEYS.lastSignIn, "localhost");
    if (!hasAdvancedRef.current) {
      hasAdvancedRef.current = true;
      onAuthSuccess?.();
    }
  };

  const handleSpotifyClick = () => {
    trackCategory("spotify_presave_click_p2");
    if (authMode === "localhost") {
      onConnectSpotify?.();
      set({ authProvider: "spotify", isSuperfan: false });
      setTimedFlag(SESSION_KEYS.lastSignIn, "spotify");
      bypassAdvance();
      return;
    }
    if (process.env.NODE_ENV === "development") {
      authenticate(AEService.SPOTIFY);
      onConnectSpotify?.();
      // Persist intent so a successful callback can auto-skip
      setTimedFlag(SESSION_KEYS.lastSignIn, "spotify");
    } else {
      window.location.href = environment.presave.spotifyUrl;
    }
  };

  const handleAppleClick = () => {
    trackCategory("apple_presave_click_p2");
    if (authMode === "localhost") {
      onConnectApple?.();
      set({ authProvider: "apple", isSuperfan: false });
      setTimedFlag(SESSION_KEYS.lastSignIn, "apple");
      bypassAdvance();
      return;
    }
    setShowEmailInput(true);
    onConnectApple?.();
  };

  const handleEmailSubmit = async (email: string) => {
    if (authMode === "localhost") {
      onEmailSubmit?.(email);
      set({ authProvider: "apple", isSuperfan: false });
      setTimedFlag(SESSION_KEYS.lastSignIn, "apple");
      bypassAdvance();
      return;
    }
    const result = await authenticateApple(email);
    if (result.success) {
      trackCategory("apple_auth_success_p2");
      setIntroText("Let's ride...");
      setIsAuthenticated(true);
      onEmailSubmit?.(email);
      set({ authProvider: "apple", isSuperfan: false });
      setTimedFlag(SESSION_KEYS.lastSignIn, "apple");
      if (!hasAdvancedRef.current) {
        hasAdvancedRef.current = true;
        onAuthSuccess?.();
      }
    }
  };

  const spotifyDisabled = authMode === "localhost" ? false : !libraryLoaded;
  const appleDisabled = authMode === "localhost" ? false : !isAppleReady;

  return (
    <section className={classNames("SignInScene", className)}>
      <div
        className="SignInScene__container"
        role="region"
        aria-label="Connect your music"
      >
        <div className="SignInScene__media">
          <video
            className="SignInScene__video"
            src="/assets/videos/login-video.mp4"
            autoPlay
            muted
            playsInline
            aria-label="Hero background video"
          />
        </div>

        <p className="SignInScene__intro paragraph--md" aria-live="polite">
          {introText.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < introText.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>

        {!isAuthenticated ? (
          <div
            className="SignInScene__actions"
            role="group"
            aria-label="Music providers"
          >
            <Button
              label={authMode === "localhost" ? "Enter demo" : "Connect with Spotify"}
              iconSrc={authMode === "localhost" ? undefined : "/assets/images/icons/spotify.svg"}
              onClick={handleSpotifyClick}
              fullWidth
              aria-label={authMode === "localhost" ? "Enter demo" : "Connect with Spotify"}
              disabled={spotifyDisabled}
              {...SPOTIFY_BTN_DATA_ATTRIBUTE}
            />

            {authMode !== "localhost" && <div className="SignInScene__swap-container">
              <Button
                label="Connect with Apple Music"
                iconSrc="/assets/images/icons/apple.svg"
                onClick={handleAppleClick}
                fullWidth
                aria-label="Connect with Apple Music"
                className={classNames("SignInScene__apple-button", {
                  "SignInScene__apple-button--hidden": showEmailInput,
                })}
                disabled={appleDisabled}
              />
              <EmailInput
                placeholder="email@domain.com"
                onSubmit={handleEmailSubmit}
                className={classNames("SignInScene__email-input", {
                  "SignInScene__email-input--visible": showEmailInput,
                })}
              />
            </div>}
          </div>
        ) : null}

        <p
          className="SignInScene__legal paragraph--mini"
          aria-label="Legal copy"
        >
          {authMode === "localhost" ? "Portfolio demo — no account connection or registration." : <>By connecting you agree to receive news<br />from Doja Cat and Sony Music.</>}
        </p>
      </div>
    </section>
  );
};

export default SignInScene;
