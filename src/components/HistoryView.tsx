import { useState } from 'react'
import type { MonthProfile, Transaction } from '../types'
import { getRemaining, getSpentSoFar, fixedTotal } from '../utils/calc'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  isOpen: boolean
  months: Record<string, MonthProfile>
  onAddTxToMonth: (monthKey: string, tx: Omit<Transaction, 'id'>) => void
  onClose: () => void
}

export default function HistoryView({ isOpen, months, onAddTxToMonth, onClose }: Props) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const [addingTx, setAddingTx] = useState(false)
  const [addType, setAddType] = useState<'expense' | 'income'>('expense')
  const [addAmount, setAddAmount] = useState('')
  const [addDesc, setAddDesc] = useState('')

  const key = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const profile = months[key] ?? null

  const sortedKeys = Object.keys(months).sort()
  const earliestKey = sortedKeys[0] ?? key
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const canGoPrev = key > earliestKey
  const canGoNext = key < todayKey

  function dayNet(day: number): number | null {
    if (!profile) return null
    const ds = dateStr(day)
    const txs = profile.transactions.filter(t => t.date === ds)
    if (txs.length === 0) return null
    return txs.reduce((s, t) => s + t.amount, 0)
  }

  function dayTxs(day: number): Transaction[] {
    if (!profile) return []
    return profile.transactions.filter(t => t.date === dateStr(day))
  }

  function dateStr(day: number): string {
    return `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function selectDay(day: number) {
    setSelectedDay(d => d === day ? null : day)
    setAddingTx(false)
    setAddAmount('')
    setAddDesc('')
  }

  function submitAdd() {
    if (!selectedDay) return
    const amount = parseFloat(addAmount)
    if (!amount || amount <= 0) return
    onAddTxToMonth(key, {
      amount: addType === 'expense' ? -amount : amount,
      description: addDesc.trim() || (addType === 'expense' ? 'Expense' : 'Income'),
      date: dateStr(selectedDay),
      type: addType,
    })
    setAddAmount('')
    setAddDesc('')
    setAddingTx(false)
  }

  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()

  function prevMonth() {
    if (!canGoPrev) return
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
    setAddingTx(false)
  }

  function nextMonth() {
    if (!canGoNext) return
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
    setAddingTx(false)
  }

  if (!isOpen) return null

  const selTxs = selectedDay ? dayTxs(selectedDay) : []

  const hasData = profile && profile.salary > 0
  const remaining = hasData ? getRemaining(profile) : 0
  const goalMet = hasData ? remaining >= 0 : null
  const actualSaved = hasData
    ? (remaining >= 0 ? profile.savingsGoal : Math.max(0, profile.savingsGoal + remaining))
    : 0

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col overflow-hidden animate-slide-in-right"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #0d1520 0%, #0a0a0a 55%, #080808 100%)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-3 border-b border-white/5">
        <button onClick={onClose} className="text-gray-500 text-sm flex items-center gap-1 active:text-gray-300">
          <span>←</span>
          <span>Back</span>
        </button>
        <span className="text-white text-sm font-semibold">History</span>
        <div className="w-16" />
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
        <span className="text-white font-semibold text-base">
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

      {/* Summary bar */}
      {hasData && (
        <div className="flex-none px-4 pb-3 grid grid-cols-3 gap-2">
          {/* Spent */}
          <div
            className="rounded-2xl px-2 py-2 text-center"
            style={{ background: 'linear-gradient(150deg, #1e0808, #2c0e0e)', boxShadow: '0 0 18px rgba(248,113,113,0.1)' }}
          >
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Spent</div>
            <div className="text-sm font-bold" style={{ color: '#f87171', textShadow: '0 0 12px rgba(248,113,113,0.6)' }}>
              €{(getSpentSoFar(profile!) + fixedTotal(profile!)).toFixed(0)}
            </div>
          </div>

          {/* Salary */}
          <div
            className="rounded-2xl px-2 py-2 text-center"
            style={{ background: 'linear-gradient(150deg, #001020, #001a35)', boxShadow: '0 0 18px rgba(56,189,248,0.1)' }}
          >
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Salary</div>
            <div className="text-sm font-bold" style={{ color: '#38bdf8', textShadow: '0 0 12px rgba(56,189,248,0.6)' }}>
              €{profile!.salary.toFixed(0)}
            </div>
          </div>

          {/* Saved */}
          <div
            className="rounded-2xl px-2 py-2 text-center"
            style={goalMet
              ? { background: 'linear-gradient(150deg, #001a12, #002b1d)', boxShadow: '0 0 18px rgba(52,211,153,0.1)' }
              : { background: 'linear-gradient(150deg, #1e0808, #2c0e0e)', boxShadow: '0 0 18px rgba(248,113,113,0.1)' }
            }
          >
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Saved</div>
            <div
              className="text-sm font-bold leading-tight"
              style={goalMet
                ? { color: '#34d399', textShadow: '0 0 12px rgba(52,211,153,0.6)' }
                : { color: '#f87171', textShadow: '0 0 12px rgba(248,113,113,0.6)' }
              }
            >
              €{actualSaved.toFixed(0)}
            </div>
            {!goalMet && profile!.savingsGoal > 0 && (
              <div className="text-[9px] text-gray-600 mt-0.5 leading-tight">
                goal: €{profile!.savingsGoal.toFixed(0)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day-of-week header */}
      <div className="flex-none grid grid-cols-7 px-3 pb-1">
        {DAY_ABBR.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-700 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-none grid grid-cols-7 gap-1 px-3">
        {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const net = dayNet(day)
          const isSel = selectedDay === day
          const isToday = now.getDate() === day && now.getMonth() + 1 === viewMonth && now.getFullYear() === viewYear

          const dayStyle = net === null
            ? { backgroundColor: 'rgba(255,255,255,0.05)' }
            : net >= 0
              ? { background: 'linear-gradient(150deg, #001a12, #002b1d)' }
              : { background: 'linear-gradient(150deg, #1e0808, #2c0e0e)' }

          const dayColor = net === null ? '#374151' : net >= 0 ? '#34d399' : '#f87171'

          return (
            <button
              key={day}
              onClick={() => selectDay(day)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${isSel ? 'ring-1 ring-white/40 scale-95' : ''}`}
              style={dayStyle}
            >
              <span className="text-[11px] font-semibold" style={{ color: isToday ? '#ffffff' : dayColor }}>{day}</span>
              {net !== null && (
                <span className="text-[8px] opacity-70 leading-tight" style={{ color: dayColor }}>
                  {net >= 0 ? '+' : ''}{net.toFixed(0)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none mt-3 px-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
              {selectedDay} {MON_SHORT[viewMonth - 1]}
            </p>
            {profile && !addingTx && (
              <button
                onClick={() => setAddingTx(true)}
                className="w-6 h-6 rounded-full bg-white/10 text-gray-400 text-[14px] flex items-center justify-center active:bg-white/20"
                style={{ lineHeight: 1 }}
              >
                +
              </button>
            )}
          </div>

          {selTxs.length === 0 && !addingTx && (
            <p className="text-gray-700 text-sm text-center py-4">No transactions</p>
          )}
          {selTxs.length > 0 && (
            <div className="space-y-px mb-3">
              {selTxs.map(tx => (
                <div key={tx.id} className="flex items-center py-2.5 border-b border-white/5">
                  <span
                    className="text-sm font-semibold w-20 flex-shrink-0"
                    style={{ color: tx.type === 'expense' ? '#f87171' : '#34d399' }}
                  >
                    {tx.type === 'expense' ? '-' : '+'}€{Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className="text-sm text-white flex-1">{tx.description}</span>
                </div>
              ))}
            </div>
          )}

          {addingTx && (
            <div className="bg-[#111] rounded-2xl p-4 mt-2 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setAddType('expense')}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={addType === 'expense'
                    ? { background: 'linear-gradient(150deg,#1e0808,#2c0e0e)', color: '#f87171' }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#4b5563' }
                  }
                >
                  Expense
                </button>
                <button
                  onClick={() => setAddType('income')}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={addType === 'income'
                    ? { background: 'linear-gradient(150deg,#001a12,#002b1d)', color: '#34d399' }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#4b5563' }
                  }
                >
                  Income
                </button>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl px-3 py-2.5 flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: addType === 'expense' ? '#f87171' : '#34d399' }}>€</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-700"
                  autoFocus
                />
              </div>

              <div className="bg-[#1a1a1a] rounded-xl px-3 py-2.5">
                <input
                  type="text"
                  value={addDesc}
                  onChange={e => setAddDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-700"
                  onKeyDown={e => e.key === 'Enter' && submitAdd()}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setAddingTx(false); setAddAmount(''); setAddDesc('') }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-500 text-sm font-medium active:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAdd}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold active:opacity-70"
                  style={addType === 'expense'
                    ? { background: 'linear-gradient(150deg,#1e0808,#2c0e0e)', color: '#f87171' }
                    : { background: 'linear-gradient(150deg,#001a12,#002b1d)', color: '#34d399' }
                  }
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedDay && <div className="flex-1" />}
    </div>
  )
}
