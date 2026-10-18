"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import Link from "next/link";
import { pageTitle, panelLead } from "@/lib/ui";

const options = [
  {
    href: "/admin/create/offers",
    label: "Shto ofertë",
    hint: "Oferta individuale për një dyqan aktiv. Ruhen të aprovuara menjëherë.",
    icon: <LocalOfferOutlinedIcon fontSize="small" />,
  },
  {
    href: "/admin/create/flyers",
    label: "Shto fletushkë",
    hint: "Fletushkë me produkte për një dyqan aktiv. Ruhet e aprovuar menjëherë.",
    icon: <MenuBookOutlinedIcon fontSize="small" />,
  },
] as const;

export function AdminAddContent() {
  return (
    <div>
      <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
        <Link
          href="/admin"
          className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Paneli</span>
        </Link>
        <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>Shto përmbajtje</h1>
      </div>
      <p className={`${panelLead} mb-6 max-w-[36rem]`}>
        Zgjidh çfarë do të shtosh. Pastaj zgjidh dyqanin aktiv dhe plotëso formularin.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="grid gap-3 rounded-2xl border border-line bg-transparent px-5 py-5 text-inherit no-underline transition-colors hover:border-accent/50 hover:bg-sunken"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-sunken text-ink">
              {option.icon}
            </span>
            <span className="text-lg font-bold tracking-[-0.03em]">{option.label}</span>
            <span className="text-sm leading-relaxed text-muted">{option.hint}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
