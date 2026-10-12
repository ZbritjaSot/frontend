import Image from "next/image";
import { SITE_TAGLINE } from "@/lib/site";

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
          <a className="coming-soon__mail" href="mailto:info@zbritjasot.com">
            info@zbritjasot.com
          </a>
          <p className="coming-soon__tagline">{SITE_TAGLINE}</p>
        </section>
      </div>
    </main>
  );
}
