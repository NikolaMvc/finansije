interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function HelpPanel({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  const items = [
    { varName: '--clr-yellow', label: 'Remaining to spend' },
    { varName: '--clr-green',  label: 'Savings goal' },
    { varName: '--clr-blue',   label: 'Monthly salary' },
    { varName: '--clr-red',    label: 'Expenses' },
    { varName: '--clr-green',  label: 'Income / refunds' },
  ]

  return (
    <>
      <div className="absolute inset-0 z-40" onClick={onClose} />
      <div
        className="absolute bottom-24 right-4 z-50 rounded-2xl p-4 w-52 animate-fade-in border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
      >
        <div className="space-y-2.5">
          {items.map(({ varName, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `var(${varName})` }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
