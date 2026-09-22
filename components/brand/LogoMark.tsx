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
      src="/media/logo-price-tag.png"
      alt=""
      width={1024}
      height={1024}
      style={{ width: size, height: size }}
      priority={priority}
    />
  );
}
