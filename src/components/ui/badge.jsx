import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105 transform-gpu shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-gradient-to-r from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20",
        secondary:
          "border-secondary/30 bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary-foreground hover:from-secondary/30 hover:to-secondary/20",
        destructive:
          "border-destructive/30 bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive hover:from-destructive/30 hover:to-destructive/20",
        success:
          "border-success/30 bg-gradient-to-r from-success/20 to-success/10 text-success hover:from-success/30 hover:to-success/20",
        warning:
          "border-warning/30 bg-gradient-to-r from-warning/20 to-warning/10 text-warning hover:from-warning/30 hover:to-warning/20",
        info:
          "border-info/30 bg-gradient-to-r from-info/20 to-info/10 text-info hover:from-info/30 hover:to-info/20",
        outline: "text-foreground border-border/50 bg-background/50 hover:bg-accent/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
