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
    <>
      <div className="absolute inset-0 z-40 bg-black/70 animate-fade-in" onClick={onClose} />
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
    </>
  )
}
