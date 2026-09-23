import type { Metadata } from "next";
import { LegalDocument } from "@/components/chrome/LegalDocument";

export const metadata: Metadata = {
  title: "Politika e privatësisë",
  description: "Si i trajton ZbritjaSot të dhënat e llogarisë dhe ofertat publike.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Politika e privatësisë">
      <p>
        ZbritjaSot tregon oferta publike nga dyqanet në Kosovë. Ky tekst është
        i shkurtër dhe do të zëvendësohet me politikën e plotë.
      </p>
      <section className="grid gap-2">
        <h2>Çfarë mbledhim</h2>
        <p>
          Vizitorët i shohin ofertat pa llogari. Dyqanet dhe administrata hyjnë
          me email dhe fjalëkalim. Ruajmë të dhënat e llogarisë, ofertat dhe
          adresën e dyqanit që shfaqet te oferta.
        </p>
      </section>
      <section className="grid gap-2">
        <h2>Si i përdorim</h2>
        <p>
          I përdorim për të hapur llogarinë, për të shfaqur ofertat dhe për të
          mbajtur panelin. Nuk i shesim të dhënat.
        </p>
      </section>
      <section className="grid gap-2">
        <h2>Sa kohë</h2>
        <p>
          Ofertat publike qëndrojnë derisa të skadojnë ose të hiqen. Llogaritë
          qëndrojnë derisa t’i mbyllë administrata.
        </p>
      </section>
    </LegalDocument>
  );
}
