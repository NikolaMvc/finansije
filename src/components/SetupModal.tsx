import { useState } from 'react'
import type { MonthProfile, Transaction } from '../types'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface FixedRow {
  amount: string
  description: string
}

interface Props {
  isOpen: boolean
  year: number
  month: number
  existingTransactions: Transaction[]
  onSave: (profile: MonthProfile) => void
  onClose: () => void
}

export default function SetupModal({ isOpen, year, month, existingTransactions, onSave, onClose }: Props) {
  const [salary, setSalary] = useState('')
  const [savingsGoal, setSavingsGoal] = useState('')
  const [fixedRows, setFixedRows] = useState<FixedRow[]>([
    { amount: '', description: '' },
  ])

  function handleSave() {
    const key = `${year}-${String(month).padStart(2, '0')}`
    const profile: MonthProfile = {
      key,
      year,
      month,
      salary: parseFloat(salary) || 0,
      savingsGoal: parseFloat(savingsGoal) || 0,
      fixedExpenses: fixedRows
        .filter(r => parseFloat(r.amount) > 0)
        .map((r, i) => ({
          id: `fe-${i}-${Date.now()}`,
          amount: parseFloat(r.amount),
          description: r.description.trim() || 'Fixed expense',
        })),
      transactions: existingTransactions,
    }
    onSave(profile)
  }

  function updateRow(i: number, field: keyof FixedRow, val: string) {
    setFixedRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  function removeRow(i: number) {
    setFixedRows(prev => prev.filter((_, idx) => idx !== i))
  }

  if (!isOpen) return null

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col overflow-hidden animate-slide-in-right"
      style={{
        background: 'var(--bg-gradient)',
        backgroundColor: 'var(--bg-solid)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex-none flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
        <button
          onClick={onClose}
          className="text-sm active:opacity-60 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          onClick={handleSave}
          className="text-sm font-semibold active:opacity-60 transition-opacity"
          style={{ color: 'var(--clr-green)' }}
        >
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-5 space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Monthly Salary
          </p>
          <div className="rounded-2xl px-4 py-3.5 flex items-center gap-2" style={{ backgroundColor: 'var(--surface)' }}>
            <span className="font-medium" style={{ color: 'var(--clr-blue)' }}>€</span>
            <input
              type="number"
              inputMode="decimal"
              value={salary}
              onChange={e => setSalary(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Savings Goal
          </p>
          <div className="rounded-2xl px-4 py-3.5 flex items-center gap-2" style={{ backgroundColor: 'var(--surface)' }}>
            <span className="font-medium" style={{ color: 'var(--clr-green)' }}>€</span>
            <input
              type="number"
              inputMode="decimal"
              value={savingsGoal}
              onChange={e => setSavingsGoal(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Fixed Expenses
          </p>
          <div className="space-y-2">
            {fixedRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="rounded-2xl px-3 py-3 flex items-center gap-1 w-28 flex-shrink-0" style={{ backgroundColor: 'var(--surface)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>€</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={row.amount}
                    onChange={e => updateRow(i, 'amount', e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="rounded-2xl px-3 py-3 flex-1" style={{ backgroundColor: 'var(--surface)' }}>
                  <input
                    type="text"
                    value={row.description}
                    onChange={e => updateRow(i, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
                {fixedRows.length > 1 && (
                  <button
                    onClick={() => removeRow(i)}
                    className="text-xl w-7 flex-shrink-0 flex items-center justify-center active:opacity-60"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setFixedRows(prev => [...prev, { amount: '', description: '' }])}
              className="flex items-center gap-1.5 text-sm py-1 active:opacity-60"
              style={{ color: 'var(--clr-green)' }}
            >
              <span className="text-lg leading-none">+</span>
              <span>Add row</span>
            </button>
          </div>
        </div>

        <div className="h-2" />

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl text-black font-bold text-base tracking-wide active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--clr-green)' }}
        >
          START SAVING
        </button>

        <div className="h-4" />
      </div>
    </div>
  )
}
