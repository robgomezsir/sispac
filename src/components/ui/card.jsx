import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, interactive = false, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-card text-card-foreground shadow-lg transition-all duration-300",
      interactive && "tactile-feedback-strong cursor-pointer hover:shadow-xl",
      variant === "glass" && "backdrop-blur-md bg-card/80 border-border/50",
      variant === "elevated" && "shadow-xl hover:shadow-2xl",
      variant === "outline" && "border-2 border-border/60 bg-transparent",
      className
    )}
    {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
