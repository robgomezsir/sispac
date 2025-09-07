import * as React from "react"
import { cn } from "@/lib/utils"

const PastelSeparator = React.forwardRef(({ 
  className, 
  orientation = "horizontal", 
  variant = "default",
  animated = false,
  ...props 
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [animated])

  return (
    <div
      ref={ref}
      className={cn(
        "relative transition-all duration-500 ease-out",
        orientation === "horizontal" ? "w-full h-px" : "h-full w-px",
        animated && !isVisible && (orientation === "horizontal" ? "scale-x-0" : "scale-y-0"),
        animated && isVisible && (orientation === "horizontal" ? "scale-x-100" : "scale-y-100"),
        className
      )}
      {...props}
    >
      {/* Gradient line */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent",
        orientation === "vertical" && "bg-gradient-to-b from-transparent via-border to-transparent",
        variant === "primary" && "via-primary/30",
        variant === "success" && "via-success/30",
        variant === "warning" && "via-warning/30",
        variant === "info" && "via-info/30",
        variant === "accent" && "via-accent/30"
      )} />
      
      {/* Shimmer effect */}
      {animated && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
          orientation === "vertical" && "bg-gradient-to-b from-transparent via-white/20 to-transparent",
          "animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        )} />
      )}
    </div>
  )
})
PastelSeparator.displayName = "PastelSeparator"

export { PastelSeparator }
