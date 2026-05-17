import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow && (
        <div
          className={`mb-5 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.7_0.22_255)]" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
        <span className="text-gradient">{title}</span>
      </h2>
      {description && (
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
