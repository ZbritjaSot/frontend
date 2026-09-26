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
  try {
    const sections = await fetchPublicSections();
    if (!sections.some((section) => section.key === "exclusive")) {
      notFound();
    }
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
    <Frame className="py-10 sm:py-14">
      <h1 className="m-0 text-[clamp(2.2rem,5vw,3.4rem)] leading-none font-extrabold tracking-[-0.04em]">
        {EXCLUSIVE_LABEL}
      </h1>
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
