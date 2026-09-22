import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kategoritë",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return (
    <>
      <h1 className="dash__page-title">Kategoritë</h1>
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Menaxhimi i kategorive të ofertave do të jetë këtu.
        </p>
      </div>
    </>
  );
}
