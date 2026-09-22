import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biznes",
  robots: { index: false, follow: false },
};

export default function BizHomePage() {
  return (
    <>
      <h1 className="dash__page-title">Paneli</h1>
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Mirë se vini. Këtu do të krijohen dhe dërgohen ofertat për aprovim.
        </p>
        <p className="shell-panel__note">
          Hapi tjetër (B4): krijo dhe dërgo oferta te{" "}
          <code>/api/v1/biz/offers</code>.
        </p>
      </div>
    </>
  );
}
