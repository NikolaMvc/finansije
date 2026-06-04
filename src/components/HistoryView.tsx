import { useState } from 'react'
import type { MonthProfile, Transaction } from '../types'
import { getRemaining, getSpentSoFar, incomeTotal, fixedTotal } from '../utils/calc'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  isOpen: boolean
  months: Record<string, MonthProfile>
  onClose: () => void
}

export default function HistoryView({ isOpen, months, onClose }: Props) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const key = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const profile = months[key] ?? null

  function dayNet(day: number): number | null {
    if (!profile) return null
    const ds = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const txs = profile.transactions.filter(t => t.date === ds)
    if (txs.length === 0) return null
    return txs.reduce((s, t) => s + t.amount, 0)
  }

  function dayTxs(day: number): Transaction[] {
    if (!profile) return []
    const ds = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return profile.transactions.filter(t => t.date === ds)
  }

  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
  }

  if (!isOpen) return null

  const selTxs = selectedDay ? dayTxs(selectedDay) : []

  const achieved = profile ? getRemaining(profile) >= 0 : null

  return (
    <div
      className="absolute inset-0 z-40 bg-[#0a0a0a] flex flex-col overflow-hidden animate-slide-in-right"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
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
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 text-lg active:bg-white/10"
        >
          ‹
        </button>
        <span className="text-white font-semibold text-base">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 text-lg active:bg-white/10"
        >
          ›
        </button>
      </div>

      {/* Summary bar */}
      {profile && (
        <div className="flex-none px-4 pb-3 grid grid-cols-3 gap-2">
          <div className="bg-[#1c0808] rounded-2xl px-2 py-2 text-center">
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Spent</div>
            <div className="text-sm font-bold text-[#e85c5c]">€{(getSpentSoFar(profile) + fixedTotal(profile)).toFixed(0)}</div>
          </div>
          <div className="bg-[#001610] rounded-2xl px-2 py-2 text-center">
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Earned</div>
            <div className="text-sm font-bold text-[#42d392]">€{incomeTotal(profile).toFixed(0)}</div>
          </div>
          <div className={`rounded-2xl px-2 py-2 text-center ${achieved ? 'bg-[#001610]' : 'bg-[#1c0808]'}`}>
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Goal</div>
            <div className={`text-sm font-bold ${achieved ? 'text-[#42d392]' : 'text-[#e85c5c]'}`}>
              {achieved ? '✓ Met' : '✗ Missed'}
            </div>
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
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const net = dayNet(day)
          const isSel = selectedDay === day
          const isToday =
            now.getDate() === day &&
            now.getMonth() + 1 === viewMonth &&
            now.getFullYear() === viewYear

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSel ? null : day)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                transition-all
                ${isSel ? 'ring-1 ring-white/40 scale-95' : ''}
                ${net === null
                  ? 'bg-white/5 text-gray-700'
                  : net >= 0
                    ? 'bg-[#001610] text-[#42d392]'
                    : 'bg-[#1c0808] text-[#e85c5c]'
                }
              `}
            >
              <span className={`text-[11px] font-semibold ${isToday ? 'text-white' : ''}`}>
                {day}
              </span>
              {net !== null && (
                <span className="text-[8px] opacity-70 leading-tight">
                  {net >= 0 ? '+' : ''}{net.toFixed(0)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day transactions */}
      {selectedDay && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none mt-3 px-5">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 font-semibold">
            {selectedDay} {MON_SHORT[viewMonth - 1]}
          </p>
          {selTxs.length === 0 ? (
            <p className="text-gray-700 text-sm text-center py-4">No transactions</p>
          ) : (
            <div className="space-y-px">
              {selTxs.map(tx => (
                <div key={tx.id} className="flex items-center py-2.5 border-b border-white/5">
                  <span
                    className={`text-sm font-semibold w-20 flex-shrink-0 ${
                      tx.type === 'expense' ? 'text-[#e85c5c]' : 'text-[#42d392]'
                    }`}
                  >
                    {tx.type === 'expense' ? '-' : '+'}€{Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className="text-sm text-white flex-1">{tx.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDay && <div className="flex-1" />}
    </div>
  )
}
