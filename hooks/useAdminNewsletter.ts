"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNewsletterSubscriber,
  fetchNewsletterPicks,
  fetchNewsletterSubscribers,
  sendNewsletter,
} from "@/features/admin/newsletterApi";

export const newsletterSubscribersKey = ["admin", "newsletter", "subscribers"] as const;

export function useNewsletterSubscribers(page: number, q = "") {
  return useQuery({
    queryKey: [...newsletterSubscribersKey, page, q],
    queryFn: () => fetchNewsletterSubscribers(page, q),
    placeholderData: (previous) => previous,
  });
}

export function useNewsletterPicks(
  kind: "offer" | "bundle" | "business",
  q: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["admin", "newsletter", "picks", kind, q],
    queryFn: () => fetchNewsletterPicks(kind, q),
    enabled,
  });
}

export function useDeleteNewsletterSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNewsletterSubscriber,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: newsletterSubscribersKey });
    },
  });
}

export function useSendNewsletter() {
  return useMutation({
    mutationFn: sendNewsletter,
  });
}
