import { useRef, type ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  intensity = 8,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * intensity;
    const ry = (x - 0.5) * intensity;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative overflow-hidden rounded-2xl glass transition-transform duration-300 will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), oklch(0.7 0.22 255 / 0.18), transparent 60%)",
          }}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.3), transparent)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
