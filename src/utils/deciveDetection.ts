import React from "react";

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor;
  const isMobileUserAgent =
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase(),
    );
  const isSmallScreen = window.innerWidth <= 768;

  return isMobileUserAgent || isSmallScreen;
};

export const isAndroidDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor || "";
  return /android/i.test(userAgent.toLowerCase());
};

export const isIOSDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor || "";
  return (
    /iphone|ipad|ipod/i.test(userAgent.toLowerCase()) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ); // iPad Pro detection
};

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export const useIsAndroid = (): boolean => {
  const [isAndroid, setIsAndroid] = React.useState(false);

  React.useEffect(() => {
    setIsAndroid(isAndroidDevice());
  }, []);

  return isAndroid;
};

export const useIsIOS = (): boolean => {
  const [isIOS, setIsIOS] = React.useState(false);

  React.useEffect(() => {
    setIsIOS(isIOSDevice());
  }, []);

  return isIOS;
};
