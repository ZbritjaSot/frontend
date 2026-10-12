import { categoryIconPaths } from "@/lib/categoryIconPaths";

export const categoryIconIds = [
  "restaurant",
  "local_bar",
  "devices",
  "checkroom",
  "home",
  "sports",
  "spa",
  "menu_book",
  "child_friendly",
  "directions_car",
  "cake",
  "yard",
  "bakery_dining",
  "medical_services",
  "coffee",
  "celebration",
  "self_improvement",
  "grid_view",
  "category",
] as const;

export type CategoryIconId = (typeof categoryIconIds)[number];

type CategoryIconEntry = {
  id: CategoryIconId;
  label: string;
};

export const categoryIcons: readonly CategoryIconEntry[] = [
  { id: "restaurant", label: "Ushqim" },
  { id: "local_bar", label: "Pije" },
  { id: "devices", label: "Elektronikë" },
  { id: "checkroom", label: "Veshje" },
  { id: "home", label: "Shtëpi" },
  { id: "sports", label: "Sport" },
  { id: "spa", label: "Bukuri" },
  { id: "menu_book", label: "Librari" },
  { id: "child_friendly", label: "Fëmijë" },
  { id: "directions_car", label: "Auto" },
  { id: "cake", label: "Ëmbëlsira" },
  { id: "yard", label: "Fruta" },
  { id: "bakery_dining", label: "Bukë" },
  { id: "medical_services", label: "Shëndet" },
  { id: "coffee", label: "Kafene" },
  { id: "celebration", label: "Sezonale" },
  { id: "self_improvement", label: "Lifestyle" },
  { id: "grid_view", label: "Të gjitha" },
  { id: "category", label: "Kategori" },
];

const fallback = categoryIcons[categoryIcons.length - 1];

export function categoryIcon(id: string | null | undefined): CategoryIconEntry {
  return categoryIcons.find((icon) => icon.id === id) ?? fallback;
}

export function isCategoryIconId(value: string | null | undefined): value is CategoryIconId {
  return categoryIcons.some((icon) => icon.id === value);
}

export function CategoryGlyph({
  name,
  active = false,
  size = 28,
}: {
  name?: string | null;
  active?: boolean;
  size?: number;
}) {
  const icon = categoryIcon(name);
  const entry = categoryIconPaths[icon.id] ?? categoryIconPaths.category;
  const paths = entry[active ? "filled" : "outlined"];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", color: "currentColor" }}
    >
      {paths.map((d) => (
        <path key={d} fill="currentColor" d={d} />
      ))}
    </svg>
  );
}
