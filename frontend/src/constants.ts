import type { Category } from './types'

export const CATEGORY_COLORS: Record<Category, string> = {
  FOOD:          '#ef5350',
  DAILY:         '#ff8a65',
  TRANSPORT:     '#66bb6a',
  ENTERTAINMENT: '#ff7043',
  MEDICAL:       '#ec407a',
  UTILITIES:     '#42a5f5',
  RENT:          '#ab47bc',
  COMMUNICATION: '#26c6da',
  INSURANCE:     '#8d6e63',
  GIFT:          '#ffa726',
  MOTHERS_DAY:   '#f06292',
  FATHERS_DAY:   '#5c6bc0',
  OTHER_EXPENSE: '#78909c',
  SALARY:        '#26a69a',
  BONUS:         '#29b6f6',
  SIDE_INCOME:   '#9ccc65',
  OTHER_INCOME:  '#b0bec5',
}

export const EXPENSE_CATEGORIES: Category[] = [
  'FOOD', 'DAILY', 'TRANSPORT', 'ENTERTAINMENT', 'MEDICAL',
  'UTILITIES', 'RENT', 'COMMUNICATION', 'INSURANCE',
  'GIFT', 'MOTHERS_DAY', 'FATHERS_DAY', 'OTHER_EXPENSE',
]

export const INCOME_CATEGORIES: Category[] = [
  'SALARY', 'BONUS', 'SIDE_INCOME', 'OTHER_INCOME',
]

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  FOOD: '食費', DAILY: '日用品', TRANSPORT: '交通費', ENTERTAINMENT: '娯楽費',
  MEDICAL: '医療費', UTILITIES: '光熱費', RENT: '家賃', COMMUNICATION: '通信費',
  INSURANCE: '保険料', GIFT: 'お年玉', MOTHERS_DAY: '母の日', FATHERS_DAY: '父の日',
  OTHER_EXPENSE: 'その他支出',
}

export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  SALARY: '給料', BONUS: '賞与', SIDE_INCOME: '副収入', OTHER_INCOME: 'その他収入',
}
