import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import AuthProviders from "../../../contexts/AuthProviders";
import SignInScene from "./SignInScene";

const meta: Meta<typeof SignInScene> = {
  title: "Organisms/SignInScene",
  component: SignInScene,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    onConnectApple: { action: "connect-apple" },
    onConnectSpotify: { action: "connect-spotify" },
    onEmailSubmit: { action: "email-submit" },
    onAuthSuccess: { action: "auth-success" },
  },
  decorators: [
    (Story) => (
      <AuthProviders>
        <Story />
      </AuthProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SignInScene>;

export const Default: Story = {
  args: {},
};
