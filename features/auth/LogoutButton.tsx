"use client";

import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/useAuth";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await logout();
    } finally {
      router.replace("/biz/login");
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="dash__logout"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? "Duke dalë…" : "Dil"}
    </button>
  );
}
