import * as React from "react"
import { cn } from "@/lib/utils"

const PastelArea = React.forwardRef(({ 
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
        "relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out",
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
        variant === "muted" && "bg-muted/50 border-muted/60",
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
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  )
})
PastelArea.displayName = "PastelArea"

const PastelAreaHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mb-4", className)}
    {...props} />
))
PastelAreaHeader.displayName = "PastelAreaHeader"

const PastelAreaTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-card-foreground", className)}
    {...props} />
))
PastelAreaTitle.displayName = "PastelAreaTitle"

const PastelAreaContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props} />
))
PastelAreaContent.displayName = "PastelAreaContent"

const PastelAreaFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between pt-4 border-t border-border/30", className)}
    {...props} />
))
PastelAreaFooter.displayName = "PastelAreaFooter"

export { 
  PastelArea, 
  PastelAreaHeader, 
  PastelAreaTitle, 
  PastelAreaContent, 
  PastelAreaFooter 
}
