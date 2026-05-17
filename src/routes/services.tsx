import { createFileRoute } from "@tanstack/react-router";
import { Services } from "../components/sections/Services";
import { FinalCTA } from "../components/sections/FinalCTA";
import { SectionHeading } from "../components/ui-premium/SectionHeading";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — MD Creatives" },
      { name: "description", content: "Premium web development, design, AI integration, SEO, and more — engineered for conversion." },
      { property: "og:title", content: "Services — MD Creatives" },
      { property: "og:description", content: "A complete suite of premium services for ambitious brands." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <section className="relative pt-36 pb-8 md:pt-44">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeading
            eyebrow="What we do"
            title={<>Premium services. Measurable outcomes.</>}
            description="Strategy, design, engineering, and growth — under one elite roof."
          />
        </div>
      </section>
      <Services />
      <FinalCTA />
    </>
  );
}
