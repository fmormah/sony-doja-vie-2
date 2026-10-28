import { RefObject, useEffect } from "react";

export default function useDragScroll(
  ref: RefObject<HTMLElement | null>,
  breakpoint = Infinity, // Allow drag scroll at all screen sizes by default
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    // Don't allow drag on interactive elements
    const disallowDragTargets = ["button", "a", ".Hotspot"];

    const onPointerDown = (e: PointerEvent) => {
      if (window.innerWidth > breakpoint) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey) return;

      // Check if clicking on an interactive element
      const target = e.target as HTMLElement;
      if (target.closest(disallowDragTargets.join(","))) return;

      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = el.scrollLeft;
      scrollTop = el.scrollTop;

      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      e.preventDefault();

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      el.scrollLeft = scrollLeft - dx;
      el.scrollTop = scrollTop - dy;

      // Manually trigger a scroll event for any listeners
      el.dispatchEvent(new Event("scroll"));
    };

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "";
      el.style.userSelect = "";
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    window.addEventListener("blur", endDrag);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("blur", endDrag);
    };
  }, [ref, breakpoint]);
}
