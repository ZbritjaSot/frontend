"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { inputClass } from "@/lib/ui";
import { EXCLUSIVE_HREF } from "@/lib/exclusive";

export function ExclusiveSearch({ initialQ = "" }: { initialQ?: string }) {
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

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl" role="search">
      <label className="grid gap-2">
        <span className="text-[0.7rem] font-bold tracking-[0.18em] text-ivory/55 uppercase">
          Kërko
        </span>
        <input
          className={`${inputClass} border-white/15 bg-white/[0.06] text-ivory placeholder:text-ivory/40`}
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
