import * as React from 'react'
import { cn } from '../../utils/cn'
import { X } from 'lucide-react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md'
}: DialogProps) {
  if (!open) return null

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
    '3xl': 'max-w-4xl',
    '4xl': 'max-w-5xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={cn(
          'w-full bg-background border border-border rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col',
          widths[maxWidth]
        )}
      >
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground leading-none">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  )
}
