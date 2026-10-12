import { redirect } from "next/navigation";

/** Old path — password lives under Profili. */
export default function AdminPasswordRedirectPage() {
  redirect("/admin/profile/password");
}
