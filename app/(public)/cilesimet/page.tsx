import type { Metadata } from "next";
import { SettingsPanel } from "@/features/public/SettingsPanel";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Cilësimet",
  description: "Pamja dhe lidhjet e ZbritjaSot.",
  path: "/cilesimet",
});

export default function SettingsPage() {
  return <SettingsPanel />;
}
