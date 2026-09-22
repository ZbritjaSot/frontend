import type { Metadata } from "next";
import { OfferForm } from "@/features/offers/OfferForm";

export const metadata: Metadata = {
  title: "Ofertë e re",
  robots: { index: false, follow: false },
};

export default function NewBizOfferPage() {
  return (
    <>
      <h1 className="dash__page-title">Ofertë e re</h1>
      <p className="shell-panel__lead" style={{ marginBottom: "1.25rem" }}>
        Ruaje si draft, pastaj dërgoje për aprovim nga lista.
      </p>
      <OfferForm mode="create" />
    </>
  );
}
