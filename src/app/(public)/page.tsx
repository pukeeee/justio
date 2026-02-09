import { ScrollToTop } from "@/frontend/shared/components/ScrollToTop";
import HeroSection from "@/frontend/widgets/root/main/hero-section/HeroSection";
import WhyWeSection from "@/frontend/widgets/root/main/why-section/WhyWeSection";
import SolutionsSection from "@/frontend/widgets/root/main/solutions-section/SolutionsSection";
import ProductsSection from "@/frontend/widgets/root/main/products-section/ProductsSection";
import SecuritySection from "@/frontend/widgets/root/main/security-section/SecuritySection";
import FinalSection from "@/frontend/widgets/root/main/final-cta-section/FinalSection";
import { mainPageContent } from "@/content/main";

/**
 * Головна сторінка (Landing Page)
 * Структурована за методологією FSD з покращеною версткою та анімаціями
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Основний контент */}
      <main className="flex-1">
        <HeroSection content={mainPageContent.hero} />
        <WhyWeSection content={mainPageContent.whyWe} />
        <SolutionsSection content={mainPageContent.solutions} />
        <ProductsSection content={mainPageContent.products} />
        <SecuritySection content={mainPageContent.security} />
        <FinalSection content={mainPageContent.finalCta} />
      </main>

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
}
