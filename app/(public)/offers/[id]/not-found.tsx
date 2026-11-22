import { BackLink, EmptyNote, Frame } from "@/features/public/Frame";
import { NotFoundRecovery } from "@/features/public/NotFoundRecovery";

export default function OfferNotFound() {
  return (
    <Frame className="py-16">
      <EmptyNote
        title="Oferta nuk u gjet"
        body="Kjo ofertë nuk është aktive ose nuk ekziston më."
      />
      <NotFoundRecovery />
      <p className="mt-6">
        <BackLink href="/">Kthehu te ofertat</BackLink>
      </p>
    </Frame>
  );
}
