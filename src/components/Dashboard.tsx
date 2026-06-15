import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { MonthProfile, Transaction } from '../types'
import { getRemaining, getDailyBudget, getTodayBudget, getStartDailyBudget, incomeTotal, expensesTotal, fixedTotal } from '../utils/calc'
import { useCountUp } from '../utils/useCountUp'
import MonthProgressCircle from './MonthProgressCircle'
import ThemeToggle from './ThemeToggle'

const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CARD = {
  initial: false as const,
  animate: { opacity: 1, y: 0 },
}
const SPRING = { type: 'spring' as const, stiffness: 380, damping: 18 }

const CS = {
  yellow: { background: 'var(--card-yellow)', boxShadow: 'var(--card-yellow-shadow)' },
  green:  { background: 'var(--card-green)',  boxShadow: 'var(--card-green-shadow)'  },
  blue:   { background: 'var(--card-blue)',   boxShadow: 'var(--card-blue-shadow)'   },
  red:    { background: 'var(--card-red)',    boxShadow: 'var(--card-red-shadow)'    },
}


interface Props {
  profile: MonthProfile
  onDeleteTx: (id: string) => void
  onEditSalary: () => void
  onEditSavings: () => void
  onOpenMenu: () => void
  onOpenHelp: () => void
  isLight: boolean
  onToggleTheme: () => void
}

function fmt(n: number, decimals = 2): string {
  return Math.abs(n).toFixed(decimals)
}

function fmtDate(ds: string): string {
  const [, , d] = ds.split('-')
  const month = MON_SHORT[parseInt(ds.split('-')[1]) - 1]
  return `${parseInt(d)} ${month}`
}

