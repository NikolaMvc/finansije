import { useState, useEffect, useRef } from 'react'
import type { MonthProfile, Transaction } from '../types'
import { getRemaining, getSpentSoFar, fixedTotal } from '../utils/calc'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'

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

  const keyboardOffset = useKeyboardOffset()

  const containerRef = useRef<HTMLDivElement>(null)
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const lastMoveX = useRef(0)
  const isDragging = useRef(false)

  function handleTouchStart(e: React.TouchEvent) {
    e.stopPropagation()
    if (addingTx) return
    swipeStartX.current = e.touches[0].clientX
    swipeStartY.current = e.touches[0].clientY
    lastMoveX.current = e.touches[0].clientX
    isDragging.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.stopPropagation()
    if (addingTx) return
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

    lastMoveX.current = x
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
    const movingLeft = finalX < lastMoveX.current
    const finalDx = finalX - swipeStartX.current
    const offset = Math.max(0, finalDx)
    const threshold = window.innerWidth * 0.10

    const shouldClose = !movingLeft && offset > threshold

    if (shouldClose) {
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

  useEffect(() => {
    if (!isOpen) {
      setSelectedDay(null)
      setAddingTx(false)
      setAddAmount('')
      setAddDesc('')
    }
  }, [isOpen])

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

  function closeAddForm() {
    setAddingTx(false)
    setAddAmount('')
    setAddDesc('')
  }

  function submitAdd() {
    if (!selectedDay) return
    const amount = parseFloat(addAmount)
    if (!amount || amount <= 0) { closeAddForm(); return }
    onAddTxToMonth(key, {
      amount: addType === 'expense' ? -amount : amount,
      description: addDesc.trim() || (addType === 'expense' ? 'Expense' : 'Income'),
      date: dateStr(selectedDay),
      type: addType,
    })
    closeAddForm()
  }

  function handleAddFormKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submitAdd()
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
      ref={containerRef}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden animate-slide-in-right"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        background: 'var(--bg-gradient)',
        backgroundColor: 'var(--bg-solid)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
        <button onClick={onClose} className="text-sm flex items-center gap-1 active:opacity-60" style={{ color: 'var(--text-secondary)' }}>
          <span>←</span>
          <span>Back</span>
        </button>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>History</span>
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

      {/* Summary bar */}
      {hasData && (
        <div className="flex-none px-4 pb-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl px-2 py-2 text-center" style={{ background: 'var(--card-red)', boxShadow: 'var(--card-red-shadow)' }}>
            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Spent</div>
            <div className="text-sm font-bold" style={{ color: 'var(--clr-red)' }}>
              €{(getSpentSoFar(profile!) + fixedTotal(profile!)).toFixed(0)}
            </div>
          </div>
          <div className="rounded-2xl px-2 py-2 text-center" style={{ background: 'var(--card-blue)', boxShadow: 'var(--card-blue-shadow)' }}>
            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Salary</div>
            <div className="text-sm font-bold" style={{ color: 'var(--clr-blue)' }}>
              €{profile!.salary.toFixed(0)}
            </div>
          </div>
          <div
            className="rounded-2xl px-2 py-2 text-center"
            style={goalMet
              ? { background: 'var(--card-green)', boxShadow: 'var(--card-green-shadow)' }
              : { background: 'var(--card-red)', boxShadow: 'var(--card-red-shadow)' }
            }
          >
            <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Saved</div>
            <div className="text-sm font-bold leading-tight" style={goalMet ? { color: 'var(--clr-green)' } : { color: 'var(--clr-red)' }}>
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
            ? { background: 'var(--cal-neutral-bg)' }
            : net >= 0
              ? { background: 'var(--card-green)' }
              : { background: 'var(--card-red)' }

          const dayColor = net === null ? 'var(--cal-neutral-text)' : net >= 0 ? 'var(--clr-green)' : 'var(--clr-red)'

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
        <div
          className="flex-1 min-h-0 overflow-y-auto scrollbar-none mt-3 px-5"
          onClick={() => setSelectedDay(null)}
        >
          <div className="flex items-center justify-between mb-2" onClick={e => e.stopPropagation()}>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
              {selectedDay} {MON_SHORT[viewMonth - 1]}
            </p>
            {profile && (
              <button
                onClick={() => setAddingTx(true)}
                className="w-6 h-6 rounded-full bg-white/10 text-gray-400 text-[14px] flex items-center justify-center active:bg-white/20"
                style={{ lineHeight: 1 }}
              >
                +
              </button>
            )}
          </div>

          {selTxs.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-faint)' }}>No transactions</p>
          )}
          {selTxs.length > 0 && (
            <div className="space-y-px mb-3" onClick={e => e.stopPropagation()}>
              {selTxs.map(tx => (
                <div key={tx.id} className="flex items-center py-2.5 border-b border-white/5">
                  <span
                    className="text-sm font-semibold w-20 flex-shrink-0"
                    style={{ color: tx.type === 'expense' ? 'var(--clr-red)' : 'var(--clr-green)' }}
                  >
                    {tx.type === 'expense' ? '-' : '+'}€{Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{tx.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDay && <div className="flex-1" />}

      {/* Add form — floating bottom sheet above keyboard */}
      {addingTx && (
        <>
          <div className="absolute inset-0 z-50 bg-black/60 animate-fade-in" onClick={closeAddForm} />
          <div
            className="absolute left-0 right-0 z-50 rounded-t-[28px] animate-slide-up overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'var(--surface)',
              bottom: keyboardOffset,
              paddingBottom: keyboardOffset > 0 ? '8px' : 'calc(env(safe-area-inset-bottom) + 8px)',
              maxHeight: `calc(100vh - ${keyboardOffset}px - 40px)`,
            }}
          >
            <div className="flex justify-center pt-3 pb-2 flex-none">
              <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--surface-handle)' }} />
            </div>

            <div className="px-5 pb-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setAddType('expense')}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={addType === 'expense'
                    ? { background: 'var(--card-red)', color: 'var(--clr-red)' }
                    : { backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }
                  }
                >
                  Expense
                </button>
                <button
                  onClick={() => setAddType('income')}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={addType === 'income'
                    ? { background: 'var(--card-green)', color: 'var(--clr-green)' }
                    : { backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }
                  }
                >
                  Income
                </button>
              </div>

              <div className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ backgroundColor: 'var(--surface-input)' }}>
                <span className="text-base font-medium" style={{ color: addType === 'expense' ? 'var(--clr-red)' : 'var(--clr-green)' }}>€</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-500"
                  style={{ color: 'var(--text-primary)' }}
                  autoFocus
                  onKeyDown={handleAddFormKey}
                />
              </div>

              <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'var(--surface-input)' }}>
                <input
                  type="text"
                  value={addDesc}
                  onChange={e => setAddDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full bg-transparent text-base outline-none placeholder:text-gray-500"
                  style={{ color: 'var(--text-primary)' }}
                  onKeyDown={handleAddFormKey}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={closeAddForm}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-medium active:opacity-60"
                  style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitAdd}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-semibold active:opacity-70 transition-opacity"
                  style={addType === 'expense'
                    ? { background: 'var(--card-red)', color: 'var(--clr-red)' }
                    : { background: 'var(--card-green)', color: 'var(--clr-green)' }
                  }
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
