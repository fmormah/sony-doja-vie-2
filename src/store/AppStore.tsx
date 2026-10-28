"use client";

import React from "react";

export interface AppState {
  audioMuted: boolean;
  authProvider?: "spotify" | "apple";
  isSuperfan?: boolean;
}

type AppAction =
  | { type: "SET_AUDIO_MUTED"; payload: boolean }
  | { type: "TOGGLE_AUDIO_MUTED" }
  | { type: "SET"; payload: Partial<AppState> };

const initialState: AppState = {
  audioMuted: false,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_AUDIO_MUTED":
      return { ...state, audioMuted: action.payload };
    case "TOGGLE_AUDIO_MUTED":
      return { ...state, audioMuted: !state.audioMuted };
    case "SET":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppStoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppStoreContext = React.createContext<AppStoreContextValue | undefined>(
  undefined,
);

export function AppStoreProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: Partial<AppState>;
}): React.ReactElement {
  const [state, dispatch] = React.useReducer(
    reducer,
    value ? { ...initialState, ...value } : initialState,
  );

  const contextValue = React.useMemo(
    () => ({ state, dispatch }),
    [state, dispatch],
  );

  return (
    <AppStoreContext.Provider value={contextValue}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore(): AppState {
  const ctx = React.useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx.state;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const ctx = React.useContext(AppStoreContext);
  if (!ctx)
    throw new Error("useAppDispatch must be used within AppStoreProvider");
  return ctx.dispatch;
}

export function useAppSelector<T>(selector: (state: AppState) => T): T {
  const state = useAppStore();
  return selector(state);
}

export function useAppActions() {
  const dispatch = useAppDispatch();
  return {
    setAudioMuted: (muted: boolean) =>
      dispatch({ type: "SET_AUDIO_MUTED", payload: muted }),
    toggleAudioMuted: () => dispatch({ type: "TOGGLE_AUDIO_MUTED" }),
    set: (patch: Partial<AppState>) =>
      dispatch({ type: "SET", payload: patch }),
  };
}
