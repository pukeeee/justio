"use client";

import { TermsHero } from "@/frontend/widgets/terms/ui/TermsHero";
import { TermsSections } from "@/frontend/widgets/terms/ui/TermsSections";
import { termsContent } from "@/content/main/terms";

/**
 * Сторінка Умов надання послуг Justio CRM
 * Оформлена як Публічна оферта відповідно до законодавства України
 */
export default function TermsPage() {
  return (
    <main>
      <TermsHero content={termsContent.hero} />
      <TermsSections
        intro={termsContent.intro}
        sections={termsContent.sections}
      />
    </main>
  );
}
