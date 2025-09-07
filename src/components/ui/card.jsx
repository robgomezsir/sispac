import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, interactive = false, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-card text-card-foreground shadow-lg transition-all duration-300 relative overflow-hidden group",
      interactive && "tactile-feedback-strong cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:scale-105 active:scale-95",
      variant === "glass" && "backdrop-blur-md bg-card/80 border-border/50 hover:bg-card/90",
      variant === "elevated" && "shadow-xl hover:shadow-2xl hover:-translate-y-2",
      variant === "outline" && "border-2 border-border/60 bg-transparent hover:bg-accent/5",
      variant === "pastel" && "bg-gradient-to-br from-card/90 to-card/70 border-border/40 hover:from-card/95 hover:to-card/80",
      variant === "modern" && "bg-card/95 backdrop-blur-sm border-border/50 hover:shadow-2xl hover:-translate-y-1 hover:scale-102",
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
