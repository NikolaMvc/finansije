import { useState, useEffect } from 'react'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'

interface Props {
  isOpen: boolean
  currentGoal: number
  onSave: (goal: number) => void
  onClose: () => void
}

export default function EditSavingsModal({ isOpen, currentGoal, onSave, onClose }: Props) {
  const [goal, setGoal] = useState('')
  const keyboardOffset = useKeyboardOffset()

  useEffect(() => {
    if (isOpen) setGoal(currentGoal > 0 ? String(currentGoal) : '')
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/60 animate-fade-in" onClick={onClose} />
      <div
        className="absolute left-0 right-0 z-50 rounded-t-[28px] animate-slide-up"
        style={{
          backgroundColor: 'var(--surface)',
          bottom: keyboardOffset,
          paddingBottom: keyboardOffset > 0 ? '8px' : 'calc(env(safe-area-inset-bottom) + 8px)',
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--surface-handle)' }} />
        </div>

        <div className="px-5 pb-4 space-y-4">
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Savings Goal
          </p>

          <div className="rounded-2xl px-4 py-3.5 flex items-center gap-2" style={{ backgroundColor: 'var(--surface-input)' }}>
            <span className="font-medium" style={{ color: 'var(--clr-green)' }}>€</span>
            <input
              type="number"
              inputMode="decimal"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && onSave(parseFloat(goal) || 0)}
            />
          </div>

          <button
            onClick={() => onSave(parseFloat(goal) || 0)}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide active:opacity-70"
            style={{ background: 'var(--card-green)', color: 'var(--clr-green)' }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
