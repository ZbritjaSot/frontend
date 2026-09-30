import type { Metadata } from "next";
import { fetchPublicPlacement, fetchPublicSections } from "@/features/offers/api";
import { EmptyNote, Frame } from "@/features/public/Frame";
import { ExclusiveSearch } from "@/features/public/ExclusiveSearch";
import { ExclusiveStream } from "@/features/public/ExclusiveStream";
import { EXCLUSIVE_PAGE_SIZE } from "@/features/public/ExclusiveStage";
import { publicPageMetadata } from "@/lib/metadata";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { SITE_NAME } from "@/lib/site";

type ExclusivePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ExclusivePageProps): Promise<Metadata> {
  let title = EXCLUSIVE_LABEL;
  const { q } = await searchParams;
  try {
    const sections = await fetchPublicSections();
    title = sections.find((section) => section.key === "exclusive")?.title || title;
  } catch {
    title = EXCLUSIVE_LABEL;
  }

  const query = q?.trim();
  return publicPageMetadata({
    title: query ? `${title} · «${query}»` : title,
    description: `${title} në ${SITE_NAME}.`,
    path: "/ekskluzive",
  });
}

export default async function ExclusivePage({ searchParams }: ExclusivePageProps) {
  let title = EXCLUSIVE_LABEL;
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";

  try {
    const sections = await fetchPublicSections();
    title = sections.find((section) => section.key === "exclusive")?.title || title;
  } catch {
    // A failed settings read still shows the page.
  }

  let items: Awaited<ReturnType<typeof fetchPublicPlacement>>["data"] = [];
  let lastPage = 1;
  let failed = false;

  try {
    const page = await fetchPublicPlacement({
      page: 1,
      perPage: EXCLUSIVE_PAGE_SIZE,
      q: q || undefined,
    });
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
          <p className="mt-4 mb-0 max-w-xl text-sm leading-relaxed text-ivory/70">
            Zbritjet më të forta nga të gjitha dyqanet, të renditura sipas përqindjes.
          </p>
          <ExclusiveSearch key={q || "all"} initialQ={q} />
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
              {q ? "Asnjë rezultat" : "Momentalisht bosh"}
            </h2>
            <p className="mx-auto mt-5 mb-0 max-w-sm text-base leading-relaxed text-muted">
              {q
                ? `Nuk u gjet asgjë për «${q}». Provo një fjalë tjetër.`
                : "Kthehu më vonë për oferta të reja."}
            </p>
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <ExclusiveStream key={q || "all"} items={items} lastPage={lastPage} q={q} />
          </div>
        )}
      </Frame>
    </div>
  );
}
