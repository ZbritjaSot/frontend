import { categoryIconPaths } from "@/lib/categoryIconPaths";

export const categoryIconIds = [
  "ushqim",
  "pije",
  "elektronike",
  "mode",
  "shtepi",
  "sport",
  "bukuri",
  "librari",
  "femije",
  "auto",
  "embelsira",
  "fruta",
  "shendet",
  "lifestyle",
  "karburante",
  "category",
] as const;

export type CategoryIconId = (typeof categoryIconIds)[number];

type CategoryIconEntry = {
  id: CategoryIconId;
  label: string;
};

export const categoryIcons: readonly CategoryIconEntry[] = [
  { id: "ushqim", label: "Ushqim" },
  { id: "pije", label: "Pije" },
  { id: "elektronike", label: "Elektronikë" },
  { id: "mode", label: "Modë" },
  { id: "shtepi", label: "Shtëpi" },
  { id: "sport", label: "Sport" },
  { id: "bukuri", label: "Bukuri" },
  { id: "librari", label: "Librari" },
  { id: "femije", label: "Fëmijë" },
  { id: "auto", label: "Auto" },
  { id: "embelsira", label: "Ëmbëlsira" },
  { id: "fruta", label: "Fruta" },
  { id: "shendet", label: "Shëndet" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "karburante", label: "Karburante" },
  { id: "category", label: "Të gjitha" },
];

/** Generic mark: the "all" option and the fallback for unknown ids. */
export const GENERIC_CATEGORY_ICON: CategoryIconId = "category";

const fallback = categoryIcons[categoryIcons.length - 1];

export function categoryIcon(id: string | null | undefined): CategoryIconEntry {
  return categoryIcons.find((icon) => icon.id === id) ?? fallback;
}

export function isCategoryIconId(value: string | null | undefined): value is CategoryIconId {
  return categoryIcons.some((icon) => icon.id === value);
}

export function CategoryGlyph({
  name,
  size = 28,
}: {
  name?: string | null;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", color: "currentColor" }}
    >
      <path fill="currentColor" d={categoryIconPaths[categoryIcon(name).id]} />
    </svg>
  );
}
