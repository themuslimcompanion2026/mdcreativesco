import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "../components/sections/Portfolio";
import { FinalCTA } from "../components/sections/FinalCTA";
import { SectionHeading } from "../components/ui-premium/SectionHeading";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — MD Creatives" },
      { name: "description", content: "Selected case studies and premium websites built by MD Creatives." },
      { property: "og:title", content: "Portfolio — MD Creatives" },
      { property: "og:description", content: "Premium projects, real results — explore our selected work." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <>
      <section className="relative pt-36 pb-4 md:pt-44">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeading
            eyebrow="Selected Work"
            title={<>Work that wins.</>}
            description="Cinematic websites engineered for the brands that refuse to look ordinary."
          />
        </div>
      </section>
      <Portfolio />
      <FinalCTA />
    </>
  );
}
