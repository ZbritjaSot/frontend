import { Frame } from "@/features/public/Frame";

export default function PublicLoading() {
  return (
    <Frame className="py-8" aria-busy="true" aria-label="Duke ngarkuar">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-3">
          <div className="h-3 w-24 rounded-full bg-elevated" />
          <div className="h-14 w-4/5 rounded-2xl bg-elevated" />
          <div className="h-24 w-full rounded-2xl bg-elevated" />
        </div>
        <div className="aspect-[4/3] rounded-3xl bg-elevated" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="grid gap-2">
            <div className="aspect-square rounded-3xl bg-elevated" />
            <div className="h-3 w-1/2 rounded-full bg-elevated" />
            <div className="h-8 rounded-lg bg-elevated" />
          </div>
        ))}
      </div>
    </Frame>
  );
}
