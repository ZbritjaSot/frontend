"use client";

import Image from "next/image";

type LogoMarkProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function LogoMark({
  size = 40,
  className,
  priority = false,
}: LogoMarkProps) {
  return (
    <Image
      className={className}
      src="/media/logo-mark.png"
      alt=""
      width={128}
      height={128}
      unoptimized
      style={{ width: size, height: size }}
      priority={priority}
    />
  );
}
