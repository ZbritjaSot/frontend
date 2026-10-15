import type { Metadata } from "next";
import {
  CataloguePage,
  catalogueMetadata,
  type CatalogueSearchParams,
} from "@/features/public/CataloguePage";

type PageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return catalogueMetadata("oferta", await searchParams);
}

export default function OfertaPage({ searchParams }: PageProps) {
  return <CataloguePage katalog="oferta" searchParams={searchParams} />;
}
