import type { Metadata } from "next";
import { pageTitle, panelLead } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return (
    <>
      <h1 className={pageTitle}>Paneli</h1>
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          Paneli i administratorit. Aprovo ofertat nga{" "}
          <strong>Në pritje</strong>.
        </p>
      </div>
    </>
  );
}
