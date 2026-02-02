import { clientsContent } from "@/content/main/product/clients";
import { HeroSubpage } from "@/frontend/widgets/product/shared/hero-subpage/ui/HeroSubpage";
import { ProblemSolutionSubpage } from "@/frontend/widgets/product/shared/problem-solution-subpage/ui/ProblemSolutionSubpage";
import { FeaturesSubpage } from "@/frontend/widgets/product/shared/features-subpage/ui/FeaturesSubpage";
import { PracticeBenefits } from "@/frontend/widgets/product/clients/practice-benefits/ui/PracticeBenefits";
import { CTAsection } from "@/frontend/widgets/cta-section/ui/CTAsection";

export default function ProductClients() {
  const { hero, problemSolution, features, practiceBenefits, cta } =
    clientsContent;

  return (
    <>
      <HeroSubpage content={hero} />
      <ProblemSolutionSubpage content={problemSolution} />
      <FeaturesSubpage content={features} />
      <PracticeBenefits content={practiceBenefits} />
      <CTAsection content={cta} />
    </>
  );
}
