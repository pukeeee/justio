"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Badge } from "@/frontend/shared/components/ui/badge";
import { Clock, User, ArrowRight } from "lucide-react";

interface Post {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

interface BlogGridProps {
  posts: Post[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  return (
    <section className="pb-16 sm:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href="#" className="group block h-full">
                <div className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/20 h-full flex flex-col">
                  <Badge
                    variant="secondary"
                    className="w-fit mb-5 px-2.5 py-0.5 bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors border-none"
                  >
                    {post.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
