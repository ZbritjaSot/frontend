import { getApiUrl } from "@/lib/site";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = RequestInit & {
  /** When true, send cookies and CSRF (Sanctum SPA). */
  auth?: boolean;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(name.length + 1));
}

/** Hit Laravel Sanctum CSRF endpoint so XSRF-TOKEN is set for this origin. */
export async function ensureCsrfCookie(): Promise<void> {
  const response = await fetch(`${getApiUrl()}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(`CSRF ${response.status}`, response.status);
  }
}

/**
 * Thin fetch wrapper for the Laravel `/api/v1` API.
 * Public/SSR: omit `auth`. Admin/biz: `auth: true` (cookies + X-XSRF-TOKEN).
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = false, ...init } = options;
  const method = (init.method ?? "GET").toUpperCase();
  const url = `${getApiUrl()}/api/v1${path.startsWith("/") ? path : `/${path}`}`;

  if (auth && method !== "GET" && method !== "HEAD") {
    await ensureCsrfCookie();
  }

  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const xsrf = readCookie("XSRF-TOKEN");
    if (xsrf) {
      headers.set("X-XSRF-TOKEN", xsrf);
    }
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: auth ? "include" : (init.credentials ?? "omit"),
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    throw new ApiError(`API ${response.status}`, response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function validationMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError) || !error.body || typeof error.body !== "object") {
    return fallback;
  }

  const body = error.body as { message?: string; errors?: Record<string, string[]> };
  const first = body.errors ? Object.values(body.errors).flat()[0] : undefined;
  return first ?? body.message ?? fallback;
}
