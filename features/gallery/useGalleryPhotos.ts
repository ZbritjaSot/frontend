"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchManagerGallery } from "@/features/biz/managerApi";
import {
  fetchAdminGallery,
  fetchAdminPlatformGallery,
  fetchBizGallery,
  fetchBizPlatformGallery,
} from "@/features/gallery/api";
import type { OfferImage, Paginated } from "@/types";

export const bizGalleryQueryKey = ["biz", "gallery"] as const;

export type GalleryAudience = "biz" | "admin" | "manager";
export type GallerySource = "mine" | "platform";

export const GALLERY_PAGE_SIZE = 24;

export function mineGalleryKey(gallery: GalleryAudience, businessId?: string, q = "") {
  if (gallery === "manager" && businessId) {
    return ["biz", "review", "gallery", businessId, q] as const;
  }
  if (gallery === "admin" && businessId) {
    return ["admin", "gallery", businessId, q] as const;
  }
  return [...bizGalleryQueryKey, q] as const;
}

export function platformGalleryKey(gallery: GalleryAudience, q = "") {
  return gallery === "admin"
    ? (["admin", "platform-gallery", q] as const)
    : (["biz", "platform-gallery", q] as const);
}

function nextPage(last: Paginated<OfferImage>): number | undefined {
  const meta = last.meta;
  if (!meta || meta.current_page >= meta.last_page) {
    return undefined;
  }
  return meta.current_page + 1;
}

/** Paged photos from the shop's own gallery or the shared ZbritjaSot gallery. */
export function useGalleryPhotos({
  source,
  gallery,
  businessId,
  q,
  enabled,
}: {
  source: GallerySource;
  gallery: GalleryAudience;
  businessId?: string;
  q: string;
  enabled: boolean;
}) {
  return useInfiniteQuery({
    queryKey:
      source === "mine" ? mineGalleryKey(gallery, businessId, q) : platformGalleryKey(gallery, q),
    queryFn: ({ pageParam }): Promise<Paginated<OfferImage>> => {
      const params = { q, page: pageParam, per_page: GALLERY_PAGE_SIZE };
      if (source === "platform") {
        return gallery === "admin"
          ? fetchAdminPlatformGallery(params)
          : fetchBizPlatformGallery(params);
      }
      if (gallery === "manager" && businessId) {
        return fetchManagerGallery(businessId, params);
      }
      if (gallery === "admin" && businessId) {
        return fetchAdminGallery(businessId, params);
      }
      return fetchBizGallery(params);
    },
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled,
  });
}
