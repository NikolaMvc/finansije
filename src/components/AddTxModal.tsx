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

        <div className="px-5 pb-4 space-y-3">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${type === 'expense' ? 'bg-[#1c0808] text-[#e85c5c]' : 'bg-white/5 text-gray-600'}`}
            >
              Expense
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${type === 'income' ? 'bg-[#001610] text-[#42d392]' : 'bg-white/5 text-gray-600'}`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className={`text-base font-medium ${type === 'expense' ? 'text-[#e85c5c]' : 'text-[#42d392]'}`}>€</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-gray-700"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description"
              className="w-full bg-transparent text-white text-base outline-none placeholder:text-gray-700"
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-500 text-sm font-medium active:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold active:opacity-70 transition-opacity ${type === 'expense' ? 'bg-[#1c0808] text-[#e85c5c]' : 'bg-[#001610] text-[#42d392]'}`}
            >
              {type === 'expense' ? 'Add Expense' : 'Add Income'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
