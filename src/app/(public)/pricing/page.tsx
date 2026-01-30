"use client";

import { PricingHero } from "@/widgets/pricing/ui/PricingHero";
import { PricingCards } from "@/widgets/pricing/ui/PricingCards";
import { PricingComparison } from "@/widgets/pricing/ui/PricingComparison";
import { PricingFAQ } from "@/widgets/pricing/ui/PricingFAQ";
import { CTAsection } from "@/widgets/cta-section/ui/CTAsection";
import { pricingContent } from "@/content/main/pricing";

/**
 * Сторінка тарифних планів Justio CRM
 */
export default function PricingPage() {
  return (
    <>
      <PricingHero content={pricingContent.hero} />
      <PricingCards 
        content={{ 
          plans: pricingContent.plans, 
          billing: pricingContent.billing 
        }} 
      />
      <PricingComparison content={pricingContent.comparison} />
      <PricingFAQ content={pricingContent.faq} />
      <CTAsection content={pricingContent.cta} />
    </>
  );
}