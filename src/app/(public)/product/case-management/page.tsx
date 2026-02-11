import { caseManagementContent } from "@/content/main/product/case-management";
import { HeroSubpage } from "@/frontend/widgets/root/product/shared/hero-subpage/ui/HeroSubpage";
import { ProblemSolutionSubpage } from "@/frontend/widgets/root/product/shared/problem-solution-subpage/ui/ProblemSolutionSubpage";
import { FeaturesSubpage } from "@/frontend/widgets/root/product/shared/features-subpage/ui/FeaturesSubpage";
import { CaseManagementWorkflow } from "@/frontend/widgets/root/product/case-management/workflow/ui/CaseManagementWorkflow";
import { CaseManagementUseCases } from "@/frontend/widgets/root/product/case-management/use-cases/ui/CaseManagementUseCases";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection";

export default function ProductCaseManagement() {
  const { hero, problemSolution, features, workflow, useCases, cta } =
    caseManagementContent;

  return (
    <>
      <HeroSubpage content={hero} />
      <ProblemSolutionSubpage content={problemSolution} />
      <FeaturesSubpage content={features} />
      <CaseManagementWorkflow content={workflow} />
      <CaseManagementUseCases content={useCases} />
      <CTAsection content={cta} />
    </>
  );
}
