import { ArrowRight } from "lucide-react";
import { MagneticButton } from "../ui-premium/MagneticButton";
import { AuroraBackground } from "../fx/AuroraBackground";
import { ParticleField } from "../fx/ParticleField";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      <AuroraBackground />
      <ParticleField density={40} />
      <div aria-hidden className="absolute inset-0 bg-radial-fade" />

      <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8">
        <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
          <span className="text-gradient">
            Your business deserves more than just a basic website.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          MD Creatives builds premium digital experiences designed to attract clients, build trust, and increase conversions.
        </p>
        <div className="mt-10 flex justify-center">
          <MagneticButton href="/contact">
            Let's Build Something Premium <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
