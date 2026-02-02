import { documentsContent } from "@/content/main/product/documents";
import { HeroSubpage } from "@/frontend/widgets/product/shared/hero-subpage/ui/HeroSubpage";
import { ProblemSolutionSubpage } from "@/frontend/widgets/product/shared/problem-solution-subpage/ui/ProblemSolutionSubpage";
import { FeaturesSubpage } from "@/frontend/widgets/product/shared/features-subpage/ui/FeaturesSubpage";
import { CTAsection } from "@/frontend/widgets/cta-section/ui/CTAsection";

export default function ProductDocuments() {
  const { hero, problemSolution, features, cta } = documentsContent;

  return (
    <>
      <HeroSubpage content={hero} />
      <ProblemSolutionSubpage content={problemSolution} />
      <FeaturesSubpage content={features} />
      <CTAsection content={cta} />
    </>
  );
}
