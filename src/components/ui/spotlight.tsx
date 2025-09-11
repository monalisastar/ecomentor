'use client'

import { cn } from '../../../lib/utils'


export function Spotlight({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'pointer-events-none absolute z-10 rounded-full blur-3xl opacity-20 bg-green-500',
        className
      )}
    />
  )
}

