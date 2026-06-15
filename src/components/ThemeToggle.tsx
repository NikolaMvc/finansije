import { useState, useEffect } from 'react'

interface Props {
  isLight: boolean
  onToggle: () => void
}

export default function ThemeToggle({ isLight, onToggle }: Props) {
  // Enable the slide transition only after mount so the indicator doesn't animate
  // from translateX(0) when the (off-screen) toggle is first painted in light mode
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  // Pill: 66×32, border 1px → padding box 64×30
  // Circle Ø24 (gap 3 top/bottom). Moon center (15,15), Sun center (49,15) → translateX 34
  // Icons positioned absolutely at the SAME spot as the circle, so each is dead-centered.
  const D = 24
  const GAP = 3
  const moonLeft = GAP        // 3
  const sunLeft = 64 - GAP - D // 37
  const shift = sunLeft - moonLeft // 34

  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="relative rounded-full active:opacity-70 transition-opacity"
      style={{
        width: 66,
        height: 32,
        border: '1px solid',
        borderColor: isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)',
        backgroundColor: isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)',
      }}
    >
      {/* Sliding circle indicator */}
      <span
        className="absolute rounded-full"
        style={{
          width: D,
          height: D,
          top: GAP,
          left: moonLeft,
          backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.22)',
          boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
          transform: isLight ? `translateX(${shift}px)` : 'translateX(0)',
          transition: mounted ? 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
      />

      {/* Moon — centered on the moon circle position */}
      <span
        className="absolute z-10 flex items-center justify-center"
        style={{ width: D, height: D, top: GAP, left: moonLeft }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill={!isLight ? '#e5e7eb' : '#6b7280'}
          />
        </svg>
      </span>

      {/* Sun — centered on the sun circle position */}
      <span
        className="absolute z-10 flex items-center justify-center"
        style={{ width: D, height: D, top: GAP, left: sunLeft }}
      >
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
