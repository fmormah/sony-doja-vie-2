export interface TimedFlag {
  value: string;
  ts: number; // ms since epoch
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export const SESSION_KEYS = {
  lastSignIn: "dc_last_sign_in", // stores TimedFlag { value: provider, ts }
} as const;

export function setTimedFlag(key: string, value: string): void {
  try {
    const payload: TimedFlag = { value, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

export function getTimedFlagAgeMs(key: string): number | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as TimedFlag;
    if (!parsed || typeof parsed.ts !== "number") return undefined;
    return Date.now() - parsed.ts;
  } catch {
    return undefined;
  }
}

export function getTimedFlagValue(key: string): string | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as TimedFlag;
    return parsed?.value;
  } catch {
    return undefined;
  }
}

export function wasFlagSetWithinHours(key: string, hours: number): boolean {
  const age = getTimedFlagAgeMs(key);
  if (age === undefined) return false;
  return age <= hours * ONE_HOUR_MS;
}
