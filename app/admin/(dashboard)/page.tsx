import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return (
    <>
      <h1 className="dash__page-title">Paneli</h1>
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Paneli i administratorit. Aprovo ofertat nga{" "}
          <strong>Ofertat në pritje</strong>.
        </p>
      </div>
    </>
  );
}
