import type { Business } from "@/types";

export function ManagerNote({ business }: { business: Business }) {
  if (business.manager === undefined) {
    return null;
  }

  if (business.manager === null) {
    return (
      <p className="m-0 mt-1 text-sm text-muted">
        Pa menaxher. Fletushkat në pritje shkojnë te administrata.
      </p>
    );
  }

  return (
    <p className="m-0 mt-1 text-sm text-muted">
      Menaxheri:{" "}
      <span className="font-semibold text-ink">
        {business.manager.name || "Pa emër"}
      </span>
      {" · "}
      {business.manager.email}
    </p>
  );
}
