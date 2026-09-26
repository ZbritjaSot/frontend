const SHOP_KEY = "zbritjasot-shop";
const SHOP_EVENT = "zbritjasot-shop";

export function readActingShopId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SHOP_KEY);
  return value && value !== "" ? value : null;
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
