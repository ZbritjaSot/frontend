"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/useAuth";
import { useState } from "react";

type LogoutButtonProps = {
  redirectTo: string;
};

export function LogoutButton({ redirectTo }: LogoutButtonProps) {
  const router = useRouter();
  const logout = useLogout();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await logout();
    } finally {
      router.replace(redirectTo);
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="inline-flex min-h-10 cursor-pointer appearance-none items-center gap-1.5 border-0 bg-transparent px-0 py-2 text-sm font-semibold text-muted hover:text-accent disabled:cursor-wait disabled:opacity-60"
      onClick={onClick}
      disabled={pending}
    >
      <LogoutIcon fontSize="small" />
      {pending ? "Duke dalë…" : "Dil"}
    </button>
  );
}
