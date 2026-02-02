"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/frontend/shared/components/ui/badge";

interface FeaturedPost {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  imageLabel: string;
  cta: string;
}

interface BlogFeaturedPostProps {
  post: FeaturedPost;
}

export function BlogFeaturedPost({ post }: BlogFeaturedPostProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link href="#" className="group block">
            <div className="rounded-3xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto bg-muted flex items-center justify-center border-b md:border-b-0 md:border-r border-border/50">
                  <div className="text-8xl transition-transform duration-500 group-hover:scale-110">
                    {post.imageLabel}
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <Badge
                    variant="secondary"
                    className="w-fit mb-6 px-3 py-1 bg-primary/10 text-primary border-none"
                  >
                    {post.category}
                  </Badge>
                  <h2 className="text-2xl lg:text-4xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      {post.author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary/60" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary/60" />
                      {post.readTime}
                    </span>
                  </div>
                  <div className="mt-8 flex items-center text-base font-bold text-primary">
                    {post.cta}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
