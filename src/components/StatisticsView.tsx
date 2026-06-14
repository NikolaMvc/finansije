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
      className="relative h-full flex flex-col overflow-hidden"
      style={{
        background: 'var(--bg-gradient)',
        backgroundColor: 'var(--bg-solid)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 84px)',
      }}
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
