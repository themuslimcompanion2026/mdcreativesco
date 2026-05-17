import { createFileRoute } from "@tanstack/react-router";
import { Pricing } from "../components/sections/Pricing";
import { AuroraBackground } from "../components/fx/AuroraBackground";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — MD Creatives" },
      { name: "description", content: "Premium engineering, predictable pricing. Choose the package that fits your vision." },
      { property: "og:title", content: "MD Creatives Pricing" },
      { property: "og:description", content: "Investment tiers for premium web projects." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="relative pt-28">
      <AuroraBackground className="opacity-50" />
      <Pricing />
    </div>
  );
}
