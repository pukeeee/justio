"use client";

import { motion } from "motion/react";
import { CheckCircle2, Sparkles, Bug, Zap } from "lucide-react";
import { Badge } from "@/frontend/shared/components/ui/badge";
import { cn } from "@/frontend/shared/lib/utils";

interface ReleaseItem {
  version: string;
  date: string;
  type: string;
  highlights: string[];
  features: string[];
  improvements: string[];
  fixes: string[];
}

interface ReleasesTimelineProps {
  content: {
    items: ReleaseItem[];
    types: Record<string, string>;
    sections: {
      features: string;
      improvements: string;
      fixes: string;
    };
  };
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "major":
      return "bg-accent text-accent-foreground shadow-sm shadow-accent/20";
    case "minor":
      return "bg-primary text-primary-foreground";
    case "patch":
      return "bg-muted text-muted-foreground border border-border";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function ReleasesTimeline({ content }: ReleasesTimelineProps) {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16 md:space-y-24">
          {content.items.map((release, index) => (
            <motion.div
              key={release.version}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* Хронологічна лінія */}
              {index < content.items.length - 1 && (
                <div className="absolute left-2.75 top-12 bottom-0 w-0.5 bg-linear-to-b from-border to-transparent -mb-20 hidden md:block" />
              )}

              <div className="flex flex-col md:flex-row gap-8">
                {/* Точка на лінії */}
                <div className="hidden md:flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-background",
                      release.type === "major" ? "bg-accent" : "bg-border",
                    )}
                  >
                    <div className="h-2 w-2 rounded-full bg-background" />
                  </div>
                </div>

                {/* Основний контент */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">
                      Версія {release.version}
                    </h2>
                    <Badge
                      className={cn(
                        "px-3 py-1 font-medium",
                        getTypeColor(release.type),
                      )}
                    >
                      {content.types[release.type] || release.type}
                    </Badge>
                    <time className="text-sm font-medium text-muted-foreground ml-auto md:ml-0">
                      {release.date}
                    </time>
                  </div>

                  {/* Короткі тези (Highlights) */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {release.highlights.map((highlight, i) => (
                      <span
                        key={i}
                        className="px-4 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm font-medium text-foreground/80"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 space-y-10">
                      {/* Нові можливості */}
                      {release.features.length > 0 && (
                        <div className="group">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                              <Sparkles className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                              {content.sections.features}
                            </h3>
                          </div>
                          <ul className="grid gap-3 sm:grid-cols-2">
                            {release.features.map((feature, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed"
                              >
                                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Покращення */}
                      {release.improvements.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-5">
                            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                              <Zap className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                              {content.sections.improvements}
                            </h3>
                          </div>
                          <ul className="grid gap-3 sm:grid-cols-2">
                            {release.improvements.map((improvement, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed"
                              >
                                <CheckCircle2 className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Виправлення */}
                      {release.fixes.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-5">
                            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
                              <Bug className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                              {content.sections.fixes}
                            </h3>
                          </div>
                          <ul className="grid gap-3 sm:grid-cols-2">
                            {release.fixes.map((fix, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed"
                              >
                                <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                {fix}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
