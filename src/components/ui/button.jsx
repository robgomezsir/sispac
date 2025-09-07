import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 clay-button hover-tactile",
  {
    variants: {
      variant: {
        default:
          "btn-modern-primary",
        destructive:
          "clay-button bg-destructive text-destructive-foreground hover:bg-destructive/90 clay-glow-destructive",
        outline:
          "btn-modern-outline",
        secondary:
          "btn-modern-secondary",
        ghost: "btn-modern-ghost",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105 transition-all duration-200",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-xl",
        sm: "h-8 px-4 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
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
