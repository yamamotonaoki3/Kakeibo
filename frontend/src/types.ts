export type User = { id: number; username: string; displayName: string }

export type Account = { id: number; name: string; initialBalance: number; balance: number }

export type Category = 'FOOD' | 'RENT' | 'UTILITIES' | 'SALARY' | 'ENTERTAINMENT' | 'MEDICAL' | 'CLOTHING' | 'OTHER'
export type TransactionType = 'INCOME' | 'EXPENSE'

export const CATEGORY_LABELS: Record<Category, string> = {
  FOOD: '食費', RENT: '家賃', UTILITIES: '光熱費', SALARY: '給料',
  ENTERTAINMENT: '娯楽', MEDICAL: '医療費', CLOTHING: '衣服', OTHER: 'その他',
}

export type Transaction = {
  id: number
  date: string
  accountId: number
  accountName: string
  amount: number
  category: Category
  type: TransactionType
  memo: string
}

export type CalendarDay = {
  day: number
  date: string
  income: number
  expense: number
  balance: number
} | null

export type CalendarData = {
  year: number
  month: number
  monthIncome: number
  monthExpense: number
  monthBalance: number
  days: CalendarDay[]
}
