import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AppData, Profile, MonthProfile, Transaction, FixedExpense } from './types'
import { loadData, saveData } from './utils/storage'
import { useTheme } from './utils/useTheme'
import Dashboard from './components/Dashboard'
import SetupModal from './components/SetupModal'
import AddTxModal from './components/AddTxModal'
import HistoryView from './components/HistoryView'
import HelpPanel from './components/HelpPanel'
import EditSalaryModal from './components/EditSalaryModal'
import EditSavingsModal from './components/EditSavingsModal'
import ChooseProfileScreen from './components/ChooseProfileScreen'
import CreateProfileModal from './components/CreateProfileModal'
import ThemeToggle from './components/ThemeToggle'
import StatisticsView from './components/StatisticsView'

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

  const { isLight, toggle: toggleTheme } = useTheme()

  const [menuOpen, setMenuOpen] = useState(false)

  const MENU_WIDTH = 240
  const menuPanelRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const peakDragOffset = useRef(0)
  const velocityTrackX = useRef(0)
  const velocityTrackTime = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    if (isDragging.current) return
    const panel = menuPanelRef.current
    const bd = backdropRef.current
    if (!panel) return
    panel.style.transition = 'transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)'
    panel.style.transform = menuOpen ? 'translateX(0)' : `translateX(-${MENU_WIDTH}px)`
    if (bd) {
      bd.style.transition = 'opacity 0.2s ease'
      bd.style.opacity = menuOpen ? '1' : '0'
    }
  }, [menuOpen])

  function handleTouchStart(e: React.TouchEvent) {
    dragStartX.current = e.touches[0].clientX
    dragStartY.current = e.touches[0].clientY
    peakDragOffset.current = 0
    velocityTrackX.current = e.touches[0].clientX
    velocityTrackTime.current = Date.now()
    isDragging.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    const x = e.touches[0].clientX
    const dx = x - dragStartX.current
    const dy = e.touches[0].clientY - dragStartY.current

    if (!isDragging.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      if (Math.abs(dy) >= Math.abs(dx)) return
      if (!menuOpen && (dx <= 0 || dragStartX.current > 40)) return
      if (menuOpen && dx >= 0) return
      isDragging.current = true
    }

    const now = Date.now()
    if (now - velocityTrackTime.current > 40) {
      velocityTrackX.current = x
      velocityTrackTime.current = now
    }

    const panel = menuPanelRef.current
    const bd = backdropRef.current
    if (!panel) return

    if (!menuOpen) {
      const offset = Math.min(MENU_WIDTH, Math.max(0, dx))
      if (offset > peakDragOffset.current) peakDragOffset.current = offset
      panel.style.transition = 'none'
      panel.style.transform = `translateX(${offset - MENU_WIDTH}px)`
      if (bd) { bd.style.transition = 'none'; bd.style.opacity = String((offset / MENU_WIDTH) * 0.65) }
    } else {
      const offset = Math.min(MENU_WIDTH, Math.max(0, -dx))
      if (offset > peakDragOffset.current) peakDragOffset.current = offset
      panel.style.transition = 'none'
      panel.style.transform = `translateX(-${offset}px)`
      if (bd) { bd.style.transition = 'none'; bd.style.opacity = String((1 - offset / MENU_WIDTH) * 0.65) }
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!isDragging.current) return
    isDragging.current = false

    const finalX = e.changedTouches[0].clientX
    const finalDx = finalX - dragStartX.current
    const now = Date.now()
    const elapsed = now - velocityTrackTime.current
    const velocity = elapsed > 0 && elapsed < 200
      ? (finalX - velocityTrackX.current) / elapsed
      : 0
    const threshold = MENU_WIDTH * 0.25

    const panel = menuPanelRef.current
    const bd = backdropRef.current

    if (!menuOpen) {
      const offset = Math.min(MENU_WIDTH, Math.max(0, finalDx))
      const retreated = (peakDragOffset.current - offset) > 25 || velocity < -0.3
      const shouldOpen = !retreated && offset > threshold
      if (shouldOpen) {
        if (panel) { panel.style.transition = 'transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)'; panel.style.transform = 'translateX(0)' }
        if (bd) { bd.style.transition = 'opacity 0.2s ease'; bd.style.opacity = '0.65' }
        setMenuOpen(true)
      } else {
        if (panel) { panel.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; panel.style.transform = `translateX(-${MENU_WIDTH}px)` }
        if (bd) { bd.style.transition = 'opacity 0.2s ease'; bd.style.opacity = '0' }
      }
    } else {
      const offset = Math.min(MENU_WIDTH, Math.max(0, -finalDx))
      const retreated = (peakDragOffset.current - offset) > 25 || velocity > 0.3
      const shouldClose = !retreated && offset > threshold
      if (shouldClose) {
        if (panel) { panel.style.transition = 'transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)'; panel.style.transform = `translateX(-${MENU_WIDTH}px)` }
        if (bd) { bd.style.transition = 'opacity 0.2s ease'; bd.style.opacity = '0' }
        setTimeout(() => setMenuOpen(false), 260)
      } else {
        if (panel) { panel.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; panel.style.transform = 'translateX(0)' }
        if (bd) { bd.style.transition = 'opacity 0.2s ease'; bd.style.opacity = '0.65' }
      }
    }
  }

  // Modal / overlay states
  const [showSetup, setShowSetup] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showEditSalary, setShowEditSalary] = useState(false)
  const [showEditSavings, setShowEditSavings] = useState(false)
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

  function handleStartCreateProfile() {
    setPendingProfileName('')
    setShowCreateProfile(true)
  }

  function handleConfirmCreateProfile(name: string) {
    setPendingProfileName(name)
    setShowCreateProfile(false)
    setShowSetup(true)
  }

  function handleSaveProfile(monthProfile: MonthProfile) {
    if (pendingProfileName) {
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

  function handleDeleteProfile(profileId: string) {
    const newProfiles = { ...data.profiles }
    delete newProfiles[profileId]
    const newData = { profiles: newProfiles }
    update(newData)
    if (Object.keys(newProfiles).length === 0) {
      setScreen('welcome')
    }
  }

  function handleChangeProfile() {
    setDirection(-1)
    setScreen('choose')
    setActiveProfileId(null)
    setMenuOpen(false)
    setShowHistory(false)
  }

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
    <div className="h-dvh w-full overflow-hidden relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>

      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <motion.div key="welcome" className="absolute inset-0"
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' as const } }}
            exit={{ opacity: 0, x: direction * -28, transition: { duration: 0.16, ease: 'easeIn' as const } }}
          >
            <WelcomeScreen onStart={handleStartCreateProfile} isLight={isLight} onToggleTheme={toggleTheme} />
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
              onDelete={handleDeleteProfile}
              isLight={isLight}
              onToggleTheme={toggleTheme}
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
              onOpenHistory={() => setShowHistory(true)}
              onOpenStatistics={() => setShowStatistics(true)}
              isLight={isLight}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu — always in DOM to avoid mount lag */}
      <div
        className="absolute inset-0 z-30"
        style={{ pointerEvents: menuOpen ? 'auto' : 'none' }}
        onClick={() => setMenuOpen(false)}
      >
        <div
          ref={backdropRef}
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', opacity: 0 }}
        />
        <div
          ref={menuPanelRef}
          className="absolute top-0 left-0 h-full w-60 flex flex-col"
          style={{
            transform: `translateX(-${MENU_WIDTH}px)`,
            willChange: 'transform',
            background: 'var(--menu-bg)',
            borderRight: '1px solid var(--menu-border)',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-4 pt-14 pb-6 space-y-1 flex-1">
            <MenuRow label="Current Month" onClick={handleCurrentMonth} />
            <MenuRow label="History" onClick={() => { setShowHistory(true); setMenuOpen(false) }} />
            <MenuRow label="Statistics" onClick={() => { setShowStatistics(true); setMenuOpen(false) }} />
            <MenuRow label="Help" onClick={() => { setShowHelp(true); setMenuOpen(false) }} />
          </div>
          <div className="px-4 pb-2">
            <MenuRow label="Change Profile" onClick={handleChangeProfile} />
          </div>
        </div>
      </div>

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

      <StatisticsView
        isOpen={showStatistics}
        profile={activeMonthProfile}
        onClose={() => setShowStatistics(false)}
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

function WelcomeScreen({ onStart, isLight, onToggleTheme }: { onStart: () => void; isLight: boolean; onToggleTheme: () => void }) {
  return (
    <div
      className="h-dvh flex flex-col px-8"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-end pt-3">
        <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-10">
          <h1 className="text-[38px] font-bold tracking-tight leading-none mb-3" style={{ color: 'var(--text-primary)' }}>
            Finansije
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track spending. Hit your savings goal.</p>
        </div>
        <button
          onClick={onStart}
          className="w-full py-4 rounded-[20px] font-bold text-base tracking-wide active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--clr-green)', color: 'var(--clr-green-btn-text)', boxShadow: '0 0 28px rgba(52,211,153,0.25)' }}
        >
          START SAVING
        </button>
      </div>
    </div>
  )
}

function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left py-3.5 px-4 rounded-2xl text-sm font-medium active:opacity-60 transition-opacity"
      style={{ color: 'var(--text-primary)' }}
    >
      {label}
    </button>
  )
}
