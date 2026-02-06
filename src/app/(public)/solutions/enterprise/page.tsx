import { enterpriseContent } from "@/content/main/solutions/enterprise";
import { HeroSolutions } from "@/frontend/widgets/solutions/shared/hero-solutions/ui/HeroSolutions";
import { PainPoints } from "@/frontend/widgets/solutions/shared/pain-points/ui/PainPoints";
import { FeaturesSolutions } from "@/frontend/widgets/solutions/shared/features-solutions/ui/FeaturesSolutions";
import { ComplianceSection } from "@/frontend/widgets/solutions/enterprise/compliance-section/ui/ComplianceSection";
import { CTAsection } from "@/frontend/widgets/cta-section/ui/CTAsection";

export default function Enterprise() {
  const { hero, requirements, features, compliance, cta } = enterpriseContent;

  return (
    <>
      <HeroSolutions content={hero} />
      <PainPoints content={requirements} />
      <FeaturesSolutions content={features} />
      <ComplianceSection content={compliance} />
      <CTAsection content={cta} />
    </>
  );
}
