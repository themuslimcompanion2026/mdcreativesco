import { Star } from "lucide-react";
import { SectionHeading } from "../ui-premium/SectionHeading";
import { MarqueeRow } from "../ui-premium/MarqueeRow";

const testimonials = [
  { name: "Sophia Lin", role: "Founder · Aurora Travel", quote: "MD Creatives transformed our booking experience. Conversions tripled in the first month — and the site looks unreal." },
  { name: "Marcus Avery", role: "CEO · Vault Commerce", quote: "The most premium agency we've ever worked with. Every interaction feels intentional and luxurious." },
  { name: "Amira Khan", role: "CMO · Nova AI", quote: "They don't just build websites — they engineer brand perception. Our investors literally noticed." },
  { name: "Daniel Roy", role: "Owner · Atelier Maison", quote: "From concept to launch, the experience felt like working with a Silicon Valley studio. World-class." },
  { name: "Elena Rossi", role: "Director · Lumen Agency", quote: "Speed, polish, conversions. They delivered all three without compromise. Genuinely award-quality." },
  { name: "Jordan Park", role: "Founder · Pulse", quote: "I've worked with 6 agencies before. None of them came close. MD Creatives sets the standard." },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title={<>Loved by ambitious brands.</>}
          description="Real words from real founders who chose premium over average."
        />
      </div>

      <div className="mt-14 space-y-6">
        <MarqueeRow>
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </MarqueeRow>
        <MarqueeRow reverse>
          {[...testimonials].reverse().map((t) => (
            <TestimonialCard key={`r-${t.name}`} {...t} />
          ))}
        </MarqueeRow>
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, quote }: { name: string; role: string; quote: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("");
  return (
    <div className="w-[360px] shrink-0 rounded-2xl glass p-6 transition-all hover:shadow-[var(--shadow-glow)]">
      <div className="flex items-center gap-1 text-primary">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{quote}"</p>
      <div className="mt-5 flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-full text-xs font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  );
}
