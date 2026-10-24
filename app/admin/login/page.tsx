import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginHref } from "@/lib/loginPath";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(loginHref(next));
}
