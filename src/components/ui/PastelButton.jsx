import * as React from "react"
import { cn } from "../../lib/utils"

// Função para gerar classes de variantes
const getVariantClasses = (variant, size) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group"
  
  const variantClasses = {
    default: "bg-gradient-to-r from-primary/90 to-primary/80 text-primary-foreground hover:from-primary to-primary/90 shadow-lg hover:shadow-xl border border-primary/20",
    destructive: "bg-gradient-to-r from-destructive/90 to-destructive/80 text-destructive-foreground hover:from-destructive to-destructive/90 shadow-lg hover:shadow-xl border border-destructive/20",
    outline: "bg-transparent text-foreground border-2 border-border hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
    secondary: "bg-gradient-to-r from-secondary/90 to-secondary/80 text-secondary-foreground hover:from-secondary to-secondary/90 shadow-md hover:shadow-lg border border-secondary/20",
    ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
    success: "bg-gradient-to-r from-success/90 to-success/80 text-success-foreground hover:from-success to-success/90 shadow-lg hover:shadow-xl border border-success/20",
    warning: "bg-gradient-to-r from-warning/90 to-warning/80 text-warning-foreground hover:from-warning to-warning/90 shadow-lg hover:shadow-xl border border-warning/20",
    info: "bg-gradient-to-r from-info/90 to-info/80 text-info-foreground hover:from-info to-info/90 shadow-lg hover:shadow-xl border border-info/20",
    glass: "bg-background/80 backdrop-blur-md text-foreground border border-border/50 hover:bg-background/90 shadow-lg hover:shadow-xl",
  }
  
  const sizeClasses = {
    default: "h-10 px-6 py-2 rounded-xl",
    sm: "h-8 px-4 text-xs rounded-lg",
    lg: "h-12 px-8 text-base rounded-2xl",
    xl: "h-14 px-10 text-lg rounded-2xl",
    icon: "h-10 w-10 rounded-xl",
  }
  
  return cn(
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.default
  )
}

const PastelButton = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false, 
  shimmer = false,
  glow = false,
  ...props 
}, ref) => {
  const Comp = asChild ? "div" : "button"
  
  return (
    <Comp
      className={cn(
        getVariantClasses(variant, size),
        shimmer && "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        glow && "shadow-primary/20 hover:shadow-primary/40",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
PastelButton.displayName = "PastelButton"

export { PastelButton }
