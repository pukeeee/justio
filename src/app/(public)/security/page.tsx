"use client";

import { SecurityHero } from "@/frontend/widgets/security/ui/SecurityHero";
import { SecurityTrust } from "@/frontend/widgets/security/ui/SecurityTrust";
import { SecurityFeatures } from "@/frontend/widgets/security/ui/SecurityFeatures";
import { SecurityCertifications } from "@/frontend/widgets/security/ui/SecurityCertifications";
import { SecurityPractices } from "@/frontend/widgets/security/ui/SecurityPractices";
import { SecurityInfrastructure } from "@/frontend/widgets/security/ui/SecurityInfrastructure";
import { CTAsection } from "@/frontend/widgets/cta-section/ui/CTAsection";
import { securityContent } from "@/content/main/security";

/**
 * Сторінка безпеки Justio CRM
 * Побудована за методологією FSD з акцентом на захист даних адвокатської таємниці
 */
export default function SecurityPage() {
  return (
    <>
      <SecurityHero content={securityContent.hero} />
      <SecurityTrust content={securityContent.trust} />
      <SecurityFeatures content={securityContent.features} />
      <SecurityCertifications content={securityContent.certifications} />
      <SecurityPractices content={securityContent.practices} />
      <SecurityInfrastructure content={securityContent.infrastructure} />
      <CTAsection content={securityContent.cta} />
    </>
  );
}
