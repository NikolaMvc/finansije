import { useState, useEffect, useRef } from 'react'

interface Props {
  progress: number
  spentProgress: number
  daysLeft: number
  daysPassed: number
  daysInMonth: number
  onClick: () => void
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function useAnimatedValue(target: number, duration: number) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>()
  useEffect(() => {
    const start = performance.now()
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1)
      setValue(easeOutCubic(t) * target)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else setValue(target)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])
  return value
}

export default function MonthProgressCircle({ progress, spentProgress, daysLeft, daysPassed, daysInMonth, onClick }: Props) {
  const animMonth = useAnimatedValue(progress, 1200)
  const animSpent = useAnimatedValue(spentProgress, 1400)

  const cx = 90, cy = 90
  const blueR = 80,  blueStroke = 10
  const redR  = 63,  redStroke  = 10
  const greenR = 46

  const blueCirc = 2 * Math.PI * blueR
  const redCirc  = 2 * Math.PI * redR

  const blueDashOffset = blueCirc * (1 - animMonth)
  const redDashOffset  = redCirc  * (1 - animSpent)

  // Green fill: bottom to top
  const fillHeight = Math.max(0, greenR * 2 * animMonth)
  const fillY = cy + greenR - fillHeight

  const isLight = document.documentElement.classList.contains('light')

  // Split-color text: render each text twice with opposite colors + complementary clipPaths
  // so the color changes exactly at the green fill boundary
  const colorOnBg    = 'var(--text-primary)'              // white in dark, dark in light
  const colorOnGreen = isLight ? '#ffffff' : '#111827'    // white in light (green darker than bg), dark in dark (green brighter than bg)
  const subOnBg      = isLight ? 'var(--text-muted)' : '#ffffff'
  const subOnGreen   = isLight ? '#ffffff' : '#111827'

  return (
    <button
      onClick={onClick}
      className="active:opacity-70 transition-opacity"
      aria-label="Month progress"
    >
      <svg viewBox="0 0 180 180" width="176" height="176">
        <defs>
          <clipPath id="mpGreenClip">
            <rect x={cx - greenR} y={fillY} width={greenR * 2} height={fillHeight} />
          </clipPath>
          {/* Above green fill line — background color text */}
          <clipPath id="mpAboveGreen">
            <rect x={0} y={0} width={180} height={fillY} />
          </clipPath>
          {/* Below green fill line — on-green color text */}
          <clipPath id="mpBelowGreen">
            <rect x={0} y={fillY} width={180} height={180} />
          </clipPath>
        </defs>

        {/* Track: blue outer */}
        <circle cx={cx} cy={cy} r={blueR} fill="none"
          stroke="#3b82f6" strokeWidth={blueStroke} opacity="0.18" />

        {/* Track: red middle */}
        <circle cx={cx} cy={cy} r={redR} fill="none"
          stroke="#ef4444" strokeWidth={redStroke} opacity="0.18" />

        {/* Inner circle background */}
        <circle cx={cx} cy={cy} r={greenR} fill="var(--surface)" />

        {/* Green fill — bottom to top, solid */}
        <circle cx={cx} cy={cy} r={greenR}
          fill="#22c55e"
          clipPath="url(#mpGreenClip)" />

        {/* Red middle progress ring */}
        <circle cx={cx} cy={cy} r={redR} fill="none"
          stroke="#ef4444" strokeWidth={redStroke}
          strokeDasharray={redCirc}
          strokeDashoffset={redDashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        {/* Blue outer progress ring */}
        <circle cx={cx} cy={cy} r={blueR} fill="none"
          stroke="#3b82f6" strokeWidth={blueStroke}
          strokeDasharray={blueCirc}
          strokeDashoffset={blueDashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        {/* Number — above green (bg color) */}
        <text x={cx} y={cy - 5} textAnchor="middle"
          fontSize="34" fontWeight="700" fill={colorOnBg}
          clipPath="url(#mpAboveGreen)">
          {daysLeft}
        </text>
        {/* Number — below green (on-green color) */}
        <text x={cx} y={cy - 5} textAnchor="middle"
          fontSize="34" fontWeight="700" fill={colorOnGreen}
          clipPath="url(#mpBelowGreen)">
          {daysLeft}
        </text>

        {/* "days left" — above green (bg color) */}
        <text x={cx} y={cy + 16} textAnchor="middle"
          fontSize="9" fontWeight="600" fill={subOnBg}
          clipPath="url(#mpAboveGreen)"
          style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          days left
        </text>
        {/* "days left" — below green (on-green color) */}
        <text x={cx} y={cy + 16} textAnchor="middle"
          fontSize="9" fontWeight="600" fill={subOnGreen}
          clipPath="url(#mpBelowGreen)"
          style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          days left
        </text>
      </svg>
    </button>
  )
}
