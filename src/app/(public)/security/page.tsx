"use client";

import { SecurityHero } from "@/widgets/security/ui/SecurityHero";
import { SecurityTrust } from "@/widgets/security/ui/SecurityTrust";
import { SecurityFeatures } from "@/widgets/security/ui/SecurityFeatures";
import { SecurityCertifications } from "@/widgets/security/ui/SecurityCertifications";
import { SecurityPractices } from "@/widgets/security/ui/SecurityPractices";
import { SecurityInfrastructure } from "@/widgets/security/ui/SecurityInfrastructure";
import { CTAsection } from "@/widgets/cta-section/ui/CTAsection";
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