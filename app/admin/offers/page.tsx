import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ofertat në pritje",
  robots: { index: false, follow: false },
};

export default function AdminOffersPage() {
  return (
    <>
      <h1 className="dash__page-title">Ofertat në pritje</h1>
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Radha e ofertave në pritje të aprovimit do të shfaqet këtu.
        </p>
        <p className="shell-panel__note">
          Aprovo / refuzo lidhet në B6 me{" "}
          <code>/api/v1/admin/offers/pending</code>.
        </p>
      </div>
    </>
  );
}
