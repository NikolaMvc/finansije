import { useState, useEffect, useCallback } from 'react'
import type { AppData, MonthProfile, Transaction, FixedExpense } from './types'
import { loadData, saveData } from './utils/storage'
import Dashboard from './components/Dashboard'
import SetupModal from './components/SetupModal'
import AddTxModal from './components/AddTxModal'
import HistoryView from './components/HistoryView'
import HelpPanel from './components/HelpPanel'
import EditSalaryModal from './components/EditSalaryModal'
import EditSavingsModal from './components/EditSavingsModal'

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function curKey(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

// If a new calendar month has started and previous months exist,
// auto-create an empty profile for the current month.
function ensureCurrentMonth(loaded: AppData): AppData | null {
  const key = curKey()
  if (loaded.months[key]) {
    if (loaded.activeMonthKey === key) return null
    return { ...loaded, activeMonthKey: key }
  }
  // First-time user — let them use the welcome screen
  if (Object.keys(loaded.months).length === 0) return null
  // Previous months exist → new month started
  const n = new Date()
  const newProfile: MonthProfile = {
    key,
    year: n.getFullYear(),
    month: n.getMonth() + 1,
    salary: 0,
    savingsGoal: 0,
    fixedExpenses: [],
    transactions: [],
  }
  return { months: { ...loaded.months, [key]: newProfile }, activeMonthKey: key }
}

export default function App() {
  const [data, setData] = useState<AppData>(() => {
    const loaded = loadData()
    const updated = ensureCurrentMonth(loaded)
    if (updated) { saveData(updated); return updated }
    return loaded
  })

  const [showSetup, setShowSetup] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showEditSalary, setShowEditSalary] = useState(false)
  const [showEditSavings, setShowEditSavings] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const now = new Date()
  const setupYear = now.getFullYear()
  const setupMonth = now.getMonth() + 1

  const activeProfile =
    data.activeMonthKey && data.months[data.activeMonthKey]
      ? data.months[data.activeMonthKey]
      : null

  const update = useCallback((next: AppData) => {
    setData(next)
    saveData(next)
  }, [])

  // Re-render at midnight; also auto-create new month profile if needed
  useEffect(() => {
    const n = new Date()
    const tomorrow = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1)
    const ms = tomorrow.getTime() - n.getTime()
    const id = setTimeout(() => {
      setData(d => {
        const updated = ensureCurrentMonth(d)
        if (updated) { saveData(updated); return updated }
        return { ...d }
      })
    }, ms)
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
    update({ ...data, months: { ...data.months, [activeProfile.key]: updated } })
    setShowAddTx(false)
  }

  function handleDeleteTx(id: string) {
    if (!activeProfile) return
    const updated: MonthProfile = {
      ...activeProfile,
      transactions: activeProfile.transactions.filter(t => t.id !== id),
    }
    update({ ...data, months: { ...data.months, [activeProfile.key]: updated } })
  }

  function handleAddTxToMonth(monthKey: string, tx: Omit<Transaction, 'id'>) {
    const profile = data.months[monthKey]
    if (!profile) return
    const newTx: Transaction = { ...tx, id: genId() }
    const updated: MonthProfile = { ...profile, transactions: [...profile.transactions, newTx] }
    update({ ...data, months: { ...data.months, [monthKey]: updated } })
  }

  function handleUpdateSalary(salary: number, fixedExpenses: FixedExpense[]) {
    if (!activeProfile) return
    const updated: MonthProfile = { ...activeProfile, salary, fixedExpenses }
    update({ ...data, months: { ...data.months, [activeProfile.key]: updated } })
    setShowEditSalary(false)
  }

  function handleUpdateSavings(savingsGoal: number) {
    if (!activeProfile) return
    const updated: MonthProfile = { ...activeProfile, savingsGoal }
    update({ ...data, months: { ...data.months, [activeProfile.key]: updated } })
    setShowEditSavings(false)
  }

  function handleCurrentMonth() {
    const key = curKey()
    if (data.months[key]) {
      update({ ...data, activeMonthKey: key })
    } else {
      setShowSetup(true)
    }
    setMenuOpen(false)
  }

  return (
    <div className="h-dvh w-full bg-[#0a0a0a] overflow-hidden relative">

      {!activeProfile ? (
        <WelcomeScreen onStart={() => setShowSetup(true)} />
      ) : (
        <Dashboard
          profile={activeProfile}
          onAddTx={() => setShowAddTx(true)}
          onDeleteTx={handleDeleteTx}
          onEditSalary={() => setShowEditSalary(true)}
          onEditSavings={() => setShowEditSavings(true)}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenHelp={() => setShowHelp(true)}
        />
      )}

      {/* Menu */}
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
              <MenuRow label="Current Month" onClick={handleCurrentMonth} />
              <MenuRow label="History" onClick={() => { setShowHistory(true); setMenuOpen(false) }} />
            </div>
          </div>
        </div>
      )}

      <SetupModal
        isOpen={showSetup}
        year={setupYear}
        month={setupMonth}
        existingTransactions={data.months[curKey()]?.transactions ?? []}
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
        onAddTxToMonth={handleAddTxToMonth}
        onClose={() => setShowHistory(false)}
      />

      <HelpPanel
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <EditSalaryModal
        isOpen={showEditSalary}
        currentSalary={activeProfile?.salary ?? 0}
        currentFixed={activeProfile?.fixedExpenses ?? []}
        onSave={handleUpdateSalary}
        onClose={() => setShowEditSalary(false)}
      />

      <EditSavingsModal
        isOpen={showEditSavings}
        currentGoal={activeProfile?.savingsGoal ?? 0}
        onSave={handleUpdateSavings}
        onClose={() => setShowEditSavings(false)}
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
        <h1 className="text-[38px] font-bold text-white tracking-tight leading-none mb-3">Finansije</h1>
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
