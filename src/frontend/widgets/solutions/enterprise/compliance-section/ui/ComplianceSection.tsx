import { LucideIcon } from "lucide-react";

interface ComplianceItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ComplianceSectionProps {
  content: {
    title: string;
    description: string;
    items: ComplianceItem[];
  };
}

export function ComplianceSection({ content }: ComplianceSectionProps) {
  return (
    <div className="py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {content.items.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
