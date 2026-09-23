import type { Metadata } from "next";
import { OfferForm } from "@/features/offers/OfferForm";

export const metadata: Metadata = {
  title: "Dosje e re",
  robots: { index: false, follow: false },
};

export default function NewBizOfferPage() {
  return (
    <>
      <h1 className="dash__page-title">Dosje e re</h1>
      <p className="shell-panel__lead" style={{ marginBottom: "1.25rem" }}>
        Vendos titullin dhe datat një herë, pastaj shto një ose më shumë
        produkte. Ruaje si draft dhe dërgoje për aprovim nga lista.
      </p>
      <OfferForm mode="create" />
    </>
  );
}
