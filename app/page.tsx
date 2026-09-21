import Image from "next/image";

export default function Home() {
  return (
    <main className="coming-soon">
      <header className="coming-soon__lockup">
        <Image
          className="coming-soon__mark"
          src="/media/logo-price-tag.png"
          alt=""
          width={1024}
          height={1024}
          priority
        />
        <h1 className="coming-soon__wordmark">
          <span className="coming-soon__wordmark-name">Zbritja</span>
          <span className="coming-soon__wordmark-sot">Sot</span>
        </h1>
      </header>

      <p className="coming-soon__tagline">
        Më shumë zbritje. Më shumë kursim.
      </p>

      <hr className="coming-soon__rule" />

      <p className="coming-soon__status">Së shpejti</p>
      <p className="coming-soon__lead">Platforma e zbritjeve në Kosovë</p>
      <p className="coming-soon__copy">
        Gjej ofertat e ditës nga dyqanet lokale.
      </p>
    </main>
  );
}
