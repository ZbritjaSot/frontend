import type { Metadata } from "next";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = publicPageMetadata({
  title: "Kushtet",
  description: "Si përdoret ZbritjaSot kur shikon një ofertë ose publikon një fletushkë.",
  path: "/kushtet",
});

const points = [
  {
    title: "Çfarë liston faqja",
    body: "ZbritjaSot liston zbritjet që i vendosin dyqanet: oferta, fletushka dhe adresat e tyre. Nuk shet produkte, nuk mban stok dhe nuk merr porosi.",
  },
  {
    title: "Çmimi te dyqani",
    body: "Çmimet janë në euro. Çmimi në faqe mund të ndryshojë te dyqani. Çmimi që vlen është ai që e jep dyqani kur blen.",
  },
  {
    title: "Kush përgjigjet për ofertën",
    body: "Dyqani përgjigjet për ofertën e vet: për produktin, çmimin, sasinë dhe afatin. ZbritjaSot e shfaq atë që dyqani e ka dërguar dhe administratori e ka lënë publike.",
  },
  {
    title: "Kur hiqet një ofertë",
    body: "Oferta hiqet vetë kur skadon afati. Administratori mund ta heqë edhe më herët. Ajo që nuk është publike nuk del te vizitorët.",
  },
  {
    title: "Pa llogari për vizitorin",
    body: "Një vizitor nuk ka nevojë për llogari që të shohë ofertat. Buletini është zgjedhje: shkruan email-in vetëm nëse do njoftime, dhe mund të ndalosh kur të duash.",
  },
  {
    title: "Llogaritë e panelit",
    body: "Paneli i dyqanit dhe paneli i administratorit nuk hapen me regjistrim të lirë. Llogarinë e jep ZbritjaSot. Kush hyn aty përgjigjet për ofertat dhe të dhënat që vendos nën atë llogari.",
  },
  {
    title: "Përdorimi i faqes",
    body: "Faqja përdoret për të parë zbritje dhe, për dyqanet, për të dërguar oferta të vërteta. Nuk përdoret për të vendosur oferta të rreme ose për të ngarkuar materiale që nuk të përkasin.",
  },
];

export default function TermsPage() {
  return (
    <Band pad="page">
      <p className={kicker}>ZbritjaSot</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Kushtet</h1>
      <p className="mt-4 mb-0 max-w-xl text-sm leading-relaxed text-muted">
        Pyetje për këto rregulla:{" "}
        <a href={`mailto:${SITE_EMAIL}`} className="font-semibold text-ink underline-offset-4 hover:underline">
          {SITE_EMAIL}
        </a>
      </p>
      <div className="mt-10 max-w-2xl space-y-8">
        {points.map((point) => (
          <section key={point.title}>
            <h2 className="m-0 text-xl font-extrabold tracking-tight">{point.title}</h2>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-muted">{point.body}</p>
          </section>
        ))}
      </div>
    </Band>
  );
}
