import type { Subscription } from "@/types";

function isLatestExpired(sub: Subscription): boolean {
  return (
    sub.is_active &&
    !sub.is_current &&
    new Date(sub.ends_at).getTime() <= Date.now()
  );
}

/** Newest subscription per business, when that one has already ended. */
export function latestExpiredSubscriptions(
  subscriptions: Subscription[],
): Subscription[] {
  const latest = new Map<string, Subscription>();

  for (const sub of subscriptions) {
    const current = latest.get(sub.business_id);
    const subTime = new Date(sub.created_at ?? sub.starts_at).getTime();
    const currentTime = current
      ? new Date(current.created_at ?? current.starts_at).getTime()
      : Number.NEGATIVE_INFINITY;
    if (!current || subTime >= currentTime) {
      latest.set(sub.business_id, sub);
    }
  }

  return [...latest.values()]
    .filter(isLatestExpired)
    .sort(
      (a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime(),
    );
}
