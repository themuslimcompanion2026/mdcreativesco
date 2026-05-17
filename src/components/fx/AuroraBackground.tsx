export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute -left-1/4 top-0 h-[60vh] w-[60vw] rounded-full opacity-50 animate-aurora"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.22 255 / 0.5), transparent 70%)", filter: "blur(80px)" }}
      />
      <div
        className="absolute right-0 top-1/3 h-[55vh] w-[55vw] rounded-full opacity-40 animate-aurora"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.27 305 / 0.5), transparent 70%)", filter: "blur(90px)", animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[50vh] w-[50vw] rounded-full opacity-30 animate-aurora"
        style={{ background: "radial-gradient(circle, oklch(0.5 0.25 280 / 0.5), transparent 70%)", filter: "blur(100px)", animationDelay: "-12s" }}
      />
    </div>
  );
}
