import { LandingHeader } from "@/widgets/landing/header/ui/LandingHeader";
import { LandingHero } from "@/widgets/landing/hero/ui/LandingHero";
import { PainPointsSection } from "@/widgets/landing/pain-points/ui/PainPointsSection";
import { SolutionSection } from "@/widgets/landing/solution/ui/SolutionSection";
import { FeaturesSection } from "@/widgets/landing/features/ui/FeaturesSection";
import { DifferentiatorsSection } from "@/widgets/landing/differentiators/ui/DifferentiatorsSection";
import { PricingSection } from "@/widgets/landing/pricing/ui/PricingSection";
import { FaqSection } from "@/widgets/landing/faq/ui/FaqSection";
import { FinalCtaSection } from "@/widgets/landing/cta/ui/FinalCtaSection";
import { LandingFooter } from "@/widgets/landing/footer/ui/LandingFooter";
import { ScrollToTop } from "@/shared/components/ScrollToTop";

/**
 * Головна сторінка (Landing Page)
 * Структурована за методологією FSD з покращеною версткою та анімаціями
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header з навігацією */}
      <LandingHeader />

      {/* Основний контент */}
      <main className="flex-1">
        {/* Hero секція з головним value-proposition */}
        <LandingHero />

        {/* Проблеми цільової аудиторії */}
        <PainPointsSection />

        {/* Як працює система (3 кроки) */}
        <SolutionSection />

        {/* Детальний функціонал */}
        <FeaturesSection />

        {/* Чому саме ми (диференціатори) */}
        <DifferentiatorsSection />

        {/* Тарифні плани */}
        <PricingSection />

        {/* Часті запитання */}
        <FaqSection />

        {/* Фінальний CTA */}
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
}
