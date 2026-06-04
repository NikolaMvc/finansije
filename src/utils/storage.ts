import type { AppData } from '../types'

const KEY = 'finansije_v1'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { months: {}, activeMonthKey: null }
    return JSON.parse(raw) as AppData
  } catch {
    return { months: {}, activeMonthKey: null }
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}
