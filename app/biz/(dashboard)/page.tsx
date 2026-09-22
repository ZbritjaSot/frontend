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
          Mirë se vini. Menaxho ofertat nga menyja <strong>Ofertat e mia</strong>.
        </p>
        <p className="shell-panel__note">
          Krijo draft → dërgo për aprovim → admin aprovon → shfaqet te faqja
          publike.
        </p>
      </div>
    </>
  );
}
