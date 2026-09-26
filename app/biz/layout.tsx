import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Biz area root — login and dashboard use nested layouts. */
export default function BizRootLayout({ children }: { children: ReactNode }) {
  return children;
}
