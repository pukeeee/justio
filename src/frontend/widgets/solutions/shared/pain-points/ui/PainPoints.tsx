import { CheckCircle } from "lucide-react";

interface PainPointsProps {
  content: {
    title: string;
    description: string;
    items: string[];
  };
}

export function PainPoints({ content }: PainPointsProps) {
  return (
    <div className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
          {content.items.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <CheckCircle className="h-5 w-5 text-accent shrink-0" />
              <span className="text-sm text-foreground">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
