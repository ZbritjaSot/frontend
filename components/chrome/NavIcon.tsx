import { icons, type IconName } from "@/lib/iconPaths";

export type { IconName };

/** ZbritjaSot line icons. Color comes from CSS `color`; `filled` turns silhouette icons solid. */
export function NavIcon({
  name,
  filled = false,
  size = 20,
  className,
}: {
  name: IconName;
  filled?: boolean;
  size?: number | string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-icon={name}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", flexShrink: 0 }}
    >
      {icons[name].map((p) => (
        <path
          key={p.d}
          d={p.d}
          fill={"detail" in p && p.detail ? "none" : undefined}
          fillRule={"evenodd" in p && p.evenodd ? "evenodd" : undefined}
        />
      ))}
    </svg>
  );
}
