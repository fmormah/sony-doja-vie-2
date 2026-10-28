import { Suspense } from "react";

import SceneManager from "@/components/organisms/SceneManager/SceneManager";

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div>.</div>}>
        <SceneManager />
      </Suspense>
    </main>
  );
}
