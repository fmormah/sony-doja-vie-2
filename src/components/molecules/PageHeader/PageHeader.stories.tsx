import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import PageHeader, { type PageHeaderProps } from "./PageHeader";

const meta: Meta<typeof PageHeader> = {
  title: "Molecules/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    src: "/assets/images/crab.png",
    alt: "Dojacat",
  },
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    src: "/assets/images/dc-logo.svg",
    alt: "Dojacat" satisfies PageHeaderProps["alt"],
  },
};
