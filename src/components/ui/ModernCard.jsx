import React from 'react'
import { cn } from '../../lib/utils'

export function ModernCard({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  interactive = false,
  ...props 
}) {
  const baseClasses = "clay-card"
  
  const variants = {
    default: "",
    glass: "clay-glass",
    elevated: "clay-card shadow-xl hover:shadow-2xl",
    smooth: "card-modern-smooth"
  }
  
  const interactiveClasses = interactive ? "cursor-pointer tactile-feedback" : ""
  const hoverClasses = hover ? "elevated-surface" : ""
  
  return (
    <div 
      className={cn(
        baseClasses,
        variants[variant],
        interactiveClasses,
        hoverClasses,
        "smooth-transition transform-gpu",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardHeader({ 
  children, 
  className,
  icon,
  title,
  subtitle,
  action,
  ...props 
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-6 border-b border-border/30",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  )
}

export function ModernCardContent({ 
  children, 
  className,
  ...props 
}) {
  return (
    <div 
      className={cn(
        "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModernCardFooter({ 
  children, 
  className,
  ...props 
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-6 border-t border-border/30 bg-muted/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Componente de estatística moderna
export function ModernStatCard({ 
  title,
  value,
  icon,
  trend,
  trendValue,
  className,
  ...props 
}) {
  return (
    <ModernCard 
      className={cn("group", className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' ? "text-success" : trend === 'down' ? "text-destructive" : "text-muted-foreground"
              )}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
      </div>
    </ModernCard>
  )
}

// Componente de cartão de ação rápida
export function ModernActionCard({ 
  title,
  description,
  icon,
  action,
  variant = 'default',
  className,
  ...props 
}) {
  const variants = {
    default: "hover:border-primary",
    success: "hover:border-success",
    warning: "hover:border-warning",
    info: "hover:border-info",
    destructive: "hover:border-destructive"
  }
  
  return (
    <ModernCard 
      className={cn(
        "cursor-pointer group",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="text-center">
        {icon && (
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </ModernCard>
  )
}
