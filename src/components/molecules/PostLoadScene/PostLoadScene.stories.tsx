import type { Meta, StoryObj } from "@storybook/nextjs";

import PostLoadScene from "./PostLoadScene";

const meta: Meta<typeof PostLoadScene> = {
  title: "Molecules/PostLoadScene",
  component: PostLoadScene,
  tags: ["autodocs"],
  args: {
    topText: "PULLING UP AT THE CLUB.",
    bottomText: "BUT WILL YOU GET IN?",
    onContinue: () => alert("Continue clicked"),
  },
  argTypes: {
    topText: { control: "text" },
    bottomText: { control: "text" },
    onContinue: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof PostLoadScene>;

export const Default: Story = {
  args: {},
};
