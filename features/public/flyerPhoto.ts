type FlyerLike = {
  title: string;
  image?: { thumb_url: string; detail_url: string } | null;
  cover?: { name?: string; thumb_url?: string; detail_url?: string } | null;
};

/** Dedicated flyer image when one was uploaded, otherwise the product cover. */
export function flyerPhoto(folder: FlyerLike): {
  thumbUrl?: string;
  detailUrl?: string;
  name: string;
} {
  if (folder.image?.thumb_url) {
    return {
      thumbUrl: folder.image.thumb_url,
      detailUrl: folder.image.detail_url,
      name: folder.title,
    };
  }

  return {
    thumbUrl: folder.cover?.thumb_url,
    detailUrl: folder.cover?.detail_url,
    name: folder.cover?.name ?? folder.title,
  };
}
