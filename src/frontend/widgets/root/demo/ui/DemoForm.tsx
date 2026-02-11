"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/shared/components/ui/button";
import { Input } from "@/frontend/shared/components/ui/input";
import { Label } from "@/frontend/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/shared/components/ui/select";
import { routes } from "@/shared/routes/main-routes";

interface DemoFormProps {
  content: {
    title: string;
    fields: {
      firstName: { label: string; placeholder: string };
      lastName: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      company: { label: string; placeholder: string };
      size: {
        label: string;
        placeholder: string;
        options: { value: string; label: string }[];
      };
    };
    submit: string;
    agreement: {
      text: string;
      terms: string;
      privacy: string;
    };
  };
}

export function DemoForm({ content }: DemoFormProps) {
  const { fields, agreement } = content;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative"
    >
      {/* Декоративний фон для форми */}
      <div className="absolute -inset-4 bg-linear-to-tr from-primary/5 to-accent/5 rounded-[2.5rem] blur-2xl -z-10" />

      <div className="rounded-[2rem] border border-border bg-card p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight">
          {content.title}
        </h2>

        <form className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2.5">
              <Label htmlFor="firstName" className="ml-1 font-semibold text-sm">
                {fields.firstName.label}
              </Label>
              <Input
                id="firstName"
                placeholder={fields.firstName.placeholder}
                className="h-12 bg-muted/30 border-transparent focus:bg-background transition-all"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="lastName" className="ml-1 font-semibold text-sm">
                {fields.lastName.label}
              </Label>
              <Input
                id="lastName"
                placeholder={fields.lastName.placeholder}
                className="h-12 bg-muted/30 border-transparent focus:bg-background transition-all"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="email" className="ml-1 font-semibold text-sm">
              {fields.email.label}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={fields.email.placeholder}
              className="h-12 bg-muted/30 border-transparent focus:bg-background transition-all"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="company" className="ml-1 font-semibold text-sm">
              {fields.company.label}
            </Label>
            <Input
              id="company"
              placeholder={fields.company.placeholder}
              className="h-12 bg-muted/30 border-transparent focus:bg-background transition-all"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="size" className="ml-1 font-semibold text-sm">
              {fields.size.label}
            </Label>
            <Select name="size">
              <SelectTrigger className="h-12 bg-muted/30 border-transparent focus:bg-background transition-all">
                <SelectValue placeholder={fields.size.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {fields.size.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
          >
            {content.submit}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <p className="text-xs text-center text-muted-foreground leading-relaxed px-4">
            {agreement.text}{" "}
            <Link
              href={routes.legal.terms}
              className="underline font-medium hover:text-primary transition-colors"
            >
              {agreement.terms}
            </Link>{" "}
            та{" "}
            <Link
              href={routes.legal.privacy}
              className="underline font-medium hover:text-primary transition-colors"
            >
              {agreement.privacy}
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  );
}
