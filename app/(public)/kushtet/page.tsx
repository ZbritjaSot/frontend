import type { Metadata } from "next";
import { LegalDocument } from "@/components/chrome/LegalDocument";

export const metadata: Metadata = {
  title: "Kushtet e përdorimit",
  description: "Rregullat e shkurtra për përdorimin e ZbritjaSot.",
};

export default function TermsPage() {
  return (
    <LegalDocument title="Kushtet e përdorimit">
      <p>
        ZbritjaSot është faqja e ofertave të ditës nga dyqanet lokale. Ky tekst
        është i shkurtër dhe do të zëvendësohet me kushtet e plota.
      </p>
      <section className="grid gap-2">
        <h2>Ofertat</h2>
        <p>
          Çmimin, zbritjen dhe datat i vendos dyqani. Oferta mund të mbarojë,
          të ndryshojë ose të hiqet. Blerja bëhet te dyqani, jo në këtë faqe.
        </p>
      </section>
      <section className="grid gap-2">
        <h2>Llogaritë</h2>
        <p>
          Dyqani është përgjegjës për ofertat që dërgon. Administrata i aprovon
          ose i refuzon. Fjalëkalimi është personal.
        </p>
      </section>
      <section className="grid gap-2">
        <h2>Përdorimi</h2>
        <p>
          Mos publiko informacion të rremë. Mos e përdor faqen për të dëmtuar
          dyqanet ose vizitorët.
        </p>
      </section>
    </LegalDocument>
  );
}
