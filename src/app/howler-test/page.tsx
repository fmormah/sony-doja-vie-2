"use client";

import {
  HowlerFadeDemo,
  HowlerFilterDemo,
  HowlerPlaylistDemo,
  HowlerRateDemo,
  HowlerSeekDemo,
} from "@/components/molecules/HowlerDemos";

export default function HowlerTestPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 className="headline--h3" style={{ marginBottom: "2rem" }}>
        Howler.js Demo Components
      </h1>

      <div style={{ display: "grid", gap: "3rem" }}>
        <section
          style={{ borderBottom: "1px solid #ddd", paddingBottom: "2rem" }}
        >
          <h2 className="headline--h4" style={{ marginBottom: "1rem" }}>
            1. Fade In / Out
          </h2>
          <HowlerFadeDemo />
        </section>

        <section
          style={{ borderBottom: "1px solid #ddd", paddingBottom: "2rem" }}
        >
          <h2 className="headline--h4" style={{ marginBottom: "1rem" }}>
            2. Low Pass / High Pass Filters
          </h2>
          <HowlerFilterDemo />
        </section>

        <section
          style={{ borderBottom: "1px solid #ddd", paddingBottom: "2rem" }}
        >
          <h2 className="headline--h4" style={{ marginBottom: "1rem" }}>
            3. Playback Speed Manipulation
          </h2>
          <HowlerRateDemo />
        </section>

        <section
          style={{ borderBottom: "1px solid #ddd", paddingBottom: "2rem" }}
        >
          <h2 className="headline--h4" style={{ marginBottom: "1rem" }}>
            4. Seek (Jump Within Track)
          </h2>
          <HowlerSeekDemo />
        </section>

        <section style={{ paddingBottom: "2rem" }}>
          <h2 className="headline--h4" style={{ marginBottom: "1rem" }}>
            5. Playlist (Jump Between Tracks)
          </h2>
          <HowlerPlaylistDemo />
        </section>
      </div>
    </div>
  );
}
