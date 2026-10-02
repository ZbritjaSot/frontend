"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { EXCLUSIVE_HREF } from "@/lib/exclusive";

export function ExclusiveSearch({
  initialQ = "",
  tone = "forest",
}: {
  initialQ?: string;
  /** forest = on olive intro; canvas = on page body. */
  tone?: "forest" | "canvas";
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQ);

  function go(next: string) {
    const q = next.trim();
    router.push(q === "" ? EXCLUSIVE_HREF : `${EXCLUSIVE_HREF}?q=${encodeURIComponent(q)}`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    go(value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      go(value);
    }
  }

  const field =
    tone === "forest"
      ? "h-12 w-full rounded-full border border-ivory/20 bg-ivory/[0.08] px-5 text-base font-medium text-ivory outline-none placeholder:text-ivory/45 focus:border-accent/55 focus:ring-2 focus:ring-accent/25"
      : "h-12 w-full rounded-full border border-line bg-elevated px-5 text-base font-medium text-ink outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-white/10";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md sm:min-w-[18rem] lg:min-w-[20rem]" role="search">
      <label className="grid gap-2">
        <span className="sr-only">Kërko</span>
        <input
          className={field}
          value={value}
          placeholder="Produkt, dyqan ose qytet"
          aria-label="Kërko te Ekskluzive"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </label>
    </form>
  );
}
