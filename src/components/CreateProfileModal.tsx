import { useState, useEffect } from 'react'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'

interface Props {
  isOpen: boolean
  onConfirm: (name: string) => void
  onClose: () => void
}

export default function CreateProfileModal({ isOpen, onConfirm, onClose }: Props) {
  const [name, setName] = useState('')
  const keyboardOffset = useKeyboardOffset()

  useEffect(() => {
    if (isOpen) setName('')
  }, [isOpen])

  if (!isOpen) return null

  function handleConfirm() {
    onConfirm(name.trim() || 'Profile')
    setName('')
  }

  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/70 animate-fade-in" onClick={onClose} />
      <div
        className="absolute left-0 right-0 z-50 bg-[#111] rounded-t-[28px] animate-slide-up"
        style={{
          bottom: keyboardOffset,
          paddingBottom: keyboardOffset > 0 ? '8px' : 'calc(env(safe-area-inset-bottom) + 8px)',
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 bg-white/15 rounded-full" />
        </div>

        <div className="px-5 pb-4 space-y-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.12em] font-semibold">
            Profile Name
          </p>

          <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3.5">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Raiffeisen"
              className="w-full bg-transparent text-white text-lg outline-none placeholder:text-gray-700"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
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
              onClick={handleConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-[#001610] text-[#42d392] font-semibold text-sm active:opacity-70"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
