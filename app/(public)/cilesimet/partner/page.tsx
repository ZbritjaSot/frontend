import type { Metadata } from "next";
import { PartnerForm } from "@/features/public/PartnerForm";
import { InquiryPage } from "@/features/public/inquiry/InquiryPage";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Bëhu Partner",
  description: "Bashkohu me ZbritjaSot dhe trego zbritjet e dyqanit tënd.",
  path: "/cilesimet/partner",
});

export default function PartnerPage() {
  return (
    <InquiryPage
      eyebrow="Partneritet"
      title="Bëhu Partner"
      lead={
        <p>
          Ke një dyqan në Kosovë? Apliko falas; ne të kontaktojmë për hapat e
          ardhshëm.
        </p>
      }
    >
      <PartnerForm />
    </InquiryPage>
  );
}
