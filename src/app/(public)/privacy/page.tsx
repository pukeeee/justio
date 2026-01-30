"use client";

import { PrivacyHero } from "@/widgets/privacy/ui/PrivacyHero";
import { PrivacySections } from "@/widgets/privacy/ui/PrivacySections";
import { privacyContent } from "@/content/main/privacy";

/**
 * Сторінка Політики конфіденційності Justio CRM
 * Складена відповідно до Закону України «Про захист персональних даних»
 */
export default function PrivacyPage() {
  return (
    <main>
      <PrivacyHero content={privacyContent.hero} />
      <PrivacySections sections={privacyContent.sections} />
    </main>
  );
}