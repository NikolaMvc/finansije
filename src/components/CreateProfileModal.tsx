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
    // Dismiss the keyboard before swapping modals — prevents an iOS focus-transition freeze
    ;(document.activeElement as HTMLElement | null)?.blur()
    onConfirm(name.trim() || 'Profile')
    setName('')
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center px-6"
      style={{ paddingBottom: keyboardOffset > 0 ? keyboardOffset + 10 : 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-[28px] overflow-hidden animate-pop"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="px-5 pt-5 pb-5 space-y-4">
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Profile Name
          </p>

          <div className="rounded-2xl px-4 py-3.5" style={{ backgroundColor: 'var(--surface-input)' }}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Raiffeisen"
              className="w-full bg-transparent text-lg outline-none placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
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
              onClick={handleConfirm}
              className="flex-1 py-3.5 rounded-2xl text-sm font-semibold active:opacity-70"
              style={{ background: 'var(--card-green)', color: 'var(--clr-green)' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
