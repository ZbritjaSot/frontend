import { EXCLUSIVE_LABEL } from "@/lib/exclusive";

export type HomeSection = {
  key: string;
  title: string;
};

/**
 * Fallback when the API has no saved section order. Keep in sync with HomeSections::defaults().
 *
 * NOTE (homepage overlap): `spotlight` ("Zbritje të forta") and `exclusive` both surface
 * highest-discount product deals — Exclusive has its own destination page.
 * Consider dropping or retitling spotlight in the next Exclusive redesign so the home
 * page does not tell the same story twice.
 */
export const defaultHomeSections: HomeSection[] = [
  { key: "spotlight", title: "Zbritje të forta" },
  { key: "flyers", title: "Fletushkat" },
  { key: "inbox", title: "Mos i humb zbritjet më të mira." },
  { key: "exclusive", title: EXCLUSIVE_LABEL },
  { key: "fresh", title: "Sapo u shtuan" },
  { key: "ending", title: "Mbaron së shpejti" },
  { key: "shops", title: "Dyqanet" },
];
