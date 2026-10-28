import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import EmailInput from "./EmailInput";

const meta: Meta<typeof EmailInput> = {
  title: "Atoms/EmailInput",
  component: EmailInput,
  tags: ["autodocs"],
  args: {
    placeholder: "email@domain.com",
    disabled: false,
  },
  argTypes: {
    placeholder: { control: "text" },
    value: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "change" },
    onSubmit: { action: "submit" },
  },
};

export default meta;

type Story = StoryObj<typeof EmailInput>;

export const Default: Story = {
  args: {
    placeholder: "email@domain.com",
  },
};

export const WithValue: Story = {
  args: {
    value: "user@example.com",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "disabled@example.com",
  },
};

export const InvalidEmail: Story = {
  args: {
    value: "not-an-email",
  },
};

export const WithOnClick: Story = {
  args: {
    placeholder: "email@domain.com",
    onClick: () => {
      // action logged via Controls
    },
  },
};
