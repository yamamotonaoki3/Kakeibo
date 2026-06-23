export type User = { id: number; username: string; displayName: string }

export type Account = { id: number; name: string; initialBalance: number; balance: number }

export type Category =
  // 支出
  | 'FOOD' | 'DAILY' | 'TRANSPORT' | 'ENTERTAINMENT' | 'MEDICAL'
  | 'UTILITIES' | 'RENT' | 'COMMUNICATION' | 'INSURANCE'
  | 'GIFT' | 'MOTHERS_DAY' | 'FATHERS_DAY' | 'OTHER_EXPENSE'
  // 収入
  | 'SALARY' | 'BONUS' | 'SIDE_INCOME' | 'OTHER_INCOME'

export type TransactionType = 'INCOME' | 'EXPENSE'

export const CATEGORY_LABELS: Record<Category, string> = {
  FOOD: '食費', DAILY: '日用品', TRANSPORT: '交通費', ENTERTAINMENT: '娯楽費',
  MEDICAL: '医療費', UTILITIES: '光熱費', RENT: '家賃', COMMUNICATION: '通信費',
  INSURANCE: '保険料', GIFT: 'お年玉', MOTHERS_DAY: '母の日', FATHERS_DAY: '父の日',
  OTHER_EXPENSE: 'その他支出',
  SALARY: '給料', BONUS: '賞与', SIDE_INCOME: '副収入', OTHER_INCOME: 'その他収入',
}

export type Transaction = {
  id: number | string
  date: string
  accountId: number | null
  accountName: string
  amount: number
  category: Category
  type: TransactionType
  memo: string
  isSplit?: boolean
  groupName?: string
  paidByDisplayName?: string
}

export type Group = {
  id: number
  name: string
  inviteCode: string
  createdByDisplayName: string
  createdAt: string
}

export type GroupMember = {
  userId: number
  displayName: string
  joinedAt: string
}

export type SplitShare = {
  id: number
  userId: number
  displayName: string
  shareRatio: number
  shareAmount: number
  isSettled: boolean
  settledAt: string | null
}

export type SplitTransaction = {
  id: number
  groupId: number
  groupName: string
  totalAmount: number
  paidByUserId: number
  paidByDisplayName: string
  memo: string
  splitDate: string
  createdAt: string
  shares: SplitShare[]
}

export type Transfer = {
  id: number
  fromUserId: number
  fromDisplayName: string
  toUserId: number
  toDisplayName: string
  amount: number
  memo: string
  transferDate: string
  isSettled: boolean
  settledAt: string | null
}

export type DebtSummary = {
  fromUserId: number
  fromDisplayName: string
  toUserId: number
  toDisplayName: string
  amount: number
}

export type UserSearchResult = { id: number; displayName: string }

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
