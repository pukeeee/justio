"use client";

import { CareersHero } from "@/frontend/widgets/root/careers/ui/CareersHero";
import { CareersWhyJoin } from "@/frontend/widgets/root/careers/ui/CareersWhyJoin";
import { CareersBenefits } from "@/frontend/widgets/root/careers/ui/CareersBenefits";
import { CareersOpenings } from "@/frontend/widgets/root/careers/ui/CareersOpenings";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection";
import { careersContent } from "@/content/main/company/careers";

/**
 * Сторінка кар'єри Justio CRM
 * Побудована за методологією FSD з покращеною версткою та анімаціями
 */
export default function CareersPage() {
  return (
    <main>
      <CareersHero content={careersContent.hero} />
      <CareersWhyJoin content={careersContent.whyJoin} />
      <CareersBenefits content={careersContent.benefits} />
      <CareersOpenings content={careersContent.openings} />
      <CTAsection content={careersContent.cta} />
    </main>
  );
}
