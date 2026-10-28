"use client";

import React from "react";

import { AEProvider } from "./AEProvider";
import { AppleMusicProvider } from "./AppleMusicProvider";

export const AuthProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AEProvider>
      <AppleMusicProvider>{children}</AppleMusicProvider>
    </AEProvider>
  );
};

export default AuthProviders;
