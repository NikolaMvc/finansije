import { useState } from 'react'

export function useTheme() {
  const [isLight, setIsLight] = useState(() =>
    document.documentElement.classList.contains('light')
  )

  function toggle() {
    const next = !isLight
    setIsLight(next)
    if (next) {
      document.documentElement.classList.add('light')
      localStorage.setItem('finansije_theme', 'light')
    } else {
      document.documentElement.classList.remove('light')
      localStorage.setItem('finansije_theme', 'dark')
    }
  }

  return { isLight, toggle }
}
