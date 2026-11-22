import { BackLink, EmptyNote, Frame } from "@/features/public/Frame";
import { NotFoundRecovery } from "@/features/public/NotFoundRecovery";

export default function BusinessNotFound() {
  return (
    <Frame className="py-16">
      <EmptyNote
        title="Dyqani nuk u gjet"
        body="Ky dyqan nuk është aktiv ose nuk ekziston më."
      />
      <NotFoundRecovery />
      <p className="mt-6">
        <BackLink href="/">Kthehu te ofertat</BackLink>
      </p>
    </Frame>
  );
}
