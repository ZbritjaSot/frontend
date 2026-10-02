import type { Metadata } from "next";
import { ContactForm } from "@/features/public/ContactForm";
import { InquiryPage } from "@/features/public/inquiry/InquiryPage";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Na Kontakto",
  description: "Kontakto ekipin e ZbritjaSot.",
  path: "/cilesimet/kontakt",
});

export default function ContactPage() {
  return (
    <InquiryPage
      title="Na Kontakto"
      lead={
        <p>Ke një pyetje ose sugjerim? Na shkruaj, lexojmë çdo mesazh.</p>
      }
    >
      <ContactForm />
    </InquiryPage>
  );
}
