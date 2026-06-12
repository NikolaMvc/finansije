import { useState, useEffect } from 'react'
import type { FixedExpense } from '../types'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'

interface Row { amount: string; description: string }

interface Props {
  isOpen: boolean
  currentSalary: number
  currentFixed: FixedExpense[]
  onSave: (salary: number, fixed: FixedExpense[]) => void
  onClose: () => void
}

export default function EditSalaryModal({ isOpen, currentSalary, currentFixed, onSave, onClose }: Props) {
  const [salary, setSalary] = useState('')
  const [rows, setRows] = useState<Row[]>([{ amount: '', description: '' }])
  const keyboardOffset = useKeyboardOffset()

  useEffect(() => {
    if (isOpen) {
      setSalary(currentSalary > 0 ? String(currentSalary) : '')
      setRows(
        currentFixed.length > 0
          ? currentFixed.map(fe => ({ amount: String(fe.amount), description: fe.description }))
          : [{ amount: '', description: '' }]
      )
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    const sal = parseFloat(salary) || 0
    const fixed: FixedExpense[] = rows
      .filter(r => parseFloat(r.amount) > 0)
      .map((r, i) => ({
        id: `fe-${i}-${Date.now()}`,
        amount: parseFloat(r.amount),
        description: r.description.trim() || 'Fixed expense',
      }))
    onSave(sal, fixed)
  }

  function updateRow(i: number, field: keyof Row, val: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  if (!isOpen) return null

  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/60 animate-fade-in" onClick={onClose} />
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

        <div className="px-5 pb-4 space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Monthly Salary
            </p>
            <div className="rounded-2xl px-4 py-3.5 flex items-center gap-2" style={{ backgroundColor: 'var(--surface-input)' }}>
              <span className="font-medium" style={{ color: 'var(--clr-blue)' }}>€</span>
              <input
                type="number"
                inputMode="decimal"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-500"
                style={{ color: 'var(--text-primary)' }}
                autoFocus
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Fixed Expenses
            </p>
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="rounded-xl px-3 py-2.5 flex items-center gap-1 w-28 flex-shrink-0" style={{ backgroundColor: 'var(--surface-input)' }}>
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
                  <div className="rounded-xl px-3 py-2.5 flex-1" style={{ backgroundColor: 'var(--surface-input)' }}>
                    <input
                      type="text"
                      value={row.description}
                      onChange={e => updateRow(i, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                  {rows.length > 1 && (
                    <button
                      onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-xl w-7 flex-shrink-0 flex items-center justify-center active:opacity-60"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setRows(prev => [...prev, { amount: '', description: '' }])}
                className="flex items-center gap-1.5 text-sm py-1 active:opacity-60"
                style={{ color: 'var(--clr-blue)' }}
              >
                <span className="text-lg leading-none">+</span>
                <span>Add row</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide active:opacity-70"
            style={{ background: 'var(--card-blue)', color: 'var(--clr-blue)' }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
