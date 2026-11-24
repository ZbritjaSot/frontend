"use client";

import { useEffect, useState } from "react";
import { NavIcon } from "@/components/chrome/NavIcon";

/** Floating "back to top" button, shown once the page is scrolled past ~one screen. */
export function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShown(window.scrollY > 640);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!shown) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Kthehu në krye"
      className="fixed right-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-30 inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-accent text-charcoal shadow-[0_8px_24px_rgba(0,0,0,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      <NavIcon name="arrow-up" className="size-4" />
    </button>
  );
}
