import type { AppData, MonthProfile } from '../types'

const KEY = 'finansije_v1'

export function loadData(): AppData {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!raw) return { profiles: {} }

    // Migrate from old single-profile format (had top-level `months` key)
    if ('months' in raw && !('profiles' in raw)) {
      const migrated: AppData = {
        profiles: {
          default: {
            id: 'default',
            name: 'Profile 1',
            months: (raw as { months: Record<string, MonthProfile> }).months ?? {},
            activeMonthKey: (raw as { activeMonthKey: string | null }).activeMonthKey ?? null,
          },
        },
      }
      saveData(migrated)
      return migrated
    }

    return raw as AppData
  } catch {
    return { profiles: {} }
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}
