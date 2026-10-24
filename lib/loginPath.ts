export const LOGIN_PATH = "/login";

export function loginHref(next?: string | null): string {
  if (!next) {
    return LOGIN_PATH;
  }

  return `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
}
