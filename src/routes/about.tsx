import { createFileRoute } from "@tanstack/react-router";
import { About } from "../components/sections/About";
import { Process } from "../components/sections/Process";
import { TrustStats } from "../components/sections/TrustStats";
import { FinalCTA } from "../components/sections/FinalCTA";
import { SectionHeading } from "../components/ui-premium/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MD Creatives" },
      { name: "description", content: "MD Creatives is a premium digital experience studio building conversion-focused websites for ambitious brands." },
      { property: "og:title", content: "About MD Creatives" },
      { property: "og:description", content: "A studio built for brands that refuse to look ordinary." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="relative pt-36 pb-4 md:pt-44">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeading
            eyebrow="Our Studio"
            title={<>Crafting premium experiences that convert.</>}
            description="We blend design, psychology, and engineering to build websites that don't just look beautiful — they perform."
          />
        </div>
      </section>
      <About />
      <TrustStats />
      <Process />
      <FinalCTA />
    </>
  );
}
