"use client";

import { DemoInfo } from "@/frontend/widgets/demo/ui/DemoInfo";
import { DemoForm } from "@/frontend/widgets/demo/ui/DemoForm";
import { demoContent } from "@/content/main/demo";

/**
 * Сторінка запиту на демо Justio CRM
 * Побудована за методологією FSD з акцентом на конверсію та зручність заповнення
 */
export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid gap-16 lg:grid-cols-2 items-center min-h-[calc(100vh-12rem)]">
        <DemoInfo content={demoContent.info} />
        <DemoForm content={demoContent.form} />
      </div>
    </div>
  );
}
