import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";

export default function OfferNotFound() {
  return (
    <section className="border-t border-line py-14">
      <h1 className="m-0 text-lg font-semibold">Oferta nuk u gjet</h1>
      <p className="mt-3 max-w-lg leading-relaxed text-muted">
        Kjo ofertë nuk është aktive ose nuk ekziston më.
      </p>
      <p className="mt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
        >
          <ArrowBackIcon fontSize="small" />
          Kthehu te ofertat
        </Link>
      </p>
    </section>
  );
}
