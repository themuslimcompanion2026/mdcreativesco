import {
  Rocket, MousePointerClick, Plane, CalendarCheck2, ShoppingBag, Bot,
  PenTool, Search, Smartphone, Gauge, Crown,
} from "lucide-react";
import { GlassCard } from "../ui-premium/GlassCard";
import { SectionHeading } from "../ui-premium/SectionHeading";
import { RevealOnScroll } from "../fx/RevealOnScroll";

const services = [
  { icon: Rocket, title: "High-Converting Websites", desc: "Strategic, premium sites engineered to turn traffic into revenue." },
  { icon: MousePointerClick, title: "Premium Landing Pages", desc: "Cinematic landing experiences for campaigns and launches." },
  { icon: Plane, title: "Travel Agency Websites", desc: "Trust-building sites that book itineraries on autopilot." },
  { icon: CalendarCheck2, title: "Booking Systems", desc: "Smooth, integrated booking flows that reduce friction." },
  { icon: ShoppingBag, title: "E-commerce Stores", desc: "Luxury storefronts optimized for conversion and AOV." },
  { icon: Bot, title: "AI Integrations", desc: "Smart assistants, automation, and AI-powered features." },
  { icon: PenTool, title: "UI/UX Design", desc: "Award-quality interfaces with depth and polish." },
  { icon: Search, title: "SEO Optimization", desc: "Technical SEO baked into every line of code." },
  { icon: Smartphone, title: "Mobile Responsive", desc: "Flawless on every viewport, every device." },
  { icon: Gauge, title: "Speed Optimization", desc: "Sub-second loads. Perfect Core Web Vitals." },
  { icon: Crown, title: "Branding & Presence", desc: "Identity systems that signal premium instantly." },
];

export function Services() {
  return (
    <section className="relative py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-5xl"
        style={{ background: "linear-gradient(90deg, transparent, oklch(0.7 0.22 255 / 0.5), transparent)" }} />
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Services"
          title={<>Everything you need to win online.</>}
          description="A complete suite of premium services to launch, grow, and scale unforgettable digital brands."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <RevealOnScroll key={s.title} delay={(i % 3) * 80}>
              <GlassCard className="h-full p-7" intensity={6}>
                <div
                  className="grid h-12 w-12 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
