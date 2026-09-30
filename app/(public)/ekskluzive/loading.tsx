import { Frame } from "@/features/public/Frame";
import { Spinner } from "@/components/ui/Spinner";

export default function ExclusiveLoading() {
  return (
    <Frame className="flex min-h-[50vh] items-center justify-center">
      <Spinner label="Duke ngarkuar" size="lg" />
    </Frame>
  );
}
