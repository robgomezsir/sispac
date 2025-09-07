import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, variant = "default", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-primary/50 focus:border-primary/70 focus:shadow-lg",
        variant === "glass" && "backdrop-blur-md bg-background/80 border-border/50",
        variant === "filled" && "bg-muted border-muted hover:bg-muted/80",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
