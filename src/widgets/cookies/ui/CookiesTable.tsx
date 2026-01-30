"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface CookieItem {
  name: string;
  purpose: string;
  duration: string;
  examples: string;
}

interface CookiesTableProps {
  content: {
    title: string;
    heads: {
      type: string;
      purpose: string;
      duration: string;
    };
    items: CookieItem[];
  };
}

export function CookiesTable({ content }: CookiesTableProps) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight">
        {content.title}
      </h2>
      
      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-bold text-foreground h-12">
                {content.heads.type}
              </TableHead>
              <TableHead className="font-bold text-foreground h-12">
                {content.heads.purpose}
              </TableHead>
              <TableHead className="font-bold text-foreground h-12">
                {content.heads.duration}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.items.map((cookie, index) => (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-bold text-foreground py-4">
                  {cookie.name}
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  <div>{cookie.purpose}</div>
                  <div className="text-xs mt-1 text-muted-foreground/60 italic">{cookie.examples}</div>
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  {cookie.duration}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {content.items.map((cookie, index) => (
          <div key={index} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-bold text-foreground mb-2 text-lg">
              {cookie.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {cookie.purpose}
            </p>
            <div className="flex justify-between items-center pt-3 border-t border-border/50 text-xs font-medium">
              <span className="text-muted-foreground/60 uppercase tracking-wider">{content.heads.duration}:</span>
              <span className="text-foreground">{cookie.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
