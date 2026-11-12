import Image from "next/image";
import { SiteFooter } from "@/features/site/SiteFooter";
import { SITE_EMAIL, SITE_TAGLINE } from "@/lib/site";

export default function Home() {
  return (
    <main className="coming-soon">
      <div className="coming-soon__bg" aria-hidden="true">
        <div className="coming-soon__glow coming-soon__glow--a" />
        <div className="coming-soon__glow coming-soon__glow--b" />
        <div className="coming-soon__grid" />
        <div className="coming-soon__grain" />
      </div>

      <div className="coming-soon__shell">
        <header className="coming-soon__top">
          <Image
            className="coming-soon__mark"
            src="/media/logo-price-tag.png"
            alt="ZbritjaSot"
            width={1024}
            height={1024}
            priority
          />
          <h1 className="coming-soon__title">
            <span className="coming-soon__zbritja">Zbritja</span>
            <span className="coming-soon__sot">Sot</span>
          </h1>
        </header>

        <section className="coming-soon__bottom">
          <p className="coming-soon__status">Së shpejti</p>
          <p className="coming-soon__lead">
            Platforma e zbritjeve në Kosovë
          </p>
          <p className="coming-soon__copy">
            Zbritjet nga dyqanet lokale në një vend.
          </p>
          <a className="coming-soon__mail" href={`mailto:${SITE_EMAIL}`}>
            {SITE_EMAIL}
          </a>
          <p className="coming-soon__tagline">{SITE_TAGLINE}</p>
        </section>
      </div>

      <section className="coming-soon__about" aria-labelledby="about-heading">
        <h2 id="about-heading" className="coming-soon__about-title">
          Çka është ZbritjaSot
        </h2>
        <p className="coming-soon__about-copy">
          ZbritjaSot është platforma që mbledh zbritjet, ofertat dhe
          fletushkat e dyqaneve lokale në Kosovë në një vend të vetëm — që
          çdo klient t&rsquo;i gjejë më shpejt, pa i kërkuar nëpër dhjetëra
          faqe e rrjete sociale.
        </p>
        <p className="coming-soon__about-copy">
          Shikimi i ofertave është pa pagesë dhe nuk kërkon llogari. Ofertat
          përditësohen nga vetë dyqanet dhe publikohen vetëm pasi
          miratohen — ZbritjaSot nuk shet produkte dhe nuk merr porosi.
        </p>
        <p className="coming-soon__about-copy">
          ZbritjaSot zhvillohet dhe operohet nga një ekip i vogël, i
          dedikuar për tregun e Kosovës.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
