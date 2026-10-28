export interface AppleMusicActionResult {
  success?: boolean;
  error?: string;
  data?: unknown;
}

export interface SMEAppleMusicConfig {
  [key: string]: unknown;
}

export interface SMEAppleMusic {
  doActions: (
    email: string,
    optIn: boolean,
    mailingLists: string[],
    retargetingConsent: boolean,
  ) => Promise<AppleMusicActionResult>;
}

export interface AppleMusicContextProps {
  isReady: boolean;
  authenticate: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  const SMEAppleMusic: new (config: SMEAppleMusicConfig) => SMEAppleMusic;
}
