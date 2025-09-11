'use client'

import { cn } from '../../../lib/utils'

import { motion } from 'framer-motion'

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  animate = true,
}: {
  className?: string
  children?: React.ReactNode
  showRadialGradient?: boolean
  animate?: boolean
}) {
  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      {children}
      {showRadialGradient && (
        <div
          className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(white,transparent_80%)]"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 via-green-400/10 to-transparent" />
        </div>
      )}
      {animate && (
        <motion.div
          className="absolute -top-40 left-1/2 z-0 h-[800px] w-[800px] rounded-full bg-green-500/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

