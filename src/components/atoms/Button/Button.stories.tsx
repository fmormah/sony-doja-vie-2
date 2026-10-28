import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button, { type ButtonProps } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    label: "Connect with Spotify" satisfies ButtonProps["label"],
    iconSrc: "/assets/images/icons/spotify.svg",
    disabled: false,
    fullWidth: false,
  },
  argTypes: {
    label: { control: "text" },
    iconSrc: { control: "text" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    onClick: { action: "click" },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    label: "Connect with Spotify",
    iconSrc: "/assets/images/icons/spotify.svg",
  },
};

export const AppleMusic: Story = {
  args: {
    label: "Connect with Apple Music" satisfies ButtonProps["label"],
    iconSrc: "/assets/images/icons/apple.svg",
  },
};

export const WhatsApp: Story = {
  args: {
    label: "Share on WhatsApp" satisfies ButtonProps["label"],
    iconSrc: "/assets/images/icons/whatsapp.svg",
  },
};

export const Priority: Story = {
  args: {
    label: "Priority" satisfies ButtonProps["label"],
    iconSrc: "/assets/images/icons/priority.svg",
  },
};

export const Send: Story = {
  args: {
    label: "Send" satisfies ButtonProps["label"],
    iconSrc: "/assets/images/icons/send.svg",
  },
};

export const World: Story = {
  args: {
    label: "World" satisfies ButtonProps["label"],
    iconSrc: "/assets/images/icons/world.svg",
  },
};

export const NoIcon: Story = {
  args: {
    label: "Continue" satisfies ButtonProps["label"],
    iconSrc: undefined,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled" satisfies ButtonProps["label"],
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "Full Width" satisfies ButtonProps["label"],
    fullWidth: true,
  },
};

export const IconOnly: Story = {
  args: {
    label: "" as unknown as ButtonProps["label"],
    iconOnly: true,
    iconSrc: "/assets/images/icons/spotify.svg",
    "aria-label": "Open Spotify",
  },
};

export const WithHref: Story = {
  args: {
    label: "Open Spotify",
    iconSrc: "/assets/images/icons/spotify.svg",
    href: "https://open.spotify.com/",
  },
};
