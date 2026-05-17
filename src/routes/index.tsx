import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "../components/sections/Hero";
import { TrustStats } from "../components/sections/TrustStats";
import { About } from "../components/sections/About";
import { Services } from "../components/sections/Services";
import { WhyChoose } from "../components/sections/WhyChoose";
import { Portfolio } from "../components/sections/Portfolio";
import { Testimonials } from "../components/sections/Testimonials";
import { Process } from "../components/sections/Process";
import { Pricing } from "../components/sections/Pricing";
import { FinalCTA } from "../components/sections/FinalCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MD Creatives — Premium Web Development Studio" },
      { name: "description", content: "We build premium websites designed to increase trust, attract customers, and turn visitors into paying clients." },
      { property: "og:title", content: "MD Creatives — Websites That Convert" },
      { property: "og:description", content: "Premium digital experiences engineered for trust, beauty, and conversion." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <TrustStats />
      <About />
      <Services />
      <WhyChoose />
      <Portfolio />
      <Testimonials />
      <Process />
      <Pricing />
      <FinalCTA />
    </>
  );
}
