import type { Metadata } from "next";
import { ResetFlyerScroll } from "@/components/chrome/ResetFlyerScroll";
import {
  CataloguePage,
  catalogueMetadata,
  type CatalogueSearchParams,
} from "@/features/public/CataloguePage";

type PageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return catalogueMetadata("fletushka", await searchParams);
}

export default function FletushkaPage({ searchParams }: PageProps) {
  return (
    <>
      <ResetFlyerScroll />
      <CataloguePage katalog="fletushka" searchParams={searchParams} />
    </>
  );
}
