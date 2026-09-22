import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profili",
  robots: { index: false, follow: false },
};

export default function BizProfilePage() {
  return (
    <>
      <h1 className="dash__page-title">Profili</h1>
      <div className="shell-panel">
        <p className="shell-panel__lead">
          Të dhënat e biznesit (emri, statusi) do të shfaqen këtu.
        </p>
        <p className="shell-panel__note">
          Leximi i profilit: <code>GET /api/v1/biz/business</code>.
        </p>
      </div>
    </>
  );
}
