import { useState, useEffect, useRef } from 'react'

interface Props {
  progress: number
  spentProgress: number
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

export default function MonthProgressCircle({ progress, spentProgress, onClick }: Props) {
  const animMonth = useAnimatedValue(progress, 1200)
  const animSpent = useAnimatedValue(spentProgress, 1400)

  const cx = 90, cy = 90
  const blueR = 77, blueStroke = 14
  const redR  = 60, redStroke  = 14
  const greenR = 49

  const blueCirc = 2 * Math.PI * blueR
  const redCirc  = 2 * Math.PI * redR

  const blueDashOffset = blueCirc * (1 - animMonth)
  const redDashOffset  = redCirc  * (1 - animSpent)

  // Green fill: bottom to top
  const fillHeight = Math.max(0, greenR * 2 * animMonth)
  const fillY = cy + greenR - fillHeight

  return (
    <button
      onClick={onClick}
      className="active:scale-[0.96] transition-transform"
      aria-label="Month progress"
    >
      <svg viewBox="0 0 180 180" width="180" height="180">
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
      </svg>
    </button>
  )
}
