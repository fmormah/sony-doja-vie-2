import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import { AEProvider } from "../../../contexts/AEProvider";
import Footer from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Organisms/Footer",
  component: Footer,
  tags: ["autodocs"],
  args: { muted: false },
  argTypes: {
    muted: { control: "boolean" },
    onMutedChange: { action: "muted-change" },
  },
  decorators: [
    (Story) => (
      <AEProvider>
        .
        <Story />
      </AEProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  render: (args) => {
    const [muted, setMuted] = React.useState(args.muted ?? false);
    React.useEffect(() => {
      setMuted(args.muted ?? false);
    }, [args.muted]);
    return <Footer {...args} muted={muted} onMutedChange={setMuted} />;
  },
  args: { muted: false },
};

export const Muted: Story = {
  render: (args) => {
    const [muted, setMuted] = React.useState(args.muted ?? true);
    React.useEffect(() => {
      setMuted(args.muted ?? true);
    }, [args.muted]);
    return <Footer {...args} muted={muted} onMutedChange={setMuted} />;
  },
  args: { muted: true },
};
