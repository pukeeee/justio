import { lawFirmsContent } from "@/content/main/solutions/law-firms";
import { HeroSolutions } from "@/frontend/widgets/root/solutions/shared/hero-solutions/ui/HeroSolutions";
import { PainPoints } from "@/frontend/widgets/root/solutions/shared/pain-points/ui/PainPoints";
import { FeaturesSolutions } from "@/frontend/widgets/root/solutions/shared/features-solutions/ui/FeaturesSolutions";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection";

export default function LawFirms() {
  const { hero, painPoints, features, cta } = lawFirmsContent;

  return (
    <>
      <HeroSolutions content={hero} />
      <PainPoints content={painPoints} />
      <FeaturesSolutions content={features} />
      <CTAsection content={cta} />
    </>
  );
}
