import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bizneset",
  robots: { index: false, follow: false },
};

export default function AdminBusinessesPage() {
  return (
    <>
      <h1 className="dash__page-title">Bizneset</h1>
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Lista e bizneseve dhe krijimi i llogarive do të jetë këtu.
        </p>
      </div>
    </>
  );
}
