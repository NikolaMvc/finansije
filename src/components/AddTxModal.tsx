import { useState } from 'react'
import type { Transaction } from '../types'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'

interface Props {
  isOpen: boolean
  onAdd: (tx: Omit<Transaction, 'id'>) => void
  onClose: () => void
}

export default function AddTxModal({ isOpen, onAdd, onClose }: Props) {
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const keyboardOffset = useKeyboardOffset()

  function submit() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    const today = new Date().toISOString().split('T')[0]
    onAdd({
      amount: type === 'expense' ? -amt : amt,
      description: desc.trim() || (type === 'expense' ? 'Expense' : 'Income'),
      date: today,
      type,
    })
    setAmount('')
    setDesc('')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/70 animate-fade-in" onClick={onClose} />
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
              onClick={() => setType('expense')}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
              style={type === 'expense'
                ? { background: 'var(--card-red)', color: 'var(--clr-red)' }
                : { backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }
              }
            >
              Expense
            </button>
            <button
              onClick={() => setType('income')}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
              style={type === 'income'
                ? { background: 'var(--card-green)', color: 'var(--clr-green)' }
                : { backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }
              }
            >
              Income
            </button>
          </div>

          <div className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ backgroundColor: 'var(--surface-input)' }}>
            <span className="text-base font-medium" style={{ color: type === 'expense' ? 'var(--clr-red)' : 'var(--clr-green)' }}>€</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
              autoFocus
            />
          </div>

          <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'var(--surface-input)' }}>
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description"
              className="w-full bg-transparent text-base outline-none placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl text-sm font-medium active:opacity-60"
              style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="flex-1 py-3.5 rounded-2xl text-sm font-semibold active:opacity-70 transition-opacity"
              style={type === 'expense'
                ? { background: 'var(--card-red)', color: 'var(--clr-red)' }
                : { background: 'var(--card-green)', color: 'var(--clr-green)' }
              }
            >
              {type === 'expense' ? 'Add Expense' : 'Add Income'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
