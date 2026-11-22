const SHOP_KEY = "zbritjasot-shop";
const SHOP_EVENT = "zbritjasot-shop";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readActingShopId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SHOP_KEY);
  // Untrusted storage: only a UUID may ever become the X-Shop-Id header value.
  return value && UUID.test(value) ? value : null;
}

export function writeActingShopId(id: string): void {
  window.localStorage.setItem(SHOP_KEY, id);
  window.dispatchEvent(new Event(SHOP_EVENT));
}

export function clearActingShopId(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SHOP_KEY);
  window.dispatchEvent(new Event(SHOP_EVENT));
}

export function subscribeActingShop(onChange: () => void): () => void {
  window.addEventListener(SHOP_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SHOP_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
