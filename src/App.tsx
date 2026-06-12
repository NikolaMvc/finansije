import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AppData, Profile, MonthProfile, Transaction, FixedExpense } from './types'
import { loadData, saveData } from './utils/storage'
import Dashboard from './components/Dashboard'
import SetupModal from './components/SetupModal'
import AddTxModal from './components/AddTxModal'
import HistoryView from './components/HistoryView'
import HelpPanel from './components/HelpPanel'
import EditSalaryModal from './components/EditSalaryModal'
import EditSavingsModal from './components/EditSavingsModal'
import ChooseProfileScreen from './components/ChooseProfileScreen'
import CreateProfileModal from './components/CreateProfileModal'

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function curKey(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

function ensureCurrentMonthInProfile(profile: Profile): Profile | null {
  const key = curKey()
  if (profile.months[key]) {
    if (profile.activeMonthKey === key) return null
    return { ...profile, activeMonthKey: key }
  }
  if (Object.keys(profile.months).length === 0) return null
  const n = new Date()
  const newMonth: MonthProfile = {
    key,
    year: n.getFullYear(),
    month: n.getMonth() + 1,
    salary: 0,
    savingsGoal: 0,
    fixedExpenses: [],
    transactions: [],
  }
  return { ...profile, months: { ...profile.months, [key]: newMonth }, activeMonthKey: key }
}

type AppScreen = 'welcome' | 'choose' | 'dashboard'


export default function App() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [screen, setScreen] = useState<AppScreen>(() =>
    Object.keys(loadData().profiles).length === 0 ? 'welcome' : 'choose'
  )
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)

  // Modal / overlay states
  const [showSetup, setShowSetup] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showEditSalary, setShowEditSalary] = useState(false)
  const [showEditSavings, setShowEditSavings] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [pendingProfileName, setPendingProfileName] = useState('')

  const now = new Date()
  const setupYear = now.getFullYear()
  const setupMonth = now.getMonth() + 1

  const activeProfile = activeProfileId ? (data.profiles[activeProfileId] ?? null) : null
  const activeMonthProfile = activeProfile
    ? (activeProfile.activeMonthKey ? (activeProfile.months[activeProfile.activeMonthKey] ?? null) : null)
    : null

  const update = useCallback((next: AppData) => {
    setData(next)
    saveData(next)
  }, [])

  function updateActiveProfile(fn: (p: Profile) => Profile) {
    if (!activeProfileId || !activeProfile) return
    const updated = fn(activeProfile)
    update({ ...data, profiles: { ...data.profiles, [activeProfileId]: updated } })
  }

  // Select profile → run ensureCurrentMonth → go to dashboard
  function handleSelectProfile(profileId: string) {
    const profile = data.profiles[profileId]
    if (!profile) return
    const updated = ensureCurrentMonthInProfile(profile)
    if (updated) {
      update({ ...data, profiles: { ...data.profiles, [profileId]: updated } })
    }
    setDirection(1)
    setActiveProfileId(profileId)
    setScreen('dashboard')
  }

  // "Start Saving" or "Create new profile" → open name modal
  function handleStartCreateProfile() {
    setPendingProfileName('')
    setShowCreateProfile(true)
  }

  // Name confirmed → open setup modal
  function handleConfirmCreateProfile(name: string) {
    setPendingProfileName(name)
    setShowCreateProfile(false)
    setShowSetup(true)
  }

  // Setup saved — either creates a new profile OR updates existing month
  function handleSaveProfile(monthProfile: MonthProfile) {
    if (pendingProfileName) {
      // Creating a brand new profile
      const profileId = genId()
      const newProfile: Profile = {
        id: profileId,
        name: pendingProfileName,
        months: { [monthProfile.key]: monthProfile },
        activeMonthKey: monthProfile.key,
      }
      update({ profiles: { ...data.profiles, [profileId]: newProfile } })
      setPendingProfileName('')
      setDirection(1)
      setActiveProfileId(profileId)
      setScreen('dashboard')
    } else {
      // Updating an existing profile's month
      if (!activeProfile) return
      const existing = activeProfile.months[monthProfile.key]
      const finalMonth: MonthProfile = {
        ...monthProfile,
        transactions: existing?.transactions ?? [],
      }
      updateActiveProfile(p => ({
        ...p,
        months: { ...p.months, [finalMonth.key]: finalMonth },
        activeMonthKey: finalMonth.key,
      }))
    }
    setShowSetup(false)
  }

  function handleAddTx(tx: Omit<Transaction, 'id'>) {
    if (!activeMonthProfile) return
    const newTx: Transaction = { ...tx, id: genId() }
    updateActiveProfile(p => ({
      ...p,
      months: {
        ...p.months,
        [activeMonthProfile.key]: {
          ...activeMonthProfile,
          transactions: [...activeMonthProfile.transactions, newTx],
        },
      },
    }))
    setShowAddTx(false)
  }

  function handleDeleteTx(id: string) {
    if (!activeMonthProfile) return
    updateActiveProfile(p => ({
      ...p,
      months: {
        ...p.months,
        [activeMonthProfile.key]: {
          ...activeMonthProfile,
          transactions: activeMonthProfile.transactions.filter(t => t.id !== id),
        },
      },
    }))
  }

  function handleAddTxToMonth(monthKey: string, tx: Omit<Transaction, 'id'>) {
    if (!activeProfile) return
    const month = activeProfile.months[monthKey]
    if (!month) return
    const newTx: Transaction = { ...tx, id: genId() }
    updateActiveProfile(p => ({
      ...p,
      months: {
        ...p.months,
        [monthKey]: { ...month, transactions: [...month.transactions, newTx] },
      },
    }))
  }

  function handleUpdateSalary(salary: number, fixedExpenses: FixedExpense[]) {
    if (!activeMonthProfile) return
    updateActiveProfile(p => ({
      ...p,
      months: {
        ...p.months,
        [activeMonthProfile.key]: { ...activeMonthProfile, salary, fixedExpenses },
      },
    }))
    setShowEditSalary(false)
  }

  function handleUpdateSavings(savingsGoal: number) {
    if (!activeMonthProfile) return
    updateActiveProfile(p => ({
      ...p,
      months: {
        ...p.months,
        [activeMonthProfile.key]: { ...activeMonthProfile, savingsGoal },
      },
    }))
    setShowEditSavings(false)
  }

  function handleCurrentMonth() {
    if (!activeProfile) return
    const key = curKey()
    if (activeProfile.months[key]) {
      updateActiveProfile(p => ({ ...p, activeMonthKey: key }))
    } else {
      setPendingProfileName('')
      setShowSetup(true)
    }
    setMenuOpen(false)
  }

  function handleRenameProfile(profileId: string, newName: string) {
    const profile = data.profiles[profileId]
    if (!profile) return
    update({ ...data, profiles: { ...data.profiles, [profileId]: { ...profile, name: newName } } })
  }

  function handleChangeProfile() {
    setDirection(-1)
    setScreen('choose')
    setActiveProfileId(null)
    setMenuOpen(false)
    setShowHistory(false)
  }

  // Auto-create new month at midnight for active profile
  useEffect(() => {
    const n = new Date()
    const tomorrow = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1)
    const ms = tomorrow.getTime() - n.getTime()
    const id = setTimeout(() => {
      if (!activeProfileId) return
      setData(d => {
        const profile = d.profiles[activeProfileId]
        if (!profile) return d
        const updated = ensureCurrentMonthInProfile(profile)
        if (!updated) return { ...d }
        const next = { ...d, profiles: { ...d.profiles, [activeProfileId]: updated } }
        saveData(next)
        return next
      })
    }, ms)
    return () => clearTimeout(id)
  }, [activeProfileId])

  return (
    <div className="h-dvh w-full overflow-hidden relative">

      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <motion.div key="welcome" className="absolute inset-0"
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' as const } }}
            exit={{ opacity: 0, x: direction * -28, transition: { duration: 0.16, ease: 'easeIn' as const } }}
          >
            <WelcomeScreen onStart={handleStartCreateProfile} />
          </motion.div>
        )}
        {screen === 'choose' && (
          <motion.div key="choose" className="absolute inset-0"
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' as const } }}
            exit={{ opacity: 0, x: direction * -28, transition: { duration: 0.16, ease: 'easeIn' as const } }}
          >
            <ChooseProfileScreen
              profiles={data.profiles}
              onSelect={handleSelectProfile}
              onCreateNew={handleStartCreateProfile}
              onRename={handleRenameProfile}
            />
          </motion.div>
        )}
        {screen === 'dashboard' && activeMonthProfile && (
          <motion.div key={`dashboard-${activeProfileId}`} className="absolute inset-0"
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' as const } }}
            exit={{ opacity: 0, x: direction * -28, transition: { duration: 0.16, ease: 'easeIn' as const } }}
          >
            <Dashboard
              profile={activeMonthProfile}
              onAddTx={() => setShowAddTx(true)}
              onDeleteTx={handleDeleteTx}
              onEditSalary={() => setShowEditSalary(true)}
              onEditSavings={() => setShowEditSavings(true)}
              onOpenMenu={() => setMenuOpen(true)}
              onOpenHelp={() => setShowHelp(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu */}
      {menuOpen && (
        <div
          className="absolute inset-0 z-30 animate-fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-60 bg-[#0f0f0f] flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 pt-14 pb-6 space-y-1 flex-1">
              <MenuRow label="Current Month" onClick={handleCurrentMonth} />
              <MenuRow label="History" onClick={() => { setShowHistory(true); setMenuOpen(false) }} />
            </div>
            <div className="px-4 pb-6">
              <MenuRow label="Change Profile" onClick={handleChangeProfile} />
            </div>
          </div>
        </div>
      )}

      <CreateProfileModal
        isOpen={showCreateProfile}
        onConfirm={handleConfirmCreateProfile}
        onClose={() => setShowCreateProfile(false)}
      />

      <SetupModal
        isOpen={showSetup}
        year={setupYear}
        month={setupMonth}
        existingTransactions={activeProfile?.months[curKey()]?.transactions ?? []}
        onSave={handleSaveProfile}
        onClose={() => { setShowSetup(false); setPendingProfileName('') }}
      />

      <AddTxModal
        isOpen={showAddTx}
        onAdd={handleAddTx}
        onClose={() => setShowAddTx(false)}
      />

      <HistoryView
        isOpen={showHistory}
        months={activeProfile?.months ?? {}}
        onAddTxToMonth={handleAddTxToMonth}
        onClose={() => setShowHistory(false)}
      />

      <HelpPanel
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <EditSalaryModal
        isOpen={showEditSalary}
        currentSalary={activeMonthProfile?.salary ?? 0}
        currentFixed={activeMonthProfile?.fixedExpenses ?? []}
        onSave={handleUpdateSalary}
        onClose={() => setShowEditSalary(false)}
      />

      <EditSavingsModal
        isOpen={showEditSavings}
        currentGoal={activeMonthProfile?.savingsGoal ?? 0}
        onSave={handleUpdateSavings}
        onClose={() => setShowEditSavings(false)}
      />
    </div>
  )
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="h-dvh flex flex-col items-center justify-center px-8"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="text-center mb-10">
        <h1 className="text-[38px] font-bold text-white tracking-tight leading-none mb-3">Finansije</h1>
        <p className="text-gray-600 text-sm">Track spending. Hit your savings goal.</p>
      </div>
      <button
        onClick={onStart}
        className="w-full py-4 rounded-[20px] text-black font-bold text-base tracking-wide active:opacity-80 transition-opacity"
        style={{ backgroundColor: '#34d399', boxShadow: '0 0 28px rgba(52,211,153,0.35)' }}
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
