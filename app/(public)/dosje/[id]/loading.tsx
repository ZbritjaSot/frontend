import { Frame } from "@/features/public/Frame";
import { Spinner } from "@/components/ui/Spinner";

export default function DosjeLoading() {
  return (
    <Frame className="flex min-h-[50vh] items-center justify-center">
      <Spinner label="Duke ngarkuar dosjen" size="lg" />
    </Frame>
  );
}
