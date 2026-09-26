import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicPlacement, fetchPublicSections } from "@/features/offers/api";
import { EmptyNote, Frame } from "@/features/public/Frame";
import { ExclusiveStream } from "@/features/public/ExclusiveStream";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: EXCLUSIVE_LABEL,
  description: `${EXCLUSIVE_LABEL} — ${SITE_NAME}`,
};

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
    const page = await fetchPublicPlacement({ page: 1, perPage: 8 });
    items = page.data;
    lastPage = page.meta?.last_page ?? 1;
  } catch {
    failed = true;
  }

  return (
    <Frame className="py-8 sm:py-12">
      <header className="overflow-hidden rounded-[1.75rem] bg-forest px-5 py-7 text-ivory sm:px-8 sm:py-9 dark:bg-[#121816] dark:text-ink">
        <p className="m-0 text-[0.68rem] font-bold tracking-[0.2em] text-accent uppercase">
          {EXCLUSIVE_LABEL}
        </p>
        <h1 className="m-0 mt-2 max-w-3xl text-[clamp(2.6rem,7vw,4.6rem)] leading-[0.9] font-extrabold tracking-[-0.045em] text-ivory dark:text-ink">
          {title}
        </h1>
      </header>
      {failed ? (
        <div className="mt-10">
          <EmptyNote
            title="Diçka shkoi keq"
            body="Nuk mundëm t’i ngarkojmë ofertat. Provo përsëri së shpejti."
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10">
          <EmptyNote
            title="Momentalisht bosh"
            body="Kthehu më vonë për oferta të reja."
          />
        </div>
      ) : (
        <ExclusiveStream items={items} lastPage={lastPage} />
      )}
    </Frame>
  );
}
