import { useState, useEffect } from 'react'

interface Props {
  isOpen: boolean
  currentGoal: number
  onSave: (goal: number) => void
  onClose: () => void
}

export default function EditSavingsModal({ isOpen, currentGoal, onSave, onClose }: Props) {
  const [goal, setGoal] = useState('')

  useEffect(() => {
    if (isOpen) setGoal(currentGoal > 0 ? String(currentGoal) : '')
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

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

        <div className="px-5 pb-4 space-y-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.12em] font-semibold">Savings Goal</p>

          <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3.5 flex items-center gap-2">
            <span className="text-[#42d392] font-medium">€</span>
            <input
              type="number"
              inputMode="decimal"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-gray-700"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && onSave(parseFloat(goal) || 0)}
            />
          </div>

          <button
            onClick={() => onSave(parseFloat(goal) || 0)}
            className="w-full py-3.5 rounded-2xl bg-[#001610] text-[#42d392] font-semibold text-sm tracking-wide active:opacity-70"
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
