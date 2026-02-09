"use client";

import { PricingHero } from "@/frontend/widgets/root/pricing/ui/PricingHero";
import { PricingCards } from "@/frontend/widgets/root/pricing/ui/PricingCards";
import { PricingComparison } from "@/frontend/widgets/root/pricing/ui/PricingComparison";
import { PricingFAQ } from "@/frontend/widgets/root/pricing/ui/PricingFAQ";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection";
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
          billing: pricingContent.billing,
        }}
      />
      <PricingComparison content={pricingContent.comparison} />
      <PricingFAQ content={pricingContent.faq} />
      <CTAsection content={pricingContent.cta} />
    </>
  );
}
