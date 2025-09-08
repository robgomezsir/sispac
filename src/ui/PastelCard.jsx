import * as React from "react"
import { cn } from "../lib/utils"

const PastelCard = React.forwardRef(({ 
  className, 
  variant = "default", 
  interactive = false, 
  glow = false,
  children, 
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out",
        "bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm",
        "border-border/60 shadow-lg",
        interactive && "cursor-pointer tactile-feedback-strong",
        glow && "shadow-primary/20",
        variant === "glass" && "backdrop-blur-md bg-card/80 border-border/50",
        variant === "elevated" && "shadow-xl hover:shadow-2xl",
        variant === "outline" && "border-2 border-primary/30 bg-transparent",
        variant === "success" && "border-success/30 bg-success/5",
        variant === "warning" && "border-warning/30 bg-warning/5",
        variant === "info" && "border-info/30 bg-info/5",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500",
        isHovered && "opacity-100"
      )} />
      
      {/* Shimmer effect */}
      {interactive && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000",
          isHovered && "translate-x-full"
        )} />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
})
PastelCard.displayName = "PastelCard"

const PastelCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props} />
))
PastelCardHeader.displayName = "PastelCardHeader"

const PastelCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight text-card-foreground", className)}
    {...props} />
))
PastelCardTitle.displayName = "PastelCardTitle"

const PastelCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props} />
))
PastelCardDescription.displayName = "PastelCardDescription"

const PastelCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
PastelCardContent.displayName = "PastelCardContent"

const PastelCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between p-6 pt-4 border-t border-border/30", className)}
    {...props} />
))
PastelCardFooter.displayName = "PastelCardFooter"

export { 
  PastelCard, 
  PastelCardHeader, 
  PastelCardFooter, 
  PastelCardTitle, 
  PastelCardDescription, 
  PastelCardContent 
}
