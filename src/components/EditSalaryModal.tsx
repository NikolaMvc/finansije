import { useState, useEffect } from 'react'
import type { FixedExpense } from '../types'

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
        className="absolute bottom-0 left-0 right-0 z-50 bg-[#111] rounded-t-[28px] animate-slide-up"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 bg-white/15 rounded-full" />
        </div>

        <div className="px-5 pb-4 space-y-5">
          {/* Salary */}
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.12em] font-semibold mb-2">Monthly Salary</p>
            <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3.5 flex items-center gap-2">
              <span className="text-[#4db8e8] font-medium">€</span>
              <input
                type="number"
                inputMode="decimal"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-gray-700"
                autoFocus
              />
            </div>
          </div>

          {/* Fixed Expenses */}
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.12em] font-semibold mb-2">Fixed Expenses</p>
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="bg-[#1a1a1a] rounded-xl px-3 py-2.5 flex items-center gap-1 w-28 flex-shrink-0">
                    <span className="text-gray-600 text-sm">€</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={row.amount}
                      onChange={e => updateRow(i, 'amount', e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-700"
                    />
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl px-3 py-2.5 flex-1">
                    <input
                      type="text"
                      value={row.description}
                      onChange={e => updateRow(i, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-700"
                    />
                  </div>
                  {rows.length > 1 && (
                    <button
                      onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-700 text-xl w-7 flex-shrink-0 flex items-center justify-center active:text-gray-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setRows(prev => [...prev, { amount: '', description: '' }])}
                className="flex items-center gap-1.5 text-[#4db8e8] text-sm py-1 active:opacity-60"
              >
                <span className="text-lg leading-none">+</span>
                <span>Add row</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-[#000f1a] text-[#4db8e8] font-semibold text-sm tracking-wide active:opacity-70"
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
