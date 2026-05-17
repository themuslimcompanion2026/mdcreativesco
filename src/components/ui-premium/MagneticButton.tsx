import { useRef, type ReactNode, type MouseEvent } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  type?: "button" | "submit";
};

export function MagneticButton({ children, href, onClick, variant = "primary", className = "", type = "button" }: Props) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.25;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0)";
  };

  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 will-change-transform";

  const styles =
    variant === "primary"
      ? "text-primary-foreground shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-strong)]"
      : "border border-white/15 bg-white/5 text-foreground hover:bg-white/10 backdrop-blur";

  const inner = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full"
          style={{ background: "var(--gradient-primary)" }}
        />
      )}
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "linear-gradient(120deg, transparent 30%, oklch(1 0 0 / 0.3), transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as any}
        href={href}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`group ${base} ${styles} ${className}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      ref={ref as any}
      type={type}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group ${base} ${styles} ${className}`}
    >
      {inner}
    </button>
  );
}
