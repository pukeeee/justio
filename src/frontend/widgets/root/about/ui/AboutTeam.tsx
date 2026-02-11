"use client";

import { motion } from "motion/react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

interface AboutTeamProps {
  content: {
    title: string;
    members: TeamMember[];
  };
}

export function AboutTeam({ content }: AboutTeamProps) {
  return (
    <div className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-foreground text-center mb-16 sm:text-4xl">
            {content.title}
          </h2>
          <div className="grid gap-12 md:grid-cols-2">
            {content.members.map((person, index) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="h-20 w-20 rounded-2xl bg-primary/10 shrink-0 flex items-center justify-center text-primary border border-primary/10 shadow-inner group transition-transform hover:scale-105">
                  <span className="text-2xl font-bold">
                    {person.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-xl mb-1">
                    {person.name}
                  </h3>
                  <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-3">
                    {person.role}
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {person.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
