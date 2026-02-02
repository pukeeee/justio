"use client";

import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/shared/components/ui/table";
import { cn } from "@/frontend/shared/lib/utils";

interface Feature {
  name: string;
  free: boolean | string;
  solo: boolean | string;
  firm: boolean | string;
  enterprise: boolean | string;
}

interface Category {
  category: string;
  features: Feature[];
}

interface PricingComparisonProps {
  content: {
    title: string;
    description: string;
    heads: {
      features: string;
      free: string;
      solo: string;
      firm: string;
      enterprise: string;
    };
    categories: Category[];
  };
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-accent mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
  }
  return <span className="text-sm text-foreground font-medium">{value}</span>;
}

/**
 * Детальна таблиця порівняння тарифів
 */
export function PricingComparison({ content }: PricingComparisonProps) {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground">{content.description}</p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground font-bold h-14 bg-muted/30 px-6 min-w-[200px]">
                    {content.heads.features}
                  </TableHead>
                  <TableHead className="text-center text-foreground font-semibold h-14 min-w-[120px]">
                    {content.heads.free}
                  </TableHead>
                  <TableHead className="text-center text-foreground font-semibold h-14 min-w-[120px]">
                    {content.heads.solo}
                  </TableHead>
                  <TableHead className="text-center text-foreground font-semibold bg-accent/5 h-14 min-w-[120px]">
                    {content.heads.firm}
                  </TableHead>
                  <TableHead className="text-center text-foreground font-semibold h-14 min-w-[120px]">
                    {content.heads.enterprise}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.categories.flatMap((category) => [
                  <TableRow
                    key={`category-${category.category}`}
                    className="bg-muted/50 border-border hover:bg-muted/60"
                  >
                    <TableCell
                      colSpan={5}
                      className="font-bold text-foreground py-4 px-6 uppercase text-xs tracking-wider"
                    >
                      {category.category}
                    </TableCell>
                  </TableRow>,
                  ...category.features.map((feature) => (
                    <TableRow
                      key={`feature-${category.category}-${feature.name}`}
                      className="border-border transition-colors"
                    >
                      <TableCell className="text-muted-foreground py-4 px-6 font-medium">
                        {feature.name}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <FeatureValue value={feature.free} />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <FeatureValue value={feature.solo} />
                      </TableCell>
                      <TableCell className="text-center bg-accent/5 py-4">
                        <FeatureValue value={feature.firm} />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <FeatureValue value={feature.enterprise} />
                      </TableCell>
                    </TableRow>
                  )),
                ])}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
