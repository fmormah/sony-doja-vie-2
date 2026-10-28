import type { Meta, StoryObj } from "@storybook/nextjs";

import HowlerFadeDemo from "./HowlerFadeDemo";
import HowlerFilterDemo from "./HowlerFilterDemo";
import HowlerPlaylistDemo from "./HowlerPlaylistDemo";
import HowlerRateDemo from "./HowlerRateDemo";
import HowlerSeekDemo from "./HowlerSeekDemo";

const meta: Meta = {
  title: "Audio/Howler Demos",
};

export default meta;

export const FadeInOut: StoryObj = {
  name: "Fade In / Out",
  render: () => <HowlerFadeDemo />,
};

export const Filters: StoryObj = {
  name: "Low / High Pass Filters",
  render: () => <HowlerFilterDemo />,
};

export const PlaybackRate: StoryObj = {
  name: "Playback Rate",
  render: () => <HowlerRateDemo />,
};

export const SeekWithinTrack: StoryObj = {
  name: "Seek Within Track",
  render: () => <HowlerSeekDemo />,
};

export const Playlist: StoryObj = {
  name: "Playlist Switcher",
  render: () => <HowlerPlaylistDemo />,
};
