import { offerStatusClass } from "@/lib/ui";
import type { Subscription } from "@/types";

export const SUBSCRIPTION_ENDING_SOON_DAYS = 7;
export const ENDING_SOON_LABEL = "Skadon së shpejti";

export function isTrialSubscription(sub: Pick<Subscription, "price">): boolean {
  return sub.price === 0;
}

export function isLiveTrial(sub: Subscription): boolean {
  return (
    isTrialSubscription(sub) &&
    sub.is_active &&
    new Date(sub.ends_at).getTime() > Date.now()
  );
}

function hasEnded(sub: Pick<Subscription, "ends_at">): boolean {
  return new Date(sub.ends_at).getTime() <= Date.now();
}

export function isEndingSoon(sub: Subscription): boolean {
  if (!sub.is_active || hasEnded(sub)) {
    return false;
  }
  const ends = new Date(sub.ends_at).getTime();
  const limit =
    Date.now() + SUBSCRIPTION_ENDING_SOON_DAYS * 24 * 60 * 60 * 1000;
  return ends <= limit;
}

export function endingSoonClass(): string {
  return offerStatusClass("expired");
}

export function subscriptionStatusLabel(sub: Subscription): string {
  if (!sub.is_active) {
    return "Çaktivizuar";
  }
  if (isTrialSubscription(sub)) {
    return hasEnded(sub) ? "Skaduar" : "Provë falas";
  }
  if (sub.is_current) {
    return "Aktive";
  }
  if (hasEnded(sub)) {
    return "Skaduar";
  }
  return "Në pritje";
}

export function subscriptionStatusClass(sub: Subscription): string {
  if (!sub.is_active) {
    return offerStatusClass("rejected");
  }
  if (isTrialSubscription(sub) && !hasEnded(sub)) {
    return offerStatusClass("pending");
  }
  if (sub.is_current) {
    return offerStatusClass("approved");
  }
  if (hasEnded(sub)) {
    return offerStatusClass("expired");
  }
  return offerStatusClass("pending");
}

export function subscriptionStatusNote(sub: Subscription): string {
  if (!sub.is_active) {
    return "Abonimi është çaktivizuar. Ofertat nuk shfaqen publike.";
  }
  if (isTrialSubscription(sub)) {
    if (hasEnded(sub)) {
      return "Prova falas ka mbaruar. Regjistro një pagesë te Abonimet për ta rinovuar.";
    }
    if (isEndingSoon(sub)) {
      return "Prova falas mbaron së shpejti. Zgjati datat këtu, ose regjistro pagesën te Abonimet.";
    }
    if (sub.is_current) {
      return "Dyqani është në provë falas. Ofertat e aprovuara mund të shfaqen publike. Kur dyqani paguan, regjistro pagesën te Abonimet — prova ndalon.";
    }
    return "Prova falas ende nuk ka filluar.";
  }
  if (hasEnded(sub)) {
    return "Ofertat nuk shfaqen publike derisa të rinovohet. Mund t’i zgjatësh datat këtu, ose të regjistrosh një pagesë te Abonimet.";
  }
  if (isEndingSoon(sub)) {
    return "Abonimi mbaron së shpejti. Mund t’i zgjatësh datat këtu, si më parë, ose të regjistrosh një pagesë te Abonimet.";
  }
  if (sub.is_current) {
    return "Ofertat e aprovuara mund të shfaqen publike. Mund t’i zgjatësh datat këtu, si më parë — kjo nuk regjistron pagesë të re.";
  }
  return "Abonimi ende nuk ka filluar.";
}

export function pickSubscription(list: Subscription[]): Subscription | null {
  const currentPaid = list.find((item) => item.is_current && item.price > 0);
  if (currentPaid) {
    return currentPaid;
  }
  const current = list.find((item) => item.is_current);
  if (current) {
    return current;
  }
  return (
    [...list].sort(
      (a, b) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime(),
    )[0] ?? null
  );
}

export function sortSubscriptionsForGroup(
  list: Subscription[],
): Subscription[] {
  return [...list].sort((a, b) => {
    const aPaidCurrent = a.is_current && a.price > 0;
    const bPaidCurrent = b.is_current && b.price > 0;
    if (aPaidCurrent !== bPaidCurrent) {
      return aPaidCurrent ? -1 : 1;
    }
    if (a.is_current !== b.is_current) {
      return a.is_current ? -1 : 1;
    }
    return new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime();
  });
}
