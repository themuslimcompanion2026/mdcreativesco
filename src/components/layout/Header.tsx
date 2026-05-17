import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "../ui-premium/MagneticButton";
import { AdminLoginModal } from "../admin/AdminLoginModal";
import { useSiteSetting, usePricingSettings } from "@/hooks/useSiteData";
import { useAuth } from "@/hooks/useAuth";
import { BrandLogo } from "../brand/BrandLogo";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();
  const { data: brand } = useSiteSetting("brand");
  const { data: pricingSettings } = usePricingSettings();
  const { isAdmin } = useAuth();

  // Secret admin trigger: 5 quick clicks OR 800ms long-press
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);
  const pressTimer = useRef<number | null>(null);

  const triggerAdmin = () => {
    setAdminOpen(true);
  };

  const onLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCount.current += 1;
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      const count = clickCount.current;
      clickCount.current = 0;
      if (count >= 5) {
        triggerAdmin();
      } else {
        const target = brand?.logo_redirect_url || "/";
        if (target.startsWith("http")) window.location.href = target;
        else navigate({ to: target });
      }
    }, 400);
  };

  const onPressStart = () => {
    pressTimer.current = window.setTimeout(triggerAdmin, 800);
  };
  const onPressEnd = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ...baseLinks,
    ...(pricingSettings?.visible !== false ? [{ to: "/pricing" as const, label: "Pricing" }] : []),
    { to: "/payment" as const, label: "Payment" },
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
        <a
          href={brand?.logo_redirect_url || "/"}
          onClick={onLogoClick}
          onMouseDown={onPressStart}
          onMouseUp={onPressEnd}
          onMouseLeave={onPressEnd}
          onTouchStart={onPressStart}
          onTouchEnd={onPressEnd}
          className="group relative flex items-center select-none"
          aria-label="MD Creatives"
        >
          <BrandLogo size={40} />
        </a>

        <nav className={`hidden items-center gap-1 rounded-full px-2 py-1.5 md:flex ${scrolled ? "glass" : ""}`}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "rounded-full px-4 py-2 text-sm text-foreground bg-white/5" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="rounded-full px-3 py-2 text-xs font-semibold text-primary hover:bg-white/5">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:block">
          <MagneticButton href="/book">Book a Call</MagneticButton>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full glass md:hidden"
        >
          <span className="relative block h-3 w-5">
            <span className={`absolute left-0 top-0 h-px w-full bg-foreground transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`absolute bottom-0 left-0 h-px w-full bg-foreground transition-transform ${open ? "-translate-y-1 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open && (
        <div className="mx-4 mt-3 rounded-2xl glass p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm text-primary hover:bg-white/5">
                Admin
              </Link>
            )}
            <Link to="/book" onClick={() => setOpen(false)} className="mt-2 rounded-full px-4 py-3 text-center text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              Book a Call
            </Link>
          </div>
        </div>
      )}

      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </header>
  );
}
