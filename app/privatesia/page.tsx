import type { Metadata } from "next";
import { LegalPage } from "@/features/site/LegalPage";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privatësia",
  description:
    "Si i ruan dhe i përpunon ZbritjaSot të dhënat kur shikon ofertat, abonohesh në buletin, ose hyn në panelin e dyqanit.",
  alternates: { canonical: "/privatesia" },
};

const sections = [
  {
    title: "Kush e administron këtë politikë",
    body: `${SITE_NAME} administron këtë faqe dhe platformën ${SITE_NAME} (ueb, aplikacioni mobil dhe panelet e dyqaneve/administratorit). Për çdo pyetje rreth privatësisë, na shkruani në ${SITE_EMAIL}.`,
  },
  {
    title: "Çka bën ZbritjaSot",
    body: "ZbritjaSot shfaq zbritjet, ofertat dhe fletushkat që dërgojnë dyqanet lokale në Kosovë. Nuk shet produkte, nuk mban stok dhe nuk merr porosi — blerja bëhet te dyqani.",
  },
  {
    title: "Kjo faqe nuk kërkon llogari",
    body: "Për të shikuar ofertat, fletushkat ose dyqanet nuk kërkohet asnjë llogari, emër apo email. Në formën e saj aktuale, kjo faqe nuk mbledh vetë asnjë të dhënë personale — i vetmi kontakt është lidhja e email-it më poshtë, që hap aplikacionin tuaj të email-it; ne nuk marrim asgjë derisa të na shkruani vetë.",
  },
  {
    title: "Hapja e një oferte",
    body: "Kur hapet një ofertë në platformën ZbritjaSot, numërohet ajo hapje për dyqanin dhe për platformën, në formë të përmbledhur. Nuk lidhet me një llogari apo person dhe nuk ruhet identifikues personal i pajisjes për këtë qëllim.",
  },
  {
    title: "Buletini",
    body: "Nëse shkruani email-in te buletini, ruhet vetëm ajo adresë, që të dërgohen njoftime për oferta. Çdo letër ka një lidhje për t'u çregjistruar; pas çregjistrimit nuk dërgohen letra të reja dhe adresa fshihet me kërkesë.",
  },
  {
    title: "Harta e dyqaneve",
    body: "Kur shikohet vendndodhja e një dyqani brenda platformës, shfletuesi ngarkon pllakëza harte nga një furnizues i jashtëm (Esri). Nëse hapet lokacioni në një aplikacion të jashtëm harte (p.sh. Apple Maps/Google Maps), ZbritjaSot nuk ruan një gjurmë të asaj hapjeje.",
  },
  {
    title: "Cookie-t dhe ruajtja lokale",
    body: "Cookie përdoret vetëm kur hyhet në panelin e dyqanit ose të administratorit, që të mbahet hyrja — jo në faqet publike. Nuk ka cookie reklamash ose analitike. Në shfletues/aplikacion ruhen lokalisht tema (e çelët/e errët) dhe të preferuarat; këto nuk dërgohen te serveri si gjurmim dhe nuk sinkronizohen mes pajisjeve.",
  },
  {
    title: "Llogaritë e dyqaneve dhe panelit",
    body: "Llogarinë e dyqanit ose menaxherit e hap ZbritjaSot, jo vetë dyqani me regjistrim të lirë. Te serveri ruhen emri, email-i, fjalëkalimi i fshehur, adresa dhe ofertat që publikohen. Platforma nuk merr pagesë me kartë.",
  },
  {
    title: "Ku dhe sa kohë ruhen të dhënat",
    body: "Infrastruktura e platformës (serveri dhe baza e të dhënave) ndodhet në Bashkimin Evropian; skedarët (p.sh. fotot e ofertave) ruhen te një furnizues cloud i jashtëm. Të dhënat ruhen për sa kohë është e nevojshme për qëllimin për të cilin janë mbledhur — p.sh. numrat e hapjeve të ofertave fshihen periodikisht nga një proces automatik mirëmbajtjeje, ndërsa llogaritë e dyqaneve ruhen për sa kohë vazhdon marrëdhënia me platformën.",
  },
  {
    title: "Nuk shiten të dhënat tuaja",
    body: "Adresat e buletinit dhe llogaritë e dyqaneve nuk shiten dhe nuk jepen për reklama të palëve të treta.",
  },
  {
    title: "Të drejtat tuaja",
    body: "Keni të drejtë të kërkoni qasje, korrigjim, fshirje ose kufizim të të dhënave tuaja personale, si dhe të kundërshtoni përpunimin e tyre — na shkruani në email-in më poshtë. ZbritjaSot synon t'i respektojë kërkesat e Ligjit Nr. 06/L-082 për Mbrojtjen e të Dhënave Personale të Republikës së Kosovës; nëse na kontaktoni nga Bashkimi Evropian, kërkesa trajtohet sipas legjislacionit përkatës atje.",
  },
  {
    title: "Kontakti dhe ndryshimet e politikës",
    body: `Pyetje për këtë politikë: ${SITE_EMAIL}. Nëse politika ndryshon, versioni i përditësuar publikohet në ${SITE_URL}/privatesia me datën e re të përditësimit.`,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privatësia"
      updated="12 nëntor 2026"
      intro="Kjo faqe shpjegon çka ruan dhe si e përdor ZbritjaSot çdo të dhënë, në faqen e internetit, aplikacionin mobil dhe panelet e dyqaneve/administratorit."
      sections={sections}
    />
  );
}
