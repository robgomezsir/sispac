import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform-gpu hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1",
        destructive:
          "bg-gradient-to-r from-destructive via-destructive/90 to-destructive text-destructive-foreground shadow-lg hover:shadow-xl hover:-translate-y-1",
        outline:
          "border-2 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/50 shadow-sm hover:shadow-md",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-md hover:shadow-lg hover:-translate-y-1",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        success: "bg-gradient-to-r from-success via-success/90 to-success text-success-foreground shadow-lg hover:shadow-xl hover:-translate-y-1",
        warning: "bg-gradient-to-r from-warning via-warning/90 to-warning text-warning-foreground shadow-lg hover:shadow-xl hover:-translate-y-1",
        info: "bg-gradient-to-r from-info via-info/90 to-info text-info-foreground shadow-lg hover:shadow-xl hover:-translate-y-1",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-12 w-12 rounded-2xl",
        xl: "h-16 rounded-3xl px-10 text-lg",
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
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
