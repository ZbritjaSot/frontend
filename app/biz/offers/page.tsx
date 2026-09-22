import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ofertat e mia",
  robots: { index: false, follow: false },
};

export default function BizOffersPage() {
  return (
    <>
      <h1 className="dash__page-title">Ofertat e mia</h1>
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Ofertat e dyqanit — draft, në pritje dhe të aprovuara — do të listohen
          këtu.
        </p>
        <p className="shell-panel__note">
          Krijimi dhe dërgimi për aprovim lidhet në B4 me{" "}
          <code>/api/v1/biz/offers</code>.
        </p>
      </div>
    </>
  );
}
