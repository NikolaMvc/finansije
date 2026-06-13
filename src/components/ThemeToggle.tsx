interface Props {
  isLight: boolean
  onToggle: () => void
}

export default function ThemeToggle({ isLight, onToggle }: Props) {
  // Container outer: 66×32px, border 1px → inner (between borders): 64×30px
  // Gap g=3px on all outer sides → indicator: 29×24px
  // Moon: left=3, top=3  →  gaps: left=3, top=3, bottom=3 ✓
  // Sun:  left=32, top=3 →  gaps: right=64-32-29=3, top=3, bottom=3 ✓
  // translateX = 32-3 = 29px
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="relative flex items-center rounded-full active:opacity-70 transition-opacity"
      style={{
        width: 66,
        height: 32,
        padding: '3px',
        backgroundColor: isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)',
        border: '1px solid',
        borderColor: isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)',
      }}
    >
      {/* Indicator — equal gap (3px) on all pill-adjacent sides */}
      <span
        className="absolute rounded-[6px]"
        style={{
          width: 29,
          height: 24,
          top: 3,
          left: 3,
          backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.22)',
          boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
          transform: isLight ? 'translateX(29px)' : 'translateX(0)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Moon — left half, 29px wide, icon centered */}
      <span className="relative z-10 flex items-center justify-center" style={{ width: 29, height: 24 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill={!isLight ? '#e5e7eb' : '#6b7280'}
          />
        </svg>
      </span>

      {/* Sun — right half, 29px wide, icon centered */}
      <span className="relative z-10 flex items-center justify-center" style={{ width: 29, height: 24 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={isLight ? '#374151' : '#6b7280'} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.5" />
          <line x1="12" y1="2"    x2="12" y2="4.5"  />
          <line x1="12" y1="19.5" x2="12" y2="22"   />
          <line x1="4.93"  y1="4.93"  x2="6.64"  y2="6.64"  />
          <line x1="17.36" y1="17.36" x2="19.07" y2="19.07" />
          <line x1="2"    y1="12" x2="4.5"  y2="12" />
          <line x1="19.5" y1="12" x2="22"   y2="12" />
          <line x1="4.93"  y1="19.07" x2="6.64"  y2="17.36" />
          <line x1="17.36" y1="6.64"  x2="19.07" y2="4.93"  />
        </svg>
      </span>
    </button>
  )
}
