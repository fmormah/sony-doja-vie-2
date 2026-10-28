import type { Meta, StoryObj } from "@storybook/nextjs";

import ContentPopup from "./ContentPopup";

const meta: Meta<typeof ContentPopup> = {
  title: "Molecules/ContentPopup",
  component: ContentPopup,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    contentType: "default",
    hotspotLabel: "Sample Hotspot",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "90vh",
          background: "#000",
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ContentPopup>;

export const Default: Story = {
  args: {
    contentType: "default",
    hotspotLabel: "Generic Hotspot",
  },
};

export const Tour: Story = {
  args: {
    contentType: "tour",
    hotspotLabel: "Tours",
  },
};

export const Hotline: Story = {
  args: {
    contentType: "hotline",
    hotspotLabel: "CallingCard",
  },
};

export const Merch: Story = {
  args: {
    contentType: "merch",
    hotspotLabel: "MerchStore",
  },
};
