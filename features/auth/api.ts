import { apiFetch, ensureCsrfCookie } from "@/lib/api";
import type { LoginInput } from "@/schemas/login";
import type { User } from "@/types";

type AuthPayload = {
  user: User;
};

export async function loginWithCookies(input: LoginInput): Promise<User> {
  await ensureCsrfCookie();

  // No device_name → Sanctum session cookie (web), not Bearer token.
  const payload = await apiFetch<AuthPayload>("/auth/login", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });

  return payload.user;
}

export async function fetchMe(): Promise<User> {
  const payload = await apiFetch<AuthPayload>("/auth/me", {
    method: "GET",
    auth: true,
  });

  return payload.user;
}

export async function changePassword(input: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<User> {
  await ensureCsrfCookie();
  const payload = await apiFetch<AuthPayload>("/auth/password", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
  return payload.user;
}

export async function logout(): Promise<void> {
  await ensureCsrfCookie();
  await apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
    auth: true,
  });
}

export function hasRole(user: User, role: string): boolean {
  return (user.roles ?? []).includes(role);
}
