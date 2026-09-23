import type { Metadata } from "next";
import { pageTitle, panelLead, panelNote } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Biznes",
  robots: { index: false, follow: false },
};

export default function BizHomePage() {
  return (
    <>
      <h1 className={pageTitle}>Paneli</h1>
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          Mirë se vini. Menaxho ofertat nga menyja <strong>Ofertat e mia</strong>.
        </p>
        <p className={panelNote}>
          Krijo draft → dërgo për aprovim → admin aprovon → shfaqet te faqja
          publike.
        </p>
      </div>
    </>
  );
}
