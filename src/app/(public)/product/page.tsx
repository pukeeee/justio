import { productContent } from "@/content/main/product";
import { ProductHero } from "@/frontend/widgets/root/product/page/hero-section/ui/ProductHero";
import { ProductPhilosophy } from "@/frontend/widgets/root/product/page/philosophy-section/ui/ProductPhilosophy";
import { ProductArchitecture } from "@/frontend/widgets/root/product/shared/architecture-section/ui/ProductArchitecture";
import { ProductFeatures } from "@/frontend/widgets/root/product/page/features-section/ui/ProductFeatures";
import { ProductScreenshot } from "@/frontend/widgets/root/product/page/screenshot-section/ui/ProductScreenshot";
import { CTAsection } from "@/frontend/widgets/root/cta-section/ui/CTAsection";

export default function Product() {
  const { hero, philosophy, architecture, capabilities, screenshot, cta } =
    productContent;

  return (
    <>
      <ProductHero content={hero} />
      <ProductPhilosophy content={philosophy} />
      <ProductArchitecture content={architecture} />
      <ProductFeatures content={capabilities} />
      <ProductScreenshot content={screenshot} />
      <CTAsection content={cta} />
    </>
  );
}
