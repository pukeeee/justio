import { teamContent } from "@/content/main/product/team";
import { HeroSubpage } from "@/frontend/widgets/root/product/shared/hero-subpage/ui/HeroSubpage";
import { ProblemSolutionSubpage } from "@/frontend/widgets/root/product/shared/problem-solution-subpage/ui/ProblemSolutionSubpage";
import { FeaturesSubpage } from "@/frontend/widgets/root/product/shared/features-subpage/ui/FeaturesSubpage";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection";

export default function ProductTeam() {
  const { hero, problemSolution, features, cta } = teamContent;

  return (
    <>
      <HeroSubpage content={hero} />
      <ProblemSolutionSubpage content={problemSolution} />
      <FeaturesSubpage content={features} />
      <CTAsection content={cta} />
    </>
  );
}
