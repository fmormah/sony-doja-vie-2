import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import MuteToggle from "./MuteToggle";

const meta: Meta<typeof MuteToggle> = {
  title: "Atoms/MuteToggle",
  component: MuteToggle,
  tags: ["autodocs"],
  args: { muted: false },
  argTypes: { muted: { control: "boolean" } },
  render: (args) => {
    const [muted, setMuted] = React.useState(args.muted);

    React.useEffect(() => {
      setMuted(args.muted);
    }, [args.muted]);

    return <MuteToggle {...args} muted={muted} onMutedChange={setMuted} />;
  },
};

export default meta;

type Story = StoryObj<typeof MuteToggle>;

export const Default: Story = {
  args: { muted: false },
};

export const Muted: Story = {
  args: { muted: true },
};
