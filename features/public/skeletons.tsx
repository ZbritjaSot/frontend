function Bone({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-lg bg-elevated ${className}`} />;
}

export function HomePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Duke ngarkuar kryefaqen" className="pb-16">
      <div className="mx-auto w-full max-w-6xl px-5 pt-3 sm:px-8">
        <Bone className="h-14 w-full rounded-full" />
        <div className="mt-4 flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-2">
              <Bone className="size-12 rounded-full" />
              <Bone className="h-2.5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 bg-forest px-5 py-8 text-ivory sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-4">
          <Bone className="h-10 w-3/5 bg-white/15" />
          <div className="flex items-center gap-3">
            <Bone className="size-12 rounded-2xl bg-white/15" />
            <Bone className="h-5 w-40 bg-white/15" />
          </div>
          <Bone className="h-8 w-4/5 bg-white/15" />
          <Bone className="h-5 w-28 bg-white/15" />
          <Bone className="aspect-[4/3] w-full rounded-hero bg-white/10" />
          <div className="flex h-11 items-center gap-2">
            <Bone className="h-2.5 w-8 rounded-full bg-accent/80" />
            <Bone className="size-2.5 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 w-full max-w-6xl px-5 sm:px-8">
        <Bone className="h-8 w-48" />
        <div className="mt-4 flex gap-3 overflow-hidden">
          <Bone className="aspect-[4/5] w-56 shrink-0 rounded-2xl" />
          <Bone className="aspect-[4/5] w-56 shrink-0 rounded-2xl" />
        </div>
      </div>
      <div className="mx-auto mt-10 w-full max-w-6xl px-5 sm:px-8">
        <Bone className="h-8 w-40" />
        <Bone className="mt-4 h-36 w-full rounded-2xl" />
        <Bone className="mt-3 h-24 w-full rounded-2xl" />
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-6xl gap-3 overflow-hidden px-5 sm:px-8">
        <Bone className="h-[4.5rem] w-[17.5rem] shrink-0 rounded-lg" />
        <Bone className="h-[4.5rem] w-[17.5rem] shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

export function OfferCatalogueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Duke ngarkuar ofertat" className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Bone className="h-3 w-24 rounded-full" />
      <Bone className="mt-3 h-14 w-2/3" />
      <Bone className="mt-4 h-5 w-52" />
      <Bone className="mt-5 h-11 w-full max-w-xl rounded-full" />
      <div className="mt-4 flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-2">
            <Bone className="size-12 rounded-full" />
            <Bone className="h-2.5 w-12 rounded-full" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Bone className="h-11 w-32 rounded-full" />
        <Bone className="h-11 w-36 rounded-full" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="grid gap-2">
            <Bone className="aspect-square rounded-2xl" />
            <Bone className="h-3 w-1/2 rounded-full" />
            <Bone className="h-4 w-5/6" />
            <Bone className="h-4 w-2/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlyerCatalogueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Duke ngarkuar fletushkat" className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Bone className="h-3 w-24 rounded-full" />
      <Bone className="mt-3 h-14 w-2/3" />
      <Bone className="mt-4 h-5 w-56" />
      <Bone className="mt-5 h-11 w-full max-w-xl rounded-full" />
      <div className="mt-4 flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <Bone key={index} className="size-12 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Bone className="h-11 w-32 rounded-full" />
        <Bone className="h-11 w-36 rounded-full" />
      </div>
      <Bone className="mt-8 h-44 w-full rounded-2xl" />
      <Bone className="mt-3 h-24 w-full rounded-2xl" />
      <Bone className="mt-3 h-24 w-full rounded-2xl" />
    </div>
  );
}

export function PartnerDirectorySkeleton() {
  return (
    <div aria-busy="true" aria-label="Duke ngarkuar partnerët" className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Bone className="h-3 w-24 rounded-full" />
      <Bone className="mt-3 h-14 w-1/2" />
      <Bone className="mt-5 h-11 w-full max-w-xl rounded-full" />
      <Bone className="mt-4 h-11 w-32 rounded-full" />
      <div className="mt-8 grid gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="grid gap-3 border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <Bone className="size-12 rounded-2xl" />
              <div className="grid flex-1 gap-2">
                <Bone className="h-5 w-1/2" />
                <Bone className="h-3 w-1/3" />
              </div>
            </div>
            <div className="flex gap-2.5 overflow-hidden">
              <Bone className="h-36 w-[9.5rem] shrink-0 rounded-2xl" />
              <Bone className="h-36 w-[9.5rem] shrink-0 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OfferDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Duke ngarkuar ofertën" className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Bone className="h-4 w-64 max-w-full" />
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-12">
        <Bone className="aspect-[4/3] w-full rounded-2xl lg:col-span-7" />
        <div className="grid gap-3 lg:col-span-5">
          <Bone className="h-3 w-24 rounded-full" />
          <Bone className="h-10 w-4/5" />
          <Bone className="h-7 w-32" />
          <Bone className="h-4 w-40" />
          <div className="mt-2 flex items-center gap-3">
            <Bone className="size-11 rounded-lg" />
            <Bone className="h-5 w-40" />
          </div>
        </div>
      </div>
      <Bone className="mt-10 h-6 w-48" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Bone key={index} className="aspect-square rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function FlyerDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Duke ngarkuar dosjen">
      <div className="bg-forest px-5 py-8 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-3">
          <Bone className="h-4 w-56 max-w-full bg-white/15" />
          <div className="flex items-center gap-3">
            <Bone className="size-7 rounded-lg bg-white/15" />
            <Bone className="h-4 w-32 bg-white/15" />
          </div>
          <Bone className="h-12 w-4/5 bg-white/15" />
          <Bone className="h-4 w-2/3 bg-white/15" />
          <Bone className="aspect-[4/5] w-full max-w-xs rounded-hero bg-white/10" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <Bone className="h-8 w-36" />
        <div className="mt-4 grid gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Bone className="size-20 rounded-2xl" />
              <div className="grid flex-1 gap-2">
                <Bone className="h-4 w-2/3" />
                <Bone className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShopDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Duke ngarkuar dyqanin" className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <div className="rounded-2xl border border-line p-5">
        <Bone className="size-[4.5rem] rounded-2xl" />
        <Bone className="mt-3 h-3 w-24 rounded-full" />
        <Bone className="mt-2 h-10 w-1/2" />
        <Bone className="mt-2 h-4 w-40" />
      </div>
      <Bone className="mt-5 h-11 w-full max-w-xl rounded-full" />
      <div className="mt-4 flex gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Bone key={index} className="size-12 shrink-0 rounded-full" />
        ))}
      </div>
      <Bone className="mt-8 h-8 w-40" />
      <Bone className="mt-4 h-36 w-full rounded-2xl" />
      <Bone className="mt-8 h-7 w-48" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Bone key={index} className="aspect-square rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function FavoritesSkeleton() {
  return (
    <div aria-busy="true" aria-label="Duke ngarkuar të preferuarat" className="mt-10 grid gap-8">
      <div>
        <Bone className="h-3 w-28 rounded-full" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Bone className="h-40 rounded-2xl" />
          <Bone className="h-40 rounded-2xl" />
        </div>
      </div>
      <div>
        <Bone className="h-3 w-24 rounded-full" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="grid gap-2">
              <Bone className="aspect-square rounded-2xl" />
              <Bone className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
