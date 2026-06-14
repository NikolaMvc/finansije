import { motion } from 'framer-motion'

type Tab = 'history' | 'dashboard' | 'statistics'

interface Props {
  active: Tab
  onHistory: () => void
  onCenter: () => void
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

function Indicator() {
  return (
    <motion.span
      layoutId="navIndicator"
      className="absolute rounded-full"
      style={{ bottom: 5, width: 18, height: 3.5, background: 'var(--clr-green)' }}
      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
    />
  )
}

export default function BottomNav({ active, onHistory, onCenter, onStatistics }: Props) {
  return (
    <motion.div
      className="relative flex-none px-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="relative" style={{ height: 60 }}>
        {/* Glass pill with border — no dark shadow halo around it */}
        <div
          className="absolute left-0 right-0 bottom-0 rounded-[26px] flex items-stretch"
          style={{
            height: 60,
            background: 'var(--nav-bg)',
            border: '1px solid var(--nav-border)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
          }}
        >
          {/* History */}
          <button
            onClick={onHistory}
            className="relative flex flex-col items-center justify-end gap-[5px] flex-1 pb-2 active:opacity-70 transition-colors"
            style={{ color: active === 'history' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <span className="flex items-center justify-center" style={{ height: 22 }}><CalendarIcon /></span>
            <span className={`text-[10px] tracking-wide ${active === 'history' ? 'font-bold' : 'font-medium'}`}>History</span>
            {active === 'history' && <Indicator />}
          </button>

          {/* Dashboard (center) */}
          <button
            onClick={onCenter}
            className="relative flex flex-col items-center justify-end gap-[5px] flex-1 pb-2 transition-colors"
            style={{ color: active === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <span style={{ height: 22 }} />
            <span className={`text-[10px] tracking-wide ${active === 'dashboard' ? 'font-bold' : 'font-medium'}`}>Dashboard</span>
            {active === 'dashboard' && <Indicator />}
          </button>

          {/* Statistics */}
          <button
            onClick={onStatistics}
            className="relative flex flex-col items-center justify-end gap-[5px] flex-1 pb-2 active:opacity-70 transition-colors"
            style={{ color: active === 'statistics' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <span className="flex items-center justify-center" style={{ height: 22 }}><BarsIcon /></span>
            <span className={`text-[10px] tracking-wide ${active === 'statistics' ? 'font-bold' : 'font-medium'}`}>Statistics</span>
            {active === 'statistics' && <Indicator />}
          </button>
        </div>

        {/* Elevated blue + button over the center */}
        <motion.button
          onClick={onCenter}
          aria-label={active === 'dashboard' ? 'Add transaction' : 'Go to dashboard'}
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: 54, height: 54, top: -20, left: '50%', x: '-50%',
            background: 'linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: '0 6px 18px rgba(59,130,246,0.45)',
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="6" y1="12" x2="18" y2="12" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}
