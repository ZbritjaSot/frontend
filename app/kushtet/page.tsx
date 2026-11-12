import type { Metadata } from "next";
import { LegalPage } from "@/features/site/LegalPage";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kushtet",
  description:
    "Kushtet e përdorimit të platformës ZbritjaSot — si listohen ofertat, kush përgjigjet për to dhe si përdoren llogaritë e dyqaneve.",
  alternates: { canonical: "/kushtet" },
};

const sections = [
  {
    title: "Çka liston ZbritjaSot",
    body: `${SITE_NAME} liston zbritjet që i vendosin dyqanet: oferta, fletushka dhe adresat e tyre. Platforma nuk shet produkte, nuk mban stok dhe nuk merr porosi — çdo blerje bëhet drejtpërdrejt te dyqani.`,
  },
  {
    title: "Çmimi dhe disponueshmëria te dyqani",
    body: "Çmimet shfaqen në euro. Çmimi i treguar në platformë mund të ndryshojë te dyqani; çmimi që vlen është ai që jep dyqani në momentin e blerjes.",
  },
  {
    title: "Kush përgjigjet për ofertën",
    body: "Dyqani përgjigjet për saktësinë e ofertës së vet — produktin, çmimin, sasinë dhe afatin. ZbritjaSot shfaq atë që dyqani ka dërguar dhe administratori e ka lënë publike.",
  },
  {
    title: "Skadimi dhe heqja e ofertave",
    body: "Oferta hiqet automatikisht kur skadon afati i saj; administratori mund ta heqë edhe më herët. Ajo që nuk është publike nuk del te vizitorët.",
  },
  {
    title: "Përdorimi pa llogari",
    body: "Vizitorët nuk kanë nevojë për llogari për të parë ofertat, fletushkat ose dyqanet. Buletini është opsional: abonohesh me email dhe mund të çregjistrohesh kur të duash.",
  },
  {
    title: "Llogaritë e dyqaneve dhe panelit",
    body: "Paneli i dyqanit dhe i administratorit nuk hapet me regjistrim të lirë. Llogarinë e jep ZbritjaSot; kush hyn në atë llogari përgjigjet për ofertat dhe të dhënat që vendos nën të.",
  },
  {
    title: "Përdorimi i lejuar",
    body: "Platforma përdoret për të shfaqur zbritje reale. Nuk lejohet publikimi i ofertave të rreme, ngarkimi i materialeve që nuk ju përkasin, ose çdo përpjekje për të dëmtuar funksionimin e platformës.",
  },
  {
    title: "Kufizimi i përgjegjësisë",
    body: "ZbritjaSot shfaq informacionin e dërguar nga dyqanet ashtu siç është, pa garanci se çdo detaj mbetet i saktë në çdo moment. ZbritjaSot nuk përgjigjet për dëme që rrjedhin nga përdorimi i informacionit të një dyqani të tretë.",
  },
  {
    title: "Ligji në fuqi dhe ndryshimet",
    body: `Këto kushte rregullohen nga legjislacioni i Republikës së Kosovës. Nëse kushtet ndryshojnë, versioni i përditësuar publikohet në ${SITE_URL}/kushtet me datën e re.`,
  },
  {
    title: "Kontakt",
    body: `Pyetje për këto kushte: ${SITE_EMAIL}.`,
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Kushtet"
      updated="12 nëntor 2026"
      intro="Këto kushte përcaktojnë si përdoret platforma ZbritjaSot — faqja e internetit, aplikacioni mobil dhe panelet e dyqaneve/administratorit."
      sections={sections}
    />
  );
}
