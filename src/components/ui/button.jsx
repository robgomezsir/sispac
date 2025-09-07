import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tactile-feedback-strong",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl border border-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl border border-destructive/20",
        outline:
          "bg-transparent text-foreground border border-border hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg border border-secondary/20",
        ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105 transition-all duration-200",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-lg hover:shadow-xl border border-success/20",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-lg hover:shadow-xl border border-warning/20",
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-lg hover:shadow-xl border border-info/20",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-xl",
        sm: "h-8 px-4 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
        xl: "h-14 px-10 text-lg rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
