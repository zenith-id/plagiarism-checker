import { Hero } from "@/components/marketing/Hero";
import { PromoVideo } from "@/components/marketing/PromoVideo";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CtaSection } from "@/components/marketing/CtaSection";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <PromoVideo />
      <FeatureGrid />
      <HowItWorks />
      <CtaSection />
    </>
  );
}
