import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  onHistory: () => void
  onAdd: () => void
  onStatistics: () => void
}

function CalendarIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15.5" rx="4" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="6.2" />
      <line x1="16" y1="3" x2="16" y2="6.2" />
    </svg>
  )
}

function BarsIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3.8" y="13" width="3.6" height="7.5" rx="1.6" />
      <rect x="10.2" y="7.5" width="3.6" height="13" rx="1.6" />
      <rect x="16.6" y="10.5" width="3.6" height="10" rx="1.6" />
    </svg>
  )
}

function NavItem({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-end gap-[5px] flex-1 h-full pb-2 active:opacity-50 transition-opacity"
      style={{ color: 'var(--text-secondary)' }}
    >
      <span className="flex items-center justify-center" style={{ height: 24 }}>{children}</span>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  )
}

export default function BottomNav({ onHistory, onAdd, onStatistics }: Props) {
  return (
    <motion.div
      className="flex-none relative"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="relative mx-4" style={{ height: 78 }}>
        {/* Pill bar */}
        <div
          className="absolute left-0 right-0 bottom-0 rounded-[26px] flex items-stretch px-3"
          style={{
            height: 62,
            background: 'var(--nav-bg)',
            border: '1px solid var(--nav-border)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
          }}
        >
          <NavItem label="History" onClick={onHistory}><CalendarIcon /></NavItem>

          {/* Center column — reserves space, holds the label */}
          <div className="flex flex-col items-center justify-end gap-[5px] flex-1 h-full pb-2">
            <span style={{ height: 24 }} />
            <span className="text-[10px] font-semibold tracking-wide" style={{ color: 'var(--clr-blue)' }}>
              Dashboard
            </span>
          </div>

          <NavItem label="Statistics" onClick={onStatistics}><BarsIcon /></NavItem>
        </div>

        {/* Pulsing glow ring behind center button */}
        <motion.span
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 56, height: 56, top: -8, left: '50%', x: '-50%',
            background: '#3b82f6',
          }}
          initial={{ opacity: 0.35, scale: 1 }}
          animate={{ opacity: 0, scale: 1.55 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />

        {/* Center elevated add button */}
        <motion.button
          onClick={onAdd}
          aria-label="Add transaction"
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: 56, height: 56, top: -8, left: '50%', x: '-50%',
            background: 'linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: '0 6px 20px rgba(59,130,246,0.5), 0 0 0 5px rgba(59,130,246,0.12)',
          }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="6" y1="12" x2="18" y2="12" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}
