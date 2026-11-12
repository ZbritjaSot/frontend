import Link from "next/link";
import { SiteFooter } from "@/features/site/SiteFooter";

type Section = {
  title: string;
  body: string;
};

type LegalPageProps = {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
};

export function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <main className="legal-page">
      <div className="legal-page__shell">
        <Link href="/" className="legal-page__back">
          ← ZbritjaSot
        </Link>
        <p className="legal-page__kicker">ZbritjaSot</p>
        <h1 className="legal-page__title">{title}</h1>
        <p className="legal-page__updated">Përditësuar më {updated}</p>
        <p className="legal-page__intro">{intro}</p>
        <div className="legal-page__sections">
          {sections.map((section) => (
            <section key={section.title} className="legal-page__section">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
