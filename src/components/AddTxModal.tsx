import { useState } from 'react'
import type { Transaction } from '../types'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'

interface Props {
  isOpen: boolean
  onAdd: (tx: Omit<Transaction, 'id'>) => void
  onClose: () => void
}

export default function AddTxModal({ isOpen, onAdd, onClose }: Props) {
  const [expAmt, setExpAmt] = useState('')
  const keyboardOffset = useKeyboardOffset()
  const [expDesc, setExpDesc] = useState('')
  const [incAmt, setIncAmt] = useState('')
  const [incDesc, setIncDesc] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function addExpense() {
    const amount = parseFloat(expAmt)
    if (!amount || amount <= 0) return
    onAdd({ amount: -amount, description: expDesc.trim() || 'Expense', date: today, type: 'expense' })
    setExpAmt('')
    setExpDesc('')
  }

  function addIncome() {
    const amount = parseFloat(incAmt)
    if (!amount || amount <= 0) return
    onAdd({ amount, description: incDesc.trim() || 'Income', date: today, type: 'income' })
    setIncAmt('')
    setIncDesc('')
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="absolute inset-0 z-40 bg-black/70 animate-fade-in"
        onClick={onClose}
      />
      <div
        className="absolute left-0 right-0 z-50 bg-[#111] rounded-t-[28px] animate-slide-up overflow-hidden flex flex-col"
        style={{
          bottom: keyboardOffset,
          paddingBottom: keyboardOffset > 0 ? '8px' : 'calc(env(safe-area-inset-bottom) + 8px)',
          maxHeight: `calc(100vh - ${keyboardOffset}px - 40px)`,
        }}
      >
        <div className="flex justify-center pt-3 pb-2 flex-none">
          <div className="w-9 h-1 bg-white/15 rounded-full" />
        </div>

        <div className="px-5 pb-2 space-y-5">
          {/* Expense */}
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.12em] font-semibold mb-3">
              Spent
            </p>
            <div className="space-y-2">
              <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3 flex items-center gap-2">
                <span className="text-[#e85c5c] text-base font-medium">€</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={expAmt}
                  onChange={e => setExpAmt(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-gray-700"
                  autoFocus
                />
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                <input
                  type="text"
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full bg-transparent text-white text-base outline-none placeholder:text-gray-700"
                  onKeyDown={e => e.key === 'Enter' && addExpense()}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-500 text-sm font-medium active:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={addExpense}
                  className="flex-1 py-3.5 rounded-2xl bg-[#1c0808] text-[#e85c5c] font-semibold text-sm tracking-wide active:opacity-70 transition-opacity"
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Income */}
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.12em] font-semibold mb-3">
              Earned
            </p>
            <div className="space-y-2">
              <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3 flex items-center gap-2">
                <span className="text-[#42d392] text-base font-medium">€</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={incAmt}
                  onChange={e => setIncAmt(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-gray-700"
                />
              </div>
              <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                <input
                  type="text"
                  value={incDesc}
                  onChange={e => setIncDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full bg-transparent text-white text-base outline-none placeholder:text-gray-700"
                  onKeyDown={e => e.key === 'Enter' && addIncome()}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-500 text-sm font-medium active:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={addIncome}
                  className="flex-1 py-3.5 rounded-2xl bg-[#001610] text-[#42d392] font-semibold text-sm tracking-wide active:opacity-70 transition-opacity"
                >
                  Add Income
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
