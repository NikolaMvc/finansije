import { useRef } from 'react'
import type { MonthProfile, Transaction } from '../types'
import { expensesTotal, incomeTotal, getRemaining, fixedTotal } from '../utils/calc'

const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  isOpen: boolean
  profile: MonthProfile | null
  onClose: () => void
}

function fmt(n: number, d = 2): string {
  return Math.abs(n).toFixed(d)
}

function fmtDate(ds: string): string {
  const parts = ds.split('-')
  return `${parseInt(parts[2])} ${MON_SHORT[parseInt(parts[1]) - 1]}`
}

export default function StatisticsView({ isOpen, profile, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const peakX = useRef(0)
  const velocityTrackX = useRef(0)
  const velocityTrackTime = useRef(0)
  const isDragging = useRef(false)

  function handleTouchStart(e: React.TouchEvent) {
    e.stopPropagation()
    swipeStartX.current = e.touches[0].clientX
    swipeStartY.current = e.touches[0].clientY
    peakX.current = e.touches[0].clientX
    velocityTrackX.current = e.touches[0].clientX
    velocityTrackTime.current = Date.now()
    isDragging.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.stopPropagation()
    const x = e.touches[0].clientX
    const dx = x - swipeStartX.current
    const dy = e.touches[0].clientY - swipeStartY.current
    if (!isDragging.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      if (Math.abs(dy) >= Math.abs(dx)) return
      if (dx <= 0) return
      isDragging.current = true
      if (containerRef.current) containerRef.current.style.animation = 'none'
    }
    if (x > peakX.current) peakX.current = x
    const now = Date.now()
    if (now - velocityTrackTime.current > 40) {
      velocityTrackX.current = x
      velocityTrackTime.current = now
    }
    const offset = Math.max(0, dx)
    if (containerRef.current) {
      containerRef.current.style.transition = 'none'
      containerRef.current.style.transform = `translateX(${offset}px)`
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!isDragging.current) return
    isDragging.current = false
    e.stopPropagation()
    const finalX = e.changedTouches[0].clientX
    const now = Date.now()
    const elapsed = now - velocityTrackTime.current
    const velocity = elapsed > 0 && elapsed < 200 ? (finalX - velocityTrackX.current) / elapsed : 0
    const retreated = (peakX.current - finalX) > 25 || velocity < -0.3
    const offset = Math.max(0, finalX - swipeStartX.current)
    const threshold = window.innerWidth * 0.10
    if (!retreated && offset > threshold) {
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)'
        containerRef.current.style.transform = 'translateX(100%)'
      }
      setTimeout(onClose, 280)
    } else {
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        containerRef.current.style.transform = 'translateX(0)'
      }
    }
  }

  if (!isOpen || !profile) return null

  const income = incomeTotal(profile)
  const expenses = expensesTotal(profile)
  const net = income - expenses
  const remaining = getRemaining(profile)

  const expenseTxs = profile.transactions.filter(t => t.type === 'expense')
  const txCount = profile.transactions.length
  const avgExpense = expenseTxs.length > 0 ? expenses / expenseTxs.length : 0
  const topExpenses: Transaction[] = [...expenseTxs]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)

  const spendable = Math.max(0, profile.salary - profile.savingsGoal - fixedTotal(profile))
  const spentPct = spendable > 0 ? Math.min(100, Math.round((expenses / spendable) * 100)) : 0

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden animate-slide-in-right"
      style={{
        background: 'var(--bg-gradient)',
        backgroundColor: 'var(--bg-solid)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
        <button onClick={onClose} className="text-sm active:opacity-60 transition-opacity flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
          ‹ Back
        </button>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {MON_SHORT[profile.month - 1]} {profile.year}
        </span>
        <span className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-5 space-y-6">
        <h1 className="text-[28px] font-bold tracking-tight px-1" style={{ color: 'var(--text-primary)' }}>Statistics</h1>

        {/* Overview grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Income" value={`€${fmt(income)}`} color="var(--clr-green)" cardBg="var(--card-green)" />
          <StatCard label="Expenses" value={`€${fmt(expenses)}`} color="var(--clr-red)" cardBg="var(--card-red)" />
          <StatCard label="Net" value={`${net < 0 ? '-' : ''}€${fmt(net)}`} color={net < 0 ? 'var(--clr-red)' : 'var(--clr-green)'} cardBg={net < 0 ? 'var(--card-red)' : 'var(--card-green)'} />
          <StatCard label="Remaining" value={`${remaining < 0 ? '-' : ''}€${fmt(remaining)}`} color={remaining < 0 ? 'var(--clr-red)' : 'var(--clr-yellow)'} cardBg={remaining < 0 ? 'var(--card-red)' : 'var(--card-yellow)'} />
        </div>

        {/* Budget used bar */}
        <div className="rounded-[20px] px-4 py-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--text-faint)' }}>Budget used</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: spentPct >= 100 ? 'var(--clr-red)' : 'var(--text-primary)' }}>{spentPct}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-hover)' }}>
            <div className="h-full rounded-full" style={{ width: `${spentPct}%`, backgroundColor: spentPct >= 100 ? 'var(--clr-red)' : 'var(--clr-blue)' }} />
          </div>
        </div>

        {/* Activity rows */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold px-1 mb-1" style={{ color: 'var(--text-faint)' }}>Activity</p>
          <ActivityRow label="Transactions" value={String(txCount)} />
          <ActivityRow label="Average expense" value={`€${fmt(avgExpense)}`} />
          <ActivityRow label="Largest expense" value={topExpenses.length > 0 ? `€${fmt(topExpenses[0].amount)}` : '—'} />
        </div>

        {/* Top expenses */}
        {topExpenses.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.14em] font-semibold px-1 mb-1" style={{ color: 'var(--text-faint)' }}>Largest expenses</p>
            <div className="rounded-[20px] px-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
              {topExpenses.map((tx, i) => (
                <div key={tx.id} className={`flex items-center py-3 ${i < topExpenses.length - 1 ? 'border-b' : ''}`} style={{ borderColor: 'var(--surface-border)' }}>
                  <span className="text-sm font-semibold w-[84px] flex-shrink-0 tabular-nums" style={{ color: 'var(--clr-red)' }}>
                    -€{fmt(tx.amount)}
                  </span>
                  <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</span>
                  <span className="text-[11px] flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>{fmtDate(tx.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}

function StatCard({ label, value, color, cardBg }: { label: string; value: string; color: string; cardBg: string }) {
  return (
    <div className="rounded-[20px] px-4 py-4" style={{ background: cardBg }}>
      <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>{label}</p>
      <span className="text-[20px] font-bold leading-none tabular-nums" style={{ color }}>{value}</span>
    </div>
  )
}

function ActivityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl px-4 py-3.5 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
