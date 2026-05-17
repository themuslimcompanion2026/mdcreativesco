import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, Twitter, Mail, ArrowUpRight, Facebook, MessageCircle, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSocialLinks, useSiteSetting, usePricingSettings } from "@/hooks/useSiteData";
import { BrandLogo } from "../brand/BrandLogo";

const ICONS: Record<string, LucideIcon> = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: Send,
};

const LABELS: Record<string, string> = {
  twitter: "Twitter / X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  github: "GitHub",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
};

function buildHref(platform: string, url: string) {
  if (!url) return "";
  const trimmed = url.trim();
  if (platform === "whatsapp" && !trimmed.startsWith("http")) {
    return `https://wa.me/${trimmed.replace(/[^0-9]/g, "")}`;
  }
  if (platform === "telegram" && !trimmed.startsWith("http")) {
    if (trimmed.startsWith("+") || /^\d+$/.test(trimmed.replace(/[^0-9+]/g, ""))) {
      const digits = trimmed.replace(/[^0-9]/g, "");
      return `https://t.me/+${digits}`;
    }
    return `https://t.me/${trimmed.replace(/^@/, "")}`;
  }
  return trimmed;
}

export function Footer() {
  const { data: links = [] } = useSocialLinks();
  const { data: contact } = useSiteSetting("contact");
  const { data: pricingSettings } = usePricingSettings();
  const visibleSocials = links.filter((l) => l.url && l.url.trim().length > 0);
  const email = contact?.email || "hello@mdcreatives.studio";

  return (
    <footer className="relative border-t border-white/5 bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, oklch(0.7 0.22 255 / 0.5), transparent)" }} />
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center">
              <BrandLogo size={40} wordmarkClassName="text-lg font-semibold" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Premium digital experiences engineered to attract clients, build trust, and convert visitors into revenue.
            </p>
            <a href={`mailto:${email}`} className="mt-5 inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary">
              <Mail className="h-4 w-4" />
              {email}
            </a>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Studio</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link></li>
              <li><Link to="/services" className="text-muted-foreground transition-colors hover:text-foreground">Services</Link></li>
              <li><Link to="/portfolio" className="text-muted-foreground transition-colors hover:text-foreground">Portfolio</Link></li>
              {pricingSettings?.visible !== false && (
                <li><Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link></li>
              )}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Connect</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/contact" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link></li>
              <li><Link to="/book" className="text-muted-foreground transition-colors hover:text-foreground">Book a Call</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Newsletter</div>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex items-center gap-2 rounded-full glass p-1.5 pl-4">
              <input type="email" placeholder="you@brand.com" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <button aria-label="Subscribe" type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-primary-foreground transition-transform hover:scale-105" style={{ background: "var(--gradient-primary)" }}>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
            {visibleSocials.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {visibleSocials.map((s) => {
                  const Icon = ICONS[s.platform] ?? ArrowUpRight;
                  return (
                    <a
                      key={s.id}
                      href={buildHref(s.platform, s.url)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={LABELS[s.platform] ?? s.platform}
                      className="grid h-9 w-9 place-items-center rounded-full glass text-muted-foreground transition-all hover:text-foreground hover:shadow-[var(--shadow-glow)]"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} MD Creatives. Crafted with obsession.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
