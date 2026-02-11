import { soloLawyersContent } from "@/content/main/solutions/solo-lawers";
import { HeroSolutions } from "@/frontend/widgets/root/solutions/shared/hero-solutions/ui/HeroSolutions";
import { PainPoints } from "@/frontend/widgets/root/solutions/shared/pain-points/ui/PainPoints";
import { FeaturesSolutions } from "@/frontend/widgets/root/solutions/shared/features-solutions/ui/FeaturesSolutions";
import { PricingTeaser } from "@/frontend/widgets/root/solutions/solo-lawyers/pricing-teaser/ui/PricingTeaser";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection"; // Використовуємо CTAsection

export default function SoloLawyers() {
  const { hero, painPoints, features, pricingTeaser, cta } = soloLawyersContent;

  return (
    <>
      <HeroSolutions content={hero} />
      <PainPoints content={painPoints} />
      <FeaturesSolutions content={features} />
      <PricingTeaser content={pricingTeaser} />
      <CTAsection content={cta} />
    </>
  );
}
