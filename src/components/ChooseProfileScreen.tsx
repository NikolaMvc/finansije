import { useState } from 'react'
import type { Profile } from '../types'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'

interface Props {
  profiles: Record<string, Profile>
  onSelect: (profileId: string) => void
  onCreateNew: () => void
  onRename: (profileId: string, newName: string) => void
  onDelete: (profileId: string) => void
}

type ConfirmDelete = { profileId: string; step: 1 | 2 } | null

export default function ChooseProfileScreen({ profiles, onSelect, onCreateNew, onRename, onDelete }: Props) {
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
      className="h-dvh flex flex-col text-white relative"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex-none px-5 pt-12 pb-8">
        <h1 className="text-[34px] font-bold text-white tracking-tight leading-none mb-2">
          Finansije
        </h1>
        <p className="text-gray-600 text-sm">Choose a profile</p>
      </div>

      {/* Profile list */}
      <div className="flex-1 px-4 space-y-2.5 overflow-y-auto scrollbar-none">
        {profileList.map(profile => (
          <div key={profile.id} className="flex items-center gap-2">
            {editingId === profile.id ? (
              <div className="flex-1 flex gap-2">
                <div
                  className="flex-1 rounded-2xl px-4 py-4 flex items-center"
                  style={{
                    background: 'linear-gradient(150deg, #141820 0%, #1a1a1a 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 bg-transparent text-white text-base outline-none"
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
                  style={{ background: 'linear-gradient(150deg,#001a12,#002b1d)', color: '#34d399' }}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelect(profile.id)}
                  className="flex-1 rounded-2xl px-4 py-4 text-left flex items-center justify-between active:opacity-70 transition-opacity"
                  style={{
                    background: 'linear-gradient(150deg, #141820 0%, #181818 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <span className="text-white font-medium text-base">{profile.name}</span>
                  <span className="text-gray-600 text-sm">›</span>
                </button>
                <button
                  onClick={e => startEdit(profile, e)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl text-gray-500 text-sm active:opacity-60 transition-opacity"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                  aria-label="Rename"
                >
                  ✎
                </button>
                <button
                  onClick={e => startDelete(profile.id, e)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl text-gray-500 text-sm active:opacity-60 transition-opacity"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.12)' }}
                  aria-label="Delete"
                >
                  🗑
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Create new profile button */}
      <div
        className="flex-none px-4 pt-4"
        style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 8}px` : 'calc(env(safe-area-inset-bottom) + 20px)' }}
      >
        <button
          onClick={onCreateNew}
          className="w-full py-4 rounded-[20px] text-black font-bold text-base tracking-wide active:opacity-80 transition-opacity"
          style={{ backgroundColor: '#34d399', boxShadow: '0 0 28px rgba(52,211,153,0.3)' }}
        >
          + Create new profile
        </button>
      </div>

      {/* Delete confirmation overlay */}
      {confirmDelete && deletingProfile && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full rounded-[28px] p-6 space-y-5"
            style={{ background: 'linear-gradient(150deg, #1a1a1a, #141414)', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            {confirmDelete.step === 1 ? (
              <>
                <div>
                  <p className="text-white font-bold text-lg mb-1.5">
                    Delete &ldquo;{deletingProfile.name}&rdquo;?
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    All data for this profile will be permanently removed.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 rounded-2xl text-gray-400 text-sm font-medium active:opacity-60"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStep1}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold active:opacity-70"
                    style={{ background: 'linear-gradient(150deg,#1e0808,#2c0e0e)', color: '#f87171', boxShadow: '0 0 18px rgba(248,113,113,0.15)' }}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-white font-bold text-lg mb-1.5">Are you absolutely sure?</p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    This cannot be undone. All months and transactions will be lost.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 rounded-2xl text-gray-400 text-sm font-medium active:opacity-60"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    No, keep it
                  </button>
                  <button
                    onClick={confirmStep2}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold active:opacity-70"
                    style={{ background: 'linear-gradient(150deg,#2c0808,#3d0e0e)', color: '#f87171', boxShadow: '0 0 22px rgba(248,113,113,0.2)' }}
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
