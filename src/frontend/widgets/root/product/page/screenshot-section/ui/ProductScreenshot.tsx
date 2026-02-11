interface ProductScreenshotProps {
  content: {
    title: string;
    description: string;
    placeholder: string;
  };
}

export function ProductScreenshot({ content }: ProductScreenshotProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>
        <div className="aspect-video max-w-5xl mx-auto rounded-xl border bg-linear-to-br from-muted to-muted/50 shadow-xl flex items-center justify-center">
          <p className="text-muted-foreground">{content.placeholder}</p>
        </div>
      </div>
    </section>
  );
}
