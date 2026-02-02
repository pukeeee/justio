interface CaseManagementWorkflowProps {
  content: {
    title: string;
    description: string;
    quote: string;
    author: string;
    diagramAlt: string;
  };
}

export function CaseManagementWorkflow({
  content,
}: CaseManagementWorkflowProps) {
  return (
    <div className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="aspect-4/3 rounded-xl border bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              {content.diagramAlt}
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
            <p className="text-lg text-muted-foreground mb-6">
              {content.description}
            </p>
            <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground mb-6">
              "{content.quote}"
            </blockquote>
            <p className="font-medium">— {content.author}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
