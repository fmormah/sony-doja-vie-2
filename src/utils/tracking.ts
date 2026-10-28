
export enum EventCategory {
  SPOTIFY_PRESAVE_CLICK = "spotify_presave_click",
  SPOTIFY_AUTH_SUCCESS = "spotify_auth_success",
  APPLE_AUTH_CLICK = "apple_auth_click",
  APPLE_AUTH_SUCCESS = "apple_auth_success",

  ENTER_MAIN_VIEW = "enter_main_view",
  SUPERFAN_TYPE_DETECTED = "superfan_type_detected",
  REGULAR_TYPE_DETECTED = "regular_type_detected",

  HOTSPOT_ENTER = "hotspot_enter",
  HOTSPOT_EXIT = "hotspot_exit",
}

interface EventData {
  category: EventCategory;
  value?: { [k: string]: boolean | string | number | null };
}

// Tracking is disabled for this project. Keep the API for existing UI callers.

export const trackEvent = (_data: EventData): void => {};

type TrackingValue =
  | { [k: string]: boolean | string | number | null }
  | undefined;

export const trackCategory = (_category: string, _value?: TrackingValue): void => {};

export const trackMusicService = (
  service: "spotify" | "apple",
  action: "click" | "success",
) => {
  const eventMap = {
    "spotify-click": EventCategory.SPOTIFY_PRESAVE_CLICK,
    "spotify-success": EventCategory.SPOTIFY_AUTH_SUCCESS,
    "apple-click": EventCategory.APPLE_AUTH_CLICK,
    "apple-success": EventCategory.APPLE_AUTH_SUCCESS,
  };

  trackEvent({
    category: eventMap[`${service}-${action}`],
    value: { music_service: service },
  });
};

export const trackHotspot = (label: string, action: "enter" | "exit") => {
  trackEvent({
    category:
      action === "enter"
        ? EventCategory.HOTSPOT_ENTER
        : EventCategory.HOTSPOT_EXIT,
    value: {
      hotspot_label: label,
    },
  });
};

export const trackFanType = (fanType: "superfan" | "regular") => {
  trackEvent({
    category:
      fanType === "superfan"
        ? EventCategory.SUPERFAN_TYPE_DETECTED
        : EventCategory.REGULAR_TYPE_DETECTED,
    value: {
      fan_type: fanType,
    },
  });
};