export default function Dashboard({ profile, onDeleteTx, onEditSalary, onEditSavings, onOpenMenu, onOpenHelp, isLight, onToggleTheme }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showCircleInfo, setShowCircleInfo] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const remaining = getRemaining(profile)
  const daily = getDailyBudget(profile)
  const todayBudget = getTodayBudget(profile)
  const startDaily = getStartDailyBudget(profile)
  const net = incomeTotal(profile) - expensesTotal(profile)

  const remainingCS = remaining < 0 ? CS.red : CS.yellow
  const remainingColor = remaining < 0 ? 'var(--clr-red)' : 'var(--clr-yellow)'

  const spentCS = net > 0 ? CS.green : net < 0 ? CS.red : CS.blue
  const spentColor = net > 0 ? 'var(--clr-green)' : net < 0 ? 'var(--clr-red)' : 'var(--clr-blue)'

  const todayCS = todayBudget > 0 ? CS.yellow : CS.red
  const todayColor = todayBudget > 0 ? 'var(--clr-yellow)' : 'var(--clr-red)'

  const animRemaining = useCountUp(Math.abs(remaining))
  const animSavings = useCountUp(profile.savingsGoal)
  const animSalary = useCountUp(profile.salary)
  const animNet = useCountUp(Math.abs(net))
  const animDaily = useCountUp(daily)
  const animStartDaily = useCountUp(startDaily)
  const animToday = useCountUp(Math.abs(todayBudget))

  const sortedTxs: Transaction[] = [...profile.transactions]
    .reverse()
    .sort((a, b) => b.date.localeCompare(a.date))

  // Month progress
  const daysInMonth = new Date(profile.year, profile.month, 0).getDate()
  const now = new Date()
  const isCurrentMonth = now.getFullYear() === profile.year && now.getMonth() + 1 === profile.month
  const daysPassed = isCurrentMonth ? now.getDate() : daysInMonth
  const monthProgress = daysPassed / daysInMonth

  // Spending progress: how much of total monthly budget has been spent
  const totalSpendable = Math.max(0, profile.salary - profile.savingsGoal - fixedTotal(profile))
  const netSpent = Math.max(0, expensesTotal(profile) - incomeTotal(profile))
  const spentProgress = totalSpendable > 0 ? Math.min(1, netSpent / totalSpendable) : 0

  return (
    <div
      className="relative h-full flex flex-col text-white overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: '36px' }}
    >
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-3">
        <button
          onClick={onOpenMenu}
          className="w-10 h-10 flex flex-col justify-center gap-[5px] items-start active:opacity-60"
          aria-label="Menu"
        >
          <span className="w-[22px] h-[1.5px] bg-gray-500 rounded-full block" />
          <span className="w-[22px] h-[1.5px] bg-gray-500 rounded-full block" />
          <span className="w-[15px] h-[1.5px] bg-gray-500 rounded-full block" />
        </button>

        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {MON_SHORT[profile.month - 1]} {profile.year}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHelp}
            className="w-8 h-8 rounded-full text-xs flex items-center justify-center active:opacity-60 transition-colors border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            aria-label="Help"
          >
            ?
          </button>
          <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
        </div>
      </div>

      {/* Top 3 cards */}
      <div className="flex-none px-4 pb-3 flex gap-2.5">
        {/* Remaining */}
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>Remaining</p>
          <motion.div
            {...CARD}
            transition={{ duration: 0.16, delay: 0, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-[20px] px-3 py-4 flex items-center justify-center min-h-[80px]"
            style={remainingCS}
          >
            <span
              className="text-[16px] font-bold leading-none tabular-nums"
              style={{ color: remainingColor }}
            >
              {remaining < 0 ? '-' : ''}€{fmt(animRemaining)}
            </span>
          </motion.div>
        </div>

        {/* Savings Goal */}
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>Savings</p>
          <motion.button
            {...CARD}
            transition={{ default: { duration: 0.16, delay: 0.03, ease: [0.25, 0.46, 0.45, 0.94] }, scale: SPRING }}
            whileTap={{ scale: 0.93 }}
            onClick={onEditSavings}
            className="w-full rounded-[20px] px-3 py-4 flex items-center justify-center min-h-[80px]"
            style={CS.green}
          >
            {profile.savingsGoal === 0 ? (
              <span className="text-[11px] font-semibold opacity-50 text-center leading-tight" style={{ color: 'var(--clr-green)' }}>
                Add savings
              </span>
            ) : (
              <span className="text-[22px] font-bold leading-none tabular-nums" style={{ color: 'var(--clr-green)', }}>
                €{fmt(animSavings, 0)}
              </span>
            )}
          </motion.button>
        </div>

        {/* Salary */}
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>Salary</p>
          <motion.button
            {...CARD}
            transition={{ default: { duration: 0.16, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] }, scale: SPRING }}
            whileTap={{ scale: 0.93 }}
            onClick={onEditSalary}
            className="w-full rounded-[20px] px-3 py-4 flex items-center justify-center min-h-[80px]"
            style={CS.blue}
          >
            {profile.salary === 0 ? (
              <span className="text-[11px] font-semibold opacity-50 text-center leading-tight" style={{ color: 'var(--clr-blue)' }}>
                Add salary
              </span>
            ) : (
              <span className="text-[22px] font-bold leading-none tabular-nums" style={{ color: 'var(--clr-blue)', }}>
                €{fmt(animSalary, 0)}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Spent section */}
      <div className={`flex flex-col min-h-0 px-4 ${expanded ? 'flex-1' : 'flex-none'}`}>
        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>
          Spent So Far
        </p>

        <motion.button
          {...CARD}
          transition={{ default: { duration: 0.16, delay: 0.09, ease: [0.25, 0.46, 0.45, 0.94] }, scale: SPRING }}
          whileTap={{ scale: 0.985 }}
          onClick={() => setExpanded(e => !e)}
          className="w-full rounded-[20px] px-5 py-5 flex items-center justify-between"
          style={spentCS}
        >
          <span className="text-[34px] font-bold leading-none tabular-nums" style={{ color: spentColor }}>
            €{fmt(animNet)}
          </span>
          <span
            className="text-lg transition-transform duration-200"
            style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'none' }}
          >
            ▾
          </span>
        </motion.button>

        {expanded && (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none mt-2">
            {sortedTxs.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-faint)' }}>No transactions yet</p>
            ) : (
              <div>
                {sortedTxs.map(tx => (
                  <div key={tx.id} className="flex items-center py-2.5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                    <span
                      className="text-sm font-semibold w-[88px] flex-shrink-0 tabular-nums"
                      style={{ color: tx.type === 'expense' ? 'var(--clr-red)' : 'var(--clr-green)' }}
                    >
                      {tx.type === 'expense' ? '-' : '+'}€{Math.abs(tx.amount).toFixed(2)}
                    </span>
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</span>
                    <span className="text-[11px] flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                      {fmtDate(tx.date)}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteTx(tx.id) }}
                      className="ml-3 text-base w-5 flex-shrink-0 flex items-center justify-center active:text-red-400 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="Delete"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Month progress circle */}
      {!expanded && (
        <div className="flex-1 flex items-center justify-center">
          <MonthProgressCircle
            progress={monthProgress}
            spentProgress={spentProgress}
            onClick={() => setShowCircleInfo(true)}
          />
        </div>
      )}

      {/* Daily Budget + Today's Budget */}
      <div className="flex-none px-4 mt-3 flex gap-2.5">
        <motion.div
          {...CARD}
          transition={{ duration: 0.16, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>
            Daily Budget
          </p>
          <div className="rounded-[20px] px-4 py-5" style={CS.yellow}>
            <span className="text-[22px] font-bold leading-none tabular-nums" style={{ color: 'var(--clr-yellow)', }}>
              €{fmt(animDaily)}
            </span>
            <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>/day</span>
            <p className="text-[11px] mt-1.5 tabular-nums leading-none opacity-80" style={{ color: 'var(--text-muted)' }}>
              €{fmt(animStartDaily)}/day
            </p>
          </div>
        </motion.div>

        <motion.div
          {...CARD}
          transition={{ duration: 0.16, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>
            Today's Budget
          </p>
          <div className="rounded-[20px] px-4 py-5" style={todayCS}>
            <span className="text-[22px] font-bold leading-none tabular-nums" style={{ color: todayColor }}>
              €{todayBudget > 0 ? fmt(animToday) : '0.00'}
            </span>
            <p
              className="text-[11px] mt-1.5 tabular-nums leading-none opacity-80"
              style={{ color: todayBudget < 0 ? 'var(--clr-red)' : 'var(--text-muted)' }}
            >
              {todayBudget < 0 ? '-' : ''}€{fmt(animToday)}
            </p>
          </div>
        </motion.div>
      </div>


      {/* Circle info tooltip */}
      {showCircleInfo && (
        <>
          <div className="absolute inset-0 z-40" onClick={() => setShowCircleInfo(false)} />
          <div
            className="absolute bottom-28 left-4 right-4 z-50 rounded-2xl p-4 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#3b82f6' }} />
                <span className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  Blue ring — days passed this month ({daysPassed} of {daysInMonth})
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#ef4444' }} />
                <span className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  Red ring — money spent vs. what you're allowed to spend by today to hit your savings goal
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: '#10b981' }} />
                <span className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  Green fill — fills from bottom up as the month progresses
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
