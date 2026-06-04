interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function HelpPanel({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <>
      <div className="absolute inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-24 right-4 z-50 bg-[#161616] border border-white/10 rounded-2xl p-4 w-52 animate-fade-in">
        <div className="space-y-2.5">
          {[
            { color: '#f0c040', label: 'Remaining to spend' },
            { color: '#42d392', label: 'Savings goal' },
            { color: '#4db8e8', label: 'Monthly salary' },
            { color: '#e85c5c', label: 'Expenses' },
            { color: '#42d392', label: 'Income / refunds' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-300 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
