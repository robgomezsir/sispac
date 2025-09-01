import React from 'react'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border/50 bg-card text-card-foreground shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
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
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Card variants
const CardModern = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2",
      className
    )}
    {...props}
  />
))
CardModern.displayName = "CardModern"

const CardGlass = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-card-foreground shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1",
      "dark:border-black/20 dark:bg-black/10",
      className
    )}
    {...props}
  />
))
CardGlass.displayName = "CardGlass"

const CardHover = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border/50 bg-card text-card-foreground shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]",
      className
    )}
    {...props}
  />
))
CardHover.displayName = "CardHover"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardModern,
  CardGlass,
  CardHover
}