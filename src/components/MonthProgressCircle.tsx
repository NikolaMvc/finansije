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
  const viewH = 180

  const blueCirc = 2 * Math.PI * blueR
  const redCirc  = 2 * Math.PI * redR

  const blueDashOffset = blueCirc * (1 - animMonth)
  const redDashOffset  = redCirc  * (1 - animSpent)

  // Green fill: bottom to top
  const fillHeight = Math.max(0, greenR * 2 * animMonth)
  const fillY = cy + greenR - fillHeight

  const isLight = document.documentElement.classList.contains('light')

  // Number color — same yellow as the Remaining / Daily Budget cards
  const numColor = isLight ? '#d97706' : '#fcd34d'
  // Dark mode: thin dark outline so the yellow stays readable over the green fill
  const numStroke = isLight ? 'none' : 'rgba(0,0,0,0.55)'
  const numStrokeWidth = isLight ? 0 : 1

  return (
    <button
      onClick={onClick}
      className="active:scale-[0.96] transition-transform"
      aria-label="Month progress"
    >
      <svg viewBox={`0 0 180 ${viewH}`} width="176" height="176">
        <defs>
          <clipPath id="mpGreenClip">
            <rect x={cx - greenR} y={fillY} width={greenR * 2} height={fillHeight} />
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

        {/* Number — centered, yellow like the Remaining card */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize="34" fontWeight="700" fill={numColor}
          stroke={numStroke} strokeWidth={numStrokeWidth} paintOrder="stroke" strokeLinejoin="round">
          {daysLeft}
        </text>
      </svg>
    </button>
  )
}
