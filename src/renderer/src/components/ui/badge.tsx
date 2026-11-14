import * as React from "react"
import { cn } from "../../utils/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive/10 text-destructive border border-destructive/20",
    outline: "border border-border text-foreground hover:bg-muted",
    success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400",
    info: "bg-sky-500/10 text-sky-600 border border-sky-500/20 dark:text-sky-400",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
