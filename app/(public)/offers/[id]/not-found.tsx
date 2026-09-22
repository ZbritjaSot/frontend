import Link from "next/link";

export default function OfferNotFound() {
  return (
    <section className="public-state">
      <h1 className="public-state__title">Oferta nuk u gjet</h1>
      <p className="public-state__copy">
        Kjo ofertë nuk është aktive ose nuk ekziston më.
      </p>
      <p className="public-state__action">
        <Link href="/">← Kthehu te ofertat</Link>
      </p>
    </section>
  );
}
