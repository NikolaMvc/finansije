import type { MonthProfile } from '../types'

export function fixedTotal(p: MonthProfile): number {
  return p.fixedExpenses.reduce((s, fe) => s + fe.amount, 0)
}

export function expensesTotal(p: MonthProfile): number {
  return p.transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Math.abs(t.amount), 0)
}

export function incomeTotal(p: MonthProfile): number {
  return p.transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
}

export function getRemaining(p: MonthProfile): number {
  return p.salary - p.savingsGoal - fixedTotal(p) - expensesTotal(p) + incomeTotal(p)
}

export function getSpentSoFar(p: MonthProfile): number {
  return expensesTotal(p)
}

export function remainingDays(year: number, month: number): number {
  const today = new Date()
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month
  if (isCurrentMonth) {
    const lastDay = new Date(year, month, 0).getDate()
    return Math.max(1, lastDay - today.getDate() + 1)
  }
  return new Date(year, month, 0).getDate()
}

export function getDailyBudget(p: MonthProfile): number {
  const rem = getRemaining(p)
  const days = remainingDays(p.year, p.month)
  return rem / days
}
