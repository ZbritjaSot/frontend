"use client";

import { useEffect, useState } from "react";

const WIDE_QUERY = "(min-width: 800px)";

/** True on desktop-width screens. Starts false so phones never mount the map. */
export function useWideScreen(): boolean {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(WIDE_QUERY);
    const apply = () => setWide(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return wide;
}
