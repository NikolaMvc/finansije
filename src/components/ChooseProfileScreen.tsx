import { useState } from 'react'
import type { Profile } from '../types'
import { useKeyboardOffset } from '../utils/useKeyboardOffset'

interface Props {
  profiles: Record<string, Profile>
  onSelect: (profileId: string) => void
  onCreateNew: () => void
  onRename: (profileId: string, newName: string) => void
}

export default function ChooseProfileScreen({ profiles, onSelect, onCreateNew, onRename }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const keyboardOffset = useKeyboardOffset()

  const profileList = Object.values(profiles)

  function startEdit(profile: Profile, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingId(profile.id)
    setEditName(profile.name)
  }

  function saveEdit(profileId: string) {
    if (editName.trim()) onRename(profileId, editName.trim())
    setEditingId(null)
  }

  return (
    <div
      className="h-dvh flex flex-col text-white"
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
                <div className="flex-1 bg-[#111] rounded-2xl px-4 py-4 flex items-center">
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
                  className="flex-1 bg-[#111] rounded-2xl px-4 py-4 text-left flex items-center justify-between active:opacity-70 transition-opacity"
                >
                  <span className="text-white font-medium text-base">{profile.name}</span>
                  <span className="text-gray-700 text-xs">›</span>
                </button>
                <button
                  onClick={e => startEdit(profile, e)}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl bg-white/5 text-gray-600 text-sm active:bg-white/10"
                  aria-label="Rename"
                >
                  ✎
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
    </div>
  )
}
