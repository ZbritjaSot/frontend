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
          Paneli i administratorit. Këtu do të menaxhohen bizneset, kategoritë
          dhe aprovimi i ofertave.
        </p>
        <p className="shell-panel__note">
          Hyrja (Sanctum cookie) vjen në B5. Tani është vetëm struktura e faqes —
          pa thirrje API.
        </p>
      </div>
    </>
  );
}
