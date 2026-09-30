import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicPlacement, fetchPublicSections } from "@/features/offers/api";
import { EmptyNote, Frame } from "@/features/public/Frame";
import { ExclusiveStream } from "@/features/public/ExclusiveStream";
import { publicPageMetadata } from "@/lib/metadata";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  let title = EXCLUSIVE_LABEL;
  try {
    const sections = await fetchPublicSections();
    title = sections.find((section) => section.key === "exclusive")?.title || title;
  } catch {
    title = EXCLUSIVE_LABEL;
  }

  return publicPageMetadata({
    title,
    description: `${title} në ${SITE_NAME}.`,
    path: "/ekskluzive",
  });
}

export default async function ExclusivePage() {
  let title = EXCLUSIVE_LABEL;

  try {
    const sections = await fetchPublicSections();
    if (!sections.some((section) => section.key === "exclusive")) {
      notFound();
    }
    title = sections.find((section) => section.key === "exclusive")?.title || title;
  } catch {
    // A failed settings read still shows the page.
  }
  let items: Awaited<ReturnType<typeof fetchPublicPlacement>>["data"] = [];
  let lastPage = 1;
  let failed = false;

  try {
    const page = await fetchPublicPlacement({ page: 1, perPage: 12 });
    items = page.data;
    lastPage = page.meta?.last_page ?? 1;
  } catch {
    failed = true;
  }

  return (
    <div className="exclusive-page relative pb-16 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_8%,rgba(36,53,40,0.07),transparent_42%),radial-gradient(ellipse_at_88%_28%,rgba(168,255,0,0.045),transparent_38%),radial-gradient(ellipse_at_50%_100%,rgba(36,53,40,0.05),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_12%_8%,rgba(36,53,40,0.55),transparent_48%),radial-gradient(ellipse_at_88%_28%,rgba(168,255,0,0.05),transparent_40%),radial-gradient(ellipse_at_50%_100%,rgba(36,53,40,0.35),transparent_50%)]"
      />
      <header className="relative bg-forest text-ivory">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(168,255,0,0.1),transparent_45%)]"
        />
        <Frame className="relative py-12 sm:py-16 lg:py-20">
          <p className="m-0 flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.28em] text-accent uppercase">
            <span className="h-px w-8 bg-accent" aria-hidden />
            {EXCLUSIVE_LABEL}
          </p>
          <h1 className="m-0 mt-4 max-w-4xl text-[clamp(2.6rem,6.5vw,5rem)] leading-[0.9] font-extrabold tracking-[-0.05em] text-ivory">
            {title}
          </h1>
        </Frame>
      </header>
      <Frame className="relative">
        {failed ? (
          <EmptyNote
            title="Diçka shkoi keq"
            body="Nuk mundëm t’i ngarkojmë ofertat. Provo përsëri së shpejti."
          />
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-lg py-20 text-center sm:py-28">
            <h2 className="m-0 text-[clamp(2.4rem,6vw,4rem)] leading-[0.9] font-extrabold tracking-[-0.045em]">
              Momentalisht bosh
            </h2>
            <p className="mx-auto mt-5 mb-0 max-w-sm text-base leading-relaxed text-muted">
              Kthehu më vonë për oferta të reja.
            </p>
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <ExclusiveStream items={items} lastPage={lastPage} />
          </div>
        )}
      </Frame>
    </div>
  );
}
