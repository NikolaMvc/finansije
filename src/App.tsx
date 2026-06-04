import { useState, useEffect, useCallback } from 'react'

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
import type { AppData, MonthProfile, Transaction } from './types'
import { loadData, saveData } from './utils/storage'
import Dashboard from './components/Dashboard'
import SetupModal from './components/SetupModal'
import AddTxModal from './components/AddTxModal'
import HistoryView from './components/HistoryView'
import HelpPanel from './components/HelpPanel'

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [showSetup, setShowSetup] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const activeProfile =
    data.activeMonthKey && data.months[data.activeMonthKey]
      ? data.months[data.activeMonthKey]
      : null

  const update = useCallback((next: AppData) => {
    setData(next)
    saveData(next)
  }, [])

  // Re-render at midnight so daily budget recalculates
  useEffect(() => {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const ms = tomorrow.getTime() - now.getTime()
    const id = setTimeout(() => setData(d => ({ ...d })), ms)
    return () => clearTimeout(id)
  }, [])

  function handleSaveProfile(profile: MonthProfile) {
    const existing = data.months[profile.key]
    const finalProfile: MonthProfile = {
      ...profile,
      transactions: existing?.transactions ?? [],
    }
    update({
      months: { ...data.months, [profile.key]: finalProfile },
      activeMonthKey: profile.key,
    })
    setShowSetup(false)
  }

  function handleAddTx(tx: Omit<Transaction, 'id'>) {
    if (!activeProfile) return
    const newTx: Transaction = { ...tx, id: genId() }
    const updated: MonthProfile = {
      ...activeProfile,
      transactions: [...activeProfile.transactions, newTx],
    }
    update({
      ...data,
      months: { ...data.months, [activeProfile.key]: updated },
    })
    setShowAddTx(false)
  }

  function handleDeleteTx(id: string) {
    if (!activeProfile) return
    const updated: MonthProfile = {
      ...activeProfile,
      transactions: activeProfile.transactions.filter(t => t.id !== id),
    }
    update({
      ...data,
      months: { ...data.months, [activeProfile.key]: updated },
    })
  }

  return (
    <div className="h-dvh w-full bg-[#0a0a0a] overflow-hidden relative">

      {/* ── Base screen ── */}
      {!activeProfile ? (
        <WelcomeScreen onStart={() => setShowSetup(true)} />
      ) : (
        <Dashboard
          profile={activeProfile}
          onAddTx={() => setShowAddTx(true)}
          onDeleteTx={handleDeleteTx}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenHelp={() => setShowHelp(true)}
        />
      )}

      {/* ── Slide-out menu ── */}
      {menuOpen && (
        <div
          className="absolute inset-0 z-30 animate-fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-60 bg-[#0f0f0f] pt-safe"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 pt-14 pb-6 space-y-1">
              <MenuRow
                label="History"
                onClick={() => { setShowHistory(true); setMenuOpen(false) }}
              />
              <MenuRow
                label="New Month"
                onClick={() => { setShowSetup(true); setMenuOpen(false) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <SetupModal
        isOpen={showSetup}
        existingKeys={Object.keys(data.months)}
        existingTransactions={key => data.months[key]?.transactions ?? []}
        onSave={handleSaveProfile}
        onClose={() => setShowSetup(false)}
      />

      <AddTxModal
        isOpen={showAddTx}
        onAdd={handleAddTx}
        onClose={() => setShowAddTx(false)}
      />

      <HistoryView
        isOpen={showHistory}
        months={data.months}
        onClose={() => setShowHistory(false)}
      />

      <HelpPanel
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  )
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="h-dvh flex flex-col items-center justify-center px-8 bg-[#0a0a0a]"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="text-center mb-10">
        <h1 className="text-[38px] font-bold text-white tracking-tight leading-none mb-3">
          Finansije
        </h1>
        <p className="text-gray-600 text-sm">Track spending. Hit your savings goal.</p>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 rounded-[20px] bg-[#42d392] text-black font-bold text-base tracking-wide active:opacity-80 transition-opacity"
      >
        START SAVING
      </button>
    </div>
  )
}

function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left py-3.5 px-4 rounded-2xl text-white text-sm font-medium active:bg-white/5 transition-colors"
    >
      {label}
    </button>
  )
}
