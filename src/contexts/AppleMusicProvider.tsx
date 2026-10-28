"use client";

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { appleMusicConfig } from "@/config/appleMusic";
import { useAE } from "@/contexts/AEProvider";
import type { AppleMusicContextProps,SMEAppleMusic } from "@/types/appleMusic";

const AppleMusicContext = React.createContext<AppleMusicContextProps>({
  isReady: false,
  authenticate: async () => ({ success: false }),
});

export const AppleMusicProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const appleMusicRef = useRef<SMEAppleMusic | null>(null);
  const scriptsLoadedRef = useRef(false);
  const { libraryLoaded } = useAE();

  // load Apple Music scripts once (in parallel with AE)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AUTH_MODE === "localhost") return;
    if (scriptsLoadedRef.current) return;
    scriptsLoadedRef.current = true;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => resolve(); // Continue on error
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript("https://forms.sonymusicfans.com/apple-music/amk.js"),
      loadScript("https://js-cdn.music.apple.com/musickit/v1/musickit.js"),
    ]);
  }, []);

  // initialize Apple Music when AE is ready
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AUTH_MODE === "localhost") return;
    if (!libraryLoaded || isReady) return;

    const initializeAppleMusic = () => {
      try {
        if (typeof SMEAppleMusic !== "undefined") {
          appleMusicRef.current = new SMEAppleMusic(appleMusicConfig);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to initialize Apple Music:", error);
      }
    };

    // try immediately, then with small delay if needed
    initializeAppleMusic();
    if (!isReady) {
      setTimeout(initializeAppleMusic, 1000);
    }
  }, [libraryLoaded, isReady]);

  const authenticate = useCallback(async (email: string) => {
    if (!appleMusicRef.current) {
      return {
        success: false,
        error: "Apple Music not initialized. Please try again.",
      };
    }

    try {
      await appleMusicRef.current.doActions(
        email,
        false,
        ["a0S61000001YplPEAS"],
        false,
      );
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Authentication failed. Please try again.",
      };
    }
  }, []);

  return (
    <AppleMusicContext.Provider value={{ isReady, authenticate }}>
      {children}
    </AppleMusicContext.Provider>
  );
};

export const useAppleMusic = () => React.useContext(AppleMusicContext);
