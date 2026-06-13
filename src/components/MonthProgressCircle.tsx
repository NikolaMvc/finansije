import { useState, useEffect, useRef } from 'react'

interface Props {
  progress: number
  daysLeft: number
  daysPassed: number
  daysInMonth: number
  onClick: () => void
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function MonthProgressCircle({ progress, daysLeft, daysPassed, daysInMonth, onClick }: Props) {
  const [anim, setAnim] = useState(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    const target = progress

    function step(now: number) {
      const t = Math.min((now - start) / duration, 1)
      setAnim(easeOutCubic(t) * target)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setAnim(target)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [progress])

  const cx = 80, cy = 80
  const outerR = 68
  const strokeWidth = 10
  const innerR = 50
  const circumference = 2 * Math.PI * outerR
  const strokeDashoffset = circumference * (1 - anim)

  const fillHeight = Math.max(0, innerR * 2 * anim)
  const fillY = cy + innerR - fillHeight

  return (
    <button
      onClick={onClick}
      className="active:opacity-70 transition-opacity"
      aria-label="Month progress"
    >
      <svg viewBox="0 0 160 160" width="150" height="150">
        <defs>
          <clipPath id="mpGreenClip">
            <rect x={cx - innerR} y={fillY} width={innerR * 2} height={fillHeight} />
          </clipPath>
        </defs>

        {/* Outer ring track */}
        <circle cx={cx} cy={cy} r={outerR} fill="none"
          stroke="var(--clr-blue)" strokeWidth={strokeWidth} opacity="0.12" />

        {/* Inner circle background */}
        <circle cx={cx} cy={cy} r={innerR} fill="var(--surface)" />

        {/* Green fill — bottom to top */}
        <circle cx={cx} cy={cy} r={innerR}
          fill="var(--clr-green)" opacity="0.7"
          clipPath="url(#mpGreenClip)" />

        {/* Blue outer progress ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none"
          stroke="var(--clr-blue)" strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        {/* Days left number */}
        <text x={cx} y={cy - 6} textAnchor="middle"
          fontSize="32" fontWeight="700" fill="var(--text-primary)">
          {daysLeft}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle"
          fontSize="9.5" fontWeight="600" fill="var(--text-muted)"
          style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          days left
        </text>
      </svg>
    </button>
  )
}
