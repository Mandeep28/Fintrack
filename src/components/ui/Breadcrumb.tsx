"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export default function Breadcrumb({
  items,
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
  className,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4", className)}
    >
      {/* Prominent Back Button Pill */}
      <Link
        href={backHref}
        prefetch={true}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border border-border/80 hover:border-primary/40 transition-all group shadow-xs cursor-pointer shrink-0"
        title={backLabel}
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-primary" />
        <span>Back</span>
      </Link>

      {/* Divider */}
      <div className="h-4 w-px bg-border/80 shrink-0" />

      {/* Breadcrumb Path Trail */}
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  prefetch={true}
                  className="font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "font-bold",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
