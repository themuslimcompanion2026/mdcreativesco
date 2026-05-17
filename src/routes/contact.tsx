import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageSquare, Send } from "lucide-react";
import { SectionHeading } from "../components/ui-premium/SectionHeading";
import { GlassCard } from "../components/ui-premium/GlassCard";
import { MagneticButton } from "../components/ui-premium/MagneticButton";
import { AuroraBackground } from "../components/fx/AuroraBackground";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MD Creatives" },
      { name: "description", content: "Start your premium project with MD Creatives. Let's build something unforgettable." },
      { property: "og:title", content: "Contact MD Creatives" },
      { property: "og:description", content: "Let's build something premium together." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      <AuroraBackground className="opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Get in touch"
          title={<>Let's build something premium.</>}
          description="Tell us about your project. We respond within 24 hours."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "hello@mdcreatives.studio" },
              { icon: MessageSquare, label: "Discovery Call", value: "Book a 30-min strategy call" },
              { icon: MapPin, label: "Studio", value: "Remote · Worldwide" },
            ].map((c) => (
              <GlassCard key={c.label} className="p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{c.label}</div>
                    <div className="mt-0.5 text-sm font-medium">{c.value}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-6 md:p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" name="name" placeholder="Jane Doe" />
                <Field label="Email" name="email" type="email" placeholder="you@brand.com" />
              </div>
              <Field label="Company / Brand" name="company" placeholder="Aurora Co." />
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Project details
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us about your goals, timeline, and what makes your brand special."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-white/[0.05]"
                />
              </div>
              <div className="flex justify-end">
                <MagneticButton type="submit">
                  Send Message <Send className="h-4 w-4" />
                </MagneticButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-white/[0.05]"
      />
    </div>
  );
}
