import React from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
  outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  // Modern variants
  modern: "bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300",
  glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 shadow-lg hover:shadow-xl",
  glow: "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
}

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-xl px-3",
  lg: "h-11 rounded-xl px-8",
  icon: "h-10 w-10"
}

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false, 
  ...props 
}, ref) => {
  const Comp = asChild ? React.Fragment : "button"
  
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

// Specialized button components
const ButtonModern = React.forwardRef(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    variant="modern"
    className={cn("relative overflow-hidden group", className)}
    {...props}
  >
    <span className="relative z-10">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
  </Button>
))
ButtonModern.displayName = "ButtonModern"

const ButtonGlass = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="glass"
    className={cn("backdrop-blur-md", className)}
    {...props}
  />
))
ButtonGlass.displayName = "ButtonGlass"

const ButtonGlow = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="glow"
    className={cn("hover:shadow-primary/25", className)}
    {...props}
  />
))
ButtonGlow.displayName = "ButtonGlow"

const ButtonIcon = React.forwardRef(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    size="icon"
    className={cn("rounded-full", className)}
    {...props}
  >
    {children}
  </Button>
))
ButtonIcon.displayName = "ButtonIcon"

export { 
  Button, 
  ButtonModern, 
  ButtonGlass, 
  ButtonGlow, 
  ButtonIcon,
  buttonVariants 
}