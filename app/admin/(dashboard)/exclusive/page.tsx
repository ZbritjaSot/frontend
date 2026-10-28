import { redirect } from "next/navigation";

export default function AdminExclusivePage() {
  redirect("/admin/home");
}
