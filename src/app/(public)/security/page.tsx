"use client";

import { SecurityHero } from "@/frontend/widgets/root/security/ui/SecurityHero";
import { SecurityTrust } from "@/frontend/widgets/root/security/ui/SecurityTrust";
import { SecurityFeatures } from "@/frontend/widgets/root/security/ui/SecurityFeatures";
import { SecurityCertifications } from "@/frontend/widgets/root/security/ui/SecurityCertifications";
import { SecurityPractices } from "@/frontend/widgets/root/security/ui/SecurityPractices";
import { SecurityInfrastructure } from "@/frontend/widgets/root/security/ui/SecurityInfrastructure";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection";
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
