export interface Transaction {
  id: string
  amount: number
  description: string
  date: string // "YYYY-MM-DD"
  type: 'expense' | 'income'
}

export interface FixedExpense {
  id: string
  amount: number
  description: string
}

export interface MonthProfile {
  key: string // "YYYY-MM"
  year: number
  month: number // 1-12
  salary: number
  savingsGoal: number
  fixedExpenses: FixedExpense[]
  transactions: Transaction[]
}

export interface Profile {
  id: string
  name: string
  months: Record<string, MonthProfile>
  activeMonthKey: string | null
}

export interface AppData {
  profiles: Record<string, Profile>
}
