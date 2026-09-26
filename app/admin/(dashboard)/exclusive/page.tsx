import type { Metadata } from "next";
import { AdminExclusive } from "@/features/admin/AdminExclusive";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";

export const metadata: Metadata = {
  title: EXCLUSIVE_LABEL,
  robots: { index: false, follow: false },
};

export default function AdminExclusivePage() {
  return <AdminExclusive />;
}
