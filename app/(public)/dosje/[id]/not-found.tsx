import { BackLink, EmptyNote, Frame } from "@/features/public/Frame";
import { NotFoundRecovery } from "@/features/public/NotFoundRecovery";

export default function FolderNotFound() {
  return (
    <Frame className="py-16">
      <EmptyNote
        title="Fletushka nuk u gjet"
        body="Kjo fletushkë nuk është aktive ose nuk ekziston më."
      />
      <NotFoundRecovery />
      <p className="mt-6">
        <BackLink href="/">Kthehu te ofertat</BackLink>
      </p>
    </Frame>
  );
}
