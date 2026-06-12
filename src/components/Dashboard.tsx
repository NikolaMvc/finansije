import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { MonthProfile, Transaction } from '../types'
import { getRemaining, getSpentSoFar, getDailyBudget, getTodayBudget, getStartDailyBudget, incomeTotal, expensesTotal } from '../utils/calc'
import { useCountUp } from '../utils/useCountUp'

const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CARD = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
}
const SPRING = { type: 'spring' as const, stiffness: 380, damping: 18 }

interface Props {
  profile: MonthProfile
  onAddTx: () => void
  onDeleteTx: (id: string) => void
  onEditSalary: () => void
  onEditSavings: () => void
  onOpenMenu: () => void
  onOpenHelp: () => void
}

function fmt(n: number, decimals = 2): string {
  return Math.abs(n).toFixed(decimals)
}

function fmtDate(ds: string): string {
  const [, , d] = ds.split('-')
  const month = MON_SHORT[parseInt(ds.split('-')[1]) - 1]
  return `${parseInt(d)} ${month}`
}

export default function Dashboard({ profile, onAddTx, onDeleteTx, onEditSalary, onEditSavings, onOpenMenu, onOpenHelp }: Props) {
  const [expanded, setExpanded] = useState(false)
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
  const spentBg = net > 0 ? '#001610' : net < 0 ? '#1a0606' : '#000f1a'
  const spentColor = net > 0 ? '#42d392' : net < 0 ? '#e85c5c' : '#4db8e8'

  // Animated numbers — count up from 0 on mount, instant after
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

  return (
    <div
      className="h-dvh flex flex-col bg-[#0a0a0a] text-white overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* ── Header ── */}
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

        <span className="text-gray-500 text-sm font-medium">
          {MON_SHORT[profile.month - 1]} {profile.year}
        </span>

        <button
          onClick={() => { window.location.href = window.location.origin + window.location.pathname }}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 text-lg active:text-gray-300 transition-colors"
          aria-label="Refresh"
        >
          ↻
        </button>
      </div>

      {/* ── Top 3 cards ── */}
      <div className="flex-none px-4 pb-3 grid grid-cols-3 gap-2.5">
        {/* Remaining — Yellow */}
        <motion.div
          {...CARD}
          transition={{ duration: 0.38, delay: 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-[#1a1600] rounded-[20px] px-3 py-4 flex items-center justify-center min-h-[80px]"
        >
          <span
            className="text-[16px] font-bold leading-none tabular-nums"
            style={{ color: remaining < 0 ? '#e85c5c' : '#f0c040' }}
          >
            {remaining < 0 ? '-' : ''}€{fmt(animRemaining)}
          </span>
        </motion.div>

        {/* Savings Goal — Green */}
        <motion.button
          {...CARD}
          transition={{ default: { duration: 0.38, delay: 0.10, ease: [0.25, 0.46, 0.45, 0.94] }, scale: SPRING }}
          whileTap={{ scale: 0.93 }}
          onClick={onEditSavings}
          className="bg-[#001610] rounded-[20px] px-3 py-4 flex items-center justify-center min-h-[80px]"
        >
          {profile.savingsGoal === 0 ? (
            <span className="text-[11px] font-semibold text-[#42d392] opacity-50 text-center leading-tight">
              Add savings
            </span>
          ) : (
            <span className="text-[22px] font-bold leading-none text-[#42d392] tabular-nums">
              €{fmt(animSavings, 0)}
            </span>
          )}
        </motion.button>

        {/* Salary — Blue */}
        <motion.button
          {...CARD}
          transition={{ default: { duration: 0.38, delay: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }, scale: SPRING }}
          whileTap={{ scale: 0.93 }}
          onClick={onEditSalary}
          className="bg-[#000f1a] rounded-[20px] px-3 py-4 flex items-center justify-center min-h-[80px]"
        >
          {profile.salary === 0 ? (
            <span className="text-[11px] font-semibold text-[#4db8e8] opacity-50 text-center leading-tight">
              Add salary
            </span>
          ) : (
            <span className="text-[22px] font-bold leading-none text-[#4db8e8] tabular-nums">
              €{fmt(animSalary, 0)}
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Spent section (expands) ── */}
      <div className={`flex flex-col min-h-0 px-4 ${expanded ? 'flex-1' : 'flex-none'}`}>
        <p className="text-[10px] text-gray-700 uppercase tracking-[0.14em] font-semibold mb-2">
          Spent So Far
        </p>

        <motion.button
          {...CARD}
          transition={{ default: { duration: 0.38, delay: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }, scale: SPRING }}
          whileTap={{ scale: 0.985 }}
          onClick={() => setExpanded(e => !e)}
          className="w-full rounded-[20px] px-5 py-5 flex items-center justify-between"
          style={{ backgroundColor: spentBg }}
        >
          <span className="text-[34px] font-bold leading-none tabular-nums" style={{ color: spentColor }}>
            €{fmt(animNet)}
          </span>
          <span
            className="text-gray-600 text-lg transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          >
            ▾
          </span>
        </motion.button>

        {expanded && (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none mt-2">
            {sortedTxs.length === 0 ? (
              <p className="text-gray-700 text-sm text-center py-6">No transactions yet</p>
            ) : (
              <div>
                {sortedTxs.map(tx => (
                  <div key={tx.id} className="flex items-center py-2.5 border-b border-white/5">
                    <span
                      className={`text-sm font-semibold w-[88px] flex-shrink-0 tabular-nums ${
                        tx.type === 'expense' ? 'text-[#e85c5c]' : 'text-[#42d392]'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : '+'}€{Math.abs(tx.amount).toFixed(2)}
                    </span>
                    <span className="text-sm text-white flex-1 truncate">{tx.description}</span>
                    <span className="text-[11px] text-gray-600 flex-shrink-0 ml-2">
                      {fmtDate(tx.date)}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteTx(tx.id) }}
                      className="ml-3 text-gray-600 text-base w-5 flex-shrink-0 flex items-center justify-center active:text-red-400 transition-colors"
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

      {!expanded && <div className="flex-1" />}

      {/* ── Daily Budget + Today's Budget ── */}
      <div className="flex-none px-4 mt-3 flex gap-2.5">
        <motion.div
          {...CARD}
          transition={{ duration: 0.38, delay: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1"
        >
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.14em] font-semibold mb-2">
            Daily Budget
          </p>
          <div className="bg-[#1a1600] rounded-[20px] px-4 py-5">
            <span className="text-[22px] font-bold text-[#f0c040] leading-none tabular-nums">
              €{fmt(animDaily)}
            </span>
            <span className="text-gray-600 text-xs ml-1">/day</span>
            <p className="text-[11px] text-gray-600 opacity-50 mt-1.5 tabular-nums leading-none">
              €{fmt(animStartDaily)}/day
            </p>
          </div>
        </motion.div>

        <motion.div
          {...CARD}
          transition={{ duration: 0.38, delay: 0.34, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1"
        >
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.14em] font-semibold mb-2">
            Today's Budget
          </p>
          <div
            className="rounded-[20px] px-4 py-5"
            style={{ backgroundColor: todayBudget > 0 ? '#1a1600' : '#1a0606' }}
          >
            <span
              className="text-[22px] font-bold leading-none tabular-nums"
              style={{ color: todayBudget > 0 ? '#f0c040' : '#e85c5c' }}
            >
              €{todayBudget > 0 ? fmt(animToday) : '0.00'}
            </span>
            {todayBudget <= 0 && (
              <p className="text-[11px] text-[#e85c5c] opacity-60 mt-1.5 tabular-nums leading-none">
                -€{fmt(animToday)}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex-none h-[84px] flex items-center justify-center relative">
        <button
          onClick={onAddTx}
          className="w-[58px] h-[58px] rounded-full bg-white text-black text-[28px] font-light flex items-center justify-center active:scale-90 transition-transform leading-none"
          style={{ lineHeight: 1 }}
          aria-label="Add transaction"
        >
          +
        </button>
        <button
          onClick={onOpenHelp}
          className="absolute right-5 w-8 h-8 rounded-full text-gray-500 text-xs flex items-center justify-center active:opacity-60 transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          aria-label="Help"
        >
          ?
        </button>
      </div>
    </div>
  )
}
