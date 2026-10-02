import type { Metadata } from "next";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = publicPageMetadata({
  title: "Privatësia",
  description: "Çfarë ruan ZbritjaSot kur shikon një ofertë, abonohesh, ose hyn në panel.",
  path: "/privatesia",
});

const points = [
  {
    title: "Kush e mban faqen",
    body: "ZbritjaSot e mban këtë faqe. Ajo tregon zbritjet e dyqaneve lokale në Kosovë. Nuk shet produkte dhe nuk merr porosi.",
  },
  {
    title: "Pa llogari për vizitorin",
    body: "Një vizitor nuk ka llogari. Nuk kërkohet emër, email ose regjistrim për të parë ofertat, fletushkat ose dyqanet.",
  },
  {
    title: "Hapja e një oferte",
    body: "Kur hap një ofertë, numërohet ajo hapje, për dyqanin dhe për faqen. Nuk ruhet adresa e pajisjes dhe nuk lidhet me një person.",
  },
  {
    title: "Buletini",
    body: "Nëse shkruan email-in te buletini, ruhet vetëm ajo adresë, që të dërgohen njoftime për oferta. Çdo letër ka një lidhje për t’u çregjistruar. Pas çregjistrimit nuk dërgohen letra të reja.",
  },
  {
    title: "Harta",
    body: "Kur hap vendndodhjen e një dyqani, shfletuesi ngarkon hartën nga Esri. Nëse shtyp «Shiko lokacionin», del nga kjo faqe te një aplikacion ose faqe hartash. ZbritjaSot nuk ruan një gjurmë të asaj hapjeje.",
  },
  {
    title: "Cookie e hyrjes",
    body: "Cookie përdoret vetëm kur hyn në panelin e dyqanit ose të administratorit, që të mbahet hyrja. Faqet publike nuk e kërkojnë. Nuk ka cookie reklamash ose analitike.",
  },
  {
    title: "Në shfletues",
    body: "Zgjedhja e temës së çelët ose të errët ruhet në shfletues. Në panelin e dyqanit ruhet edhe dyqani i zgjedhur, që të mos kërkohet përsëri. Këto nuk dërgohen si gjurmim.",
  },
  {
    title: "Llogaritë e dyqanit",
    body: "Llogarinë e dyqanit e hap ZbritjaSot, jo vetë dyqani. Ruhen emri, email-i, fjalëkalimi i fshehur, adresa dhe ofertat që publikon. Abonimi është një periudhë e shënuar nga administratori. Faqja nuk merr pagesë me kartë.",
  },
  {
    title: "Nuk shitet",
    body: "Adresat e buletinit dhe llogaritë e dyqaneve nuk shiten dhe nuk jepen për reklama të palëve të treta.",
  },
];

export default function PrivacyPage() {
  return (
    <Band pad="page">
      <p className={kicker}>ZbritjaSot</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Privatësia</h1>
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
