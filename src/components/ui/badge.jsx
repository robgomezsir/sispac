import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-md hover:shadow-lg clay-glow-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-md hover:shadow-lg hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-md hover:shadow-lg clay-glow-destructive",
        outline: "text-foreground border-border hover:bg-accent/50 hover:border-primary/50",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 shadow-md hover:shadow-lg clay-glow-success",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 shadow-md hover:shadow-lg clay-glow-warning",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 shadow-md hover:shadow-lg clay-glow-info",
        pastel:
          "border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10 shadow-sm hover:shadow-md",
        glass:
          "border-border/50 bg-card/80 backdrop-blur-md text-card-foreground hover:bg-card/90 shadow-sm hover:shadow-md",
        modern:
          "border-border/40 bg-card/95 backdrop-blur-sm text-card-foreground hover:bg-card shadow-sm hover:shadow-lg hover:border-primary/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
