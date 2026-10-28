import { EXCLUSIVE_LABEL } from "@/lib/exclusive";

export type HomeSection = {
  key: string;
  title: string;
};

/**
 * Fallback when the API has no saved section order. Keep in sync with HomeSections::defaults().
 *
 * NOTE: `spotlight` ("Zbritje të forta") is filled from admin-selected categories.
 * `exclusive` is filled automatically by discount.
 */
export const defaultHomeSections: HomeSection[] = [
  { key: "spotlight", title: "Zbritje të forta" },
  { key: "flyers", title: "Fletushkat" },
  { key: "inbox", title: "Mos i humb zbritjet më të mira." },
  { key: "exclusive", title: EXCLUSIVE_LABEL },
  { key: "fresh", title: "Sapo u shtuan" },
  { key: "ending", title: "Mbaron së shpejti" },
  { key: "shops", title: "Partnerët" },
];
