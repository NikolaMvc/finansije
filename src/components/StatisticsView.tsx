import { useState } from 'react'
import type { MonthProfile, Transaction } from '../types'
import { expensesTotal, incomeTotal, getRemaining, fixedTotal } from '../utils/calc'
import ThemeToggle from './ThemeToggle'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  isOpen: boolean
  months: Record<string, MonthProfile>
  isLight: boolean
  onToggleTheme: () => void
}

function fmt(n: number, d = 2): string {
  return Math.abs(n).toFixed(d)
}

function fmtDate(ds: string): string {
  const parts = ds.split('-')
  return `${parseInt(parts[2])} ${MON_SHORT[parseInt(parts[1]) - 1]}`
}

export default function StatisticsView({ isOpen, months, isLight, onToggleTheme }: Props) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  const key = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const profile = months[key] ?? null

  const sortedKeys = Object.keys(months).sort()
  const earliestKey = sortedKeys[0] ?? key
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const canGoPrev = key > earliestKey
  const canGoNext = key < todayKey

  function prevMonth() {
    if (!canGoPrev) return
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (!canGoNext) return
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  if (!isOpen) return null

  const income = profile ? incomeTotal(profile) : 0
  const expenses = profile ? expensesTotal(profile) : 0
  const net = income - expenses
  const remaining = profile ? getRemaining(profile) : 0

  const expenseTxs = profile ? profile.transactions.filter(t => t.type === 'expense') : []
  const txCount = profile ? profile.transactions.length : 0
  const avgExpense = expenseTxs.length > 0 ? expenses / expenseTxs.length : 0
  const topExpenses: Transaction[] = [...expenseTxs]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)

  const spendable = profile ? Math.max(0, profile.salary - profile.savingsGoal - fixedTotal(profile)) : 0
  const spentPct = spendable > 0 ? Math.min(100, Math.round((expenses / spendable) * 100)) : 0

  return (
    <div
      className="relative h-full flex flex-col overflow-hidden"
      style={{
        background: 'var(--bg-gradient)',
        backgroundColor: 'var(--bg-solid)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 50px)',
      }}
    >
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
        <div style={{ width: 66 }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Statistics</span>
        <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
      </div>

      {/* Month nav */}
      <div className="flex-none flex items-center justify-between px-5 py-3">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className={`w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 text-lg transition-opacity ${canGoPrev ? 'active:bg-white/10' : 'opacity-20'}`}
        >
          ‹
        </button>
        <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className={`w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 text-lg transition-opacity ${canGoNext ? 'active:bg-white/10' : 'opacity-20'}`}
        >
          ›
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4 space-y-6">
        {!profile ? (
          <p className="text-sm text-center py-16" style={{ color: 'var(--text-faint)' }}>No data for this month</p>
        ) : (
          <>
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
          </>
        )}
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
