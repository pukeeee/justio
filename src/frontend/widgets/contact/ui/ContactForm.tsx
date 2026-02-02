"use client";

import { motion } from "motion/react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Input } from "@/frontend/shared/components/ui/input";
import { Textarea } from "@/frontend/shared/components/ui/textarea";
import { Label } from "@/frontend/shared/components/ui/label";

interface ContactFormProps {
  content: {
    title: string;
    description: string;
    fields: {
      firstName: { label: string; placeholder: string };
      lastName: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      company: { label: string; placeholder: string };
      message: { label: string; placeholder: string };
    };
    submit: string;
  };
}

export function ContactForm({ content }: ContactFormProps) {
  const { fields } = content;

  return (
    <div className="py-16 md:py-24 bg-muted/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {content.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {content.description}
            </p>
          </div>

          <form className="space-y-8 bg-card border border-border p-8 md:p-10 rounded-3xl shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-semibold ml-1"
                >
                  {fields.firstName.label}
                </Label>
                <Input
                  id="firstName"
                  placeholder={fields.firstName.placeholder}
                  className="h-12 bg-muted/50 border-transparent focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-semibold ml-1"
                >
                  {fields.lastName.label}
                </Label>
                <Input
                  id="lastName"
                  placeholder={fields.lastName.placeholder}
                  className="h-12 bg-muted/50 border-transparent focus:bg-background transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold ml-1">
                {fields.email.label}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={fields.email.placeholder}
                className="h-12 bg-muted/50 border-transparent focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="company" className="text-sm font-semibold ml-1">
                {fields.company.label}
              </Label>
              <Input
                id="company"
                placeholder={fields.company.placeholder}
                className="h-12 bg-muted/50 border-transparent focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="message" className="text-sm font-semibold ml-1">
                {fields.message.label}
              </Label>
              <Textarea
                id="message"
                placeholder={fields.message.placeholder}
                rows={5}
                className="bg-muted/50 border-transparent focus:bg-background transition-all min-h-[150px] resize-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
            >
              {content.submit}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
