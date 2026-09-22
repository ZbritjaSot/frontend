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
          Paneli i biznesit. Këtu do të krijohen dhe dërgohen ofertat për
          aprovim.
        </p>
        <p className="shell-panel__note">
          Hyrja (Sanctum cookie) vjen në B3. Tani është vetëm struktura e faqes —
          pa thirrje API.
        </p>
      </div>
    </>
  );
}
