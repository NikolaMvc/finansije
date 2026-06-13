import { useState } from 'react'
import type { Profile } from '../types'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'
import ThemeToggle from './ThemeToggle'

interface Props {
  profiles: Record<string, Profile>
  onSelect: (profileId: string) => void
  onCreateNew: () => void
  onRename: (profileId: string, newName: string) => void
  onDelete: (profileId: string) => void
  isLight: boolean
  onToggleTheme: () => void
}

type ConfirmDelete = { profileId: string; step: 1 | 2 } | null

export default function ChooseProfileScreen({ profiles, onSelect, onCreateNew, onRename, onDelete, isLight, onToggleTheme }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>(null)
  const keyboardOffset = useKeyboardOffset()

  const profileList = Object.values(profiles)

  function startEdit(profile: Profile, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingId(profile.id)
    setEditName(profile.name)
    setConfirmDelete(null)
  }

  function saveEdit(profileId: string) {
    if (editName.trim()) onRename(profileId, editName.trim())
    setEditingId(null)
  }

  function startDelete(profileId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingId(null)
    setConfirmDelete({ profileId, step: 1 })
  }

  function confirmStep1() {
    if (!confirmDelete) return
    setConfirmDelete({ profileId: confirmDelete.profileId, step: 2 })
  }

  function confirmStep2() {
    if (!confirmDelete) return
    onDelete(confirmDelete.profileId)
    setConfirmDelete(null)
  }

  const deletingProfile = confirmDelete ? profiles[confirmDelete.profileId] : null

  return (
    <div
      className="h-dvh flex flex-col relative"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex-none px-5 pt-4 pb-8">
        <div className="flex justify-end mb-6">
          <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
        </div>
        <h1 className="text-[34px] font-bold tracking-tight leading-none mb-2" style={{ color: 'var(--text-primary)' }}>
          Finansije
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose a profile</p>
      </div>

      <div className="flex-1 px-4 space-y-2.5 overflow-y-auto scrollbar-none">
        {profileList.map(profile => (
          <div key={profile.id} className="flex items-center gap-2">
            {editingId === profile.id ? (
              <div className="flex-1 flex gap-2">
                <div
                  className="flex-1 rounded-2xl px-4 py-4 flex items-center border"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 bg-transparent text-base outline-none"
                    style={{ color: 'var(--text-primary)' }}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit(profile.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                </div>
                <button
                  onClick={() => saveEdit(profile.id)}
                  className="px-4 rounded-2xl text-sm font-semibold active:opacity-70"
                  style={{ background: 'var(--card-green)', color: 'var(--clr-green)' }}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelect(profile.id)}
                  className="flex-1 rounded-2xl px-4 py-4 text-left flex items-center justify-between active:opacity-70 transition-opacity border"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--surface-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <span className="font-medium text-base" style={{ color: 'var(--text-primary)' }}>{profile.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </button>
                <button
                  onClick={e => startEdit(profile, e)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl text-sm active:opacity-60 transition-opacity border"
                  style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--surface-border)', color: 'var(--text-secondary)' }}
                  aria-label="Rename"
                >
                  ✎
                </button>
                <button
                  onClick={e => startDelete(profile.id, e)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl text-sm active:opacity-60 transition-opacity"
                  style={{ background: 'var(--card-red)', color: 'var(--clr-red)' }}
                  aria-label="Delete"
                >
                  🗑
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div
        className="flex-none px-4 pt-4"
        style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 8}px` : 'calc(env(safe-area-inset-bottom) + 20px)' }}
      >
        <button
          onClick={onCreateNew}
          className="w-full py-4 rounded-[20px] font-bold text-base tracking-wide active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--clr-green)', color: 'var(--clr-green-btn-text)', boxShadow: '0 0 28px rgba(52,211,153,0.25)' }}
        >
          + Create new profile
        </button>
      </div>

      {confirmDelete && deletingProfile && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full rounded-[28px] p-6 space-y-5 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
            onClick={e => e.stopPropagation()}
          >
            {confirmDelete.step === 1 ? (
              <>
                <div>
                  <p className="font-bold text-lg mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Delete &ldquo;{deletingProfile.name}&rdquo;?
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    All data for this profile will be permanently removed.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium active:opacity-60"
                    style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStep1}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold active:opacity-70"
                    style={{ background: 'var(--card-red)', color: 'var(--clr-red)', boxShadow: '0 0 18px rgba(248,113,113,0.1)' }}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="font-bold text-lg mb-1.5" style={{ color: 'var(--text-primary)' }}>Are you absolutely sure?</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    This cannot be undone. All months and transactions will be lost.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium active:opacity-60"
                    style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                  >
                    No, keep it
                  </button>
                  <button
                    onClick={confirmStep2}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold active:opacity-70"
                    style={{ background: 'var(--card-red)', color: 'var(--clr-red)', boxShadow: '0 0 22px rgba(248,113,113,0.15)' }}
                  >
                    Yes, delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
