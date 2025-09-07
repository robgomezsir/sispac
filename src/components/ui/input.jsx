import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, variant = "default", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-primary/50 focus:border-primary/70 focus:shadow-lg hover:-translate-y-0.5 focus:-translate-y-1 focus:scale-102",
        variant === "glass" && "backdrop-blur-md bg-background/80 border-border/50 hover:bg-background/90",
        variant === "filled" && "bg-muted border-muted hover:bg-muted/80 focus:bg-background",
        variant === "pastel" && "bg-gradient-to-r from-background/90 to-background/70 border-border/40 hover:from-background/95 hover:to-background/80",
        variant === "modern" && "bg-card/95 backdrop-blur-sm border-border/50 hover:shadow-lg focus:shadow-xl",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
