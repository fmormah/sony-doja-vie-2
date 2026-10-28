"use client";

import React, { ReactNode, useCallback, useEffect, useState } from "react";

import { environment } from "@/config/ae";
import {
  AEService,
  AppreciationEngineLibrary,
  ServicesEntity,
  User,
} from "@/types/ae";

declare global {
  interface Window {
    AEJSReady: (aeJS: AppreciationEngineLibrary) => void;
  }
}

interface AEContextProps {
  libraryLoaded: boolean;
  user?: User;
  authenticate: (service: AEService) => boolean;
  getServiceToken: (service: AEService) => string | undefined;
}

const AEContext = React.createContext<AEContextProps>({} as AEContextProps);

export const AEProvider = ({ children }: { children: ReactNode }) => {
  const [library, setLibrary] = useState<AppreciationEngineLibrary>();
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AUTH_MODE === "localhost") return;
    const script = document.createElement("script");
    script.src = environment.aeLibrary;
    script.async = true;

    const onScriptLoad = () => {
      window.AEJSReady = (aeJS: AppreciationEngineLibrary) => {
        aeJS.settings["scopes"] = environment.scopes;

        aeJS.events.onLogin.addHandler(() => {
          setUser(aeJS.user);
        });

        if (aeJS.events?.onLoaded) {
          aeJS.events.onLoaded.addHandler(() => {
            if (aeJS.loggedIn && aeJS.user) {
              setUser(aeJS.user);
            }
          });
        }

        if (aeJS.events?.onUser) {
          aeJS.events.onUser.addHandler(() => {
            if (aeJS.user) {
              setUser(aeJS.user);
            }
          });
        }

        if (aeJS.loggedIn && aeJS.user) {
          setUser(aeJS.user);
        }

        setLibrary(aeJS);
      };
    };

    const onScriptError = () => {
      script.remove();
    };

    script.addEventListener("load", onScriptLoad);
    script.addEventListener("error", onScriptError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", onScriptLoad);
      script.removeEventListener("error", onScriptError);
    };
  }, []);

  const authenticate = useCallback(
    (service: AEService) => {
      if (!library) {
        console.warn("AE library not loaded yet");
        return false;
      }
      try {
        library.trigger.authenticate(service, "register", window.location.href);
        return true;
      } catch (error) {
        console.error("Authentication failed:", error);
        return false;
      }
    },
    [library],
  );

  const getServiceToken = useCallback(
    (service: AEService) => {
      if (!user || !user.services) return;
      const found = user.services.find(
        (s: ServicesEntity) => s.Service === service,
      );
      return found?.Token;
    },
    [user],
  );

  return (
    <AEContext.Provider
      value={{
        libraryLoaded: !!library,
        user,
        authenticate,
        getServiceToken,
      }}
    >
      {children}
    </AEContext.Provider>
  );
};

export const useAE = () => React.useContext(AEContext);
