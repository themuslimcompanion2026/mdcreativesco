import type { ReactNode } from "react";

export function MarqueeRow({
  children,
  reverse = false,
  className = "",
}: {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <div
        className={`flex w-max gap-6 ${reverse ? "animate-marquee-reverse" : "animate-marquee"} group-hover:[animation-play-state:paused]`}
      >
        <div className="flex shrink-0 gap-6">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-6">
          {children}
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent"
      />
    </div>
  );
}
