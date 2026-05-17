import { useSiteSetting } from "@/hooks/useSiteData";
import { motion } from "framer-motion";

type Props = {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
  glow?: boolean;
  animate?: boolean;
};

/**
 * Centralized global logo. Pulls the uploaded logo from site_settings.brand
 * so every instance across the site updates simultaneously when the admin
 * uploads a new logo. Falls back to the gradient "M" mark if none is set.
 */
export function BrandLogo({
  size = 40,
  showWordmark = true,
  wordmarkClassName = "text-base font-semibold tracking-tight",
  className = "",
  glow = true,
  animate = true,
}: Props) {
  const { data: brand } = useSiteSetting("brand");
  const logoUrl: string | undefined = brand?.logo_url;

  const Mark = (
    <motion.span
      initial={animate ? { scale: 0.92, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative grid place-items-center overflow-hidden rounded-xl"
      style={{
        width: size,
        height: size,
        background: logoUrl ? "transparent" : "var(--gradient-primary)",
        boxShadow: glow ? "var(--shadow-glow)" : undefined,
      }}
    >
      {logoUrl ? (
        <>
          <span className="absolute inset-0 glass rounded-xl" aria-hidden />
          <img
            src={logoUrl}
            alt="MD Creatives"
            className="relative z-10 object-contain"
            style={{ width: size * 0.72, height: size * 0.72 }}
            loading="eager"
            decoding="async"
          />
        </>
      ) : (
        <span
          className="text-sm font-bold text-primary-foreground"
          style={{ fontSize: Math.max(12, size * 0.36) }}
        >
          M
        </span>
      )}
      {glow && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
          style={{
            background:
              "radial-gradient(120px circle at 50% 50%, oklch(0.7 0.22 255 / 0.4), transparent 70%)",
          }}
        />
      )}
    </motion.span>
  );

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {Mark}
      {showWordmark && (
        <span className={wordmarkClassName}>
          MD <span className="text-gradient">Creatives</span>
        </span>
      )}
    </span>
  );
}
