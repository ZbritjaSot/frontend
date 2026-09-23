import type { Metadata } from "next";
import { OfferForm } from "@/features/offers/OfferForm";
import { pageTitle, panelLead } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Dosje e re",
  robots: { index: false, follow: false },
};

export default function NewBizOfferPage() {
  return (
    <>
      <h1 className={pageTitle}>Dosje e re</h1>
      <p className={`${panelLead} mb-5`}>
        Vendos titullin dhe datat një herë, pastaj shto një ose më shumë
        produkte. Ruaje si draft dhe dërgoje për aprovim nga lista.
      </p>
      <OfferForm mode="create" />
    </>
  );
}
