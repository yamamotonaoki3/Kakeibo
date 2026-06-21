import client from './client'
import type { Group, GroupMember, SplitTransaction, Transfer, DebtSummary, UserSearchResult } from '../types'

// Groups
export const getGroups = () => client.get<Group[]>('/groups')
export const createGroup = (name: string) => client.post<Group>('/groups', { name })
export const joinGroup = (inviteCode: string) => client.post<Group>('/groups/join', { inviteCode })
export const getGroupMembers = (id: number) => client.get<GroupMember[]>(`/groups/${id}/members`)

// Splits
export type ShareInput = { userId: number; shareRatio: number }
export type CreateSplitInput = {
  groupId: number
  totalAmount: number
  memo: string
  splitDate: string
  shares: ShareInput[]
}
export const createSplit = (data: CreateSplitInput) =>
  client.post<SplitTransaction>('/splits', data)
export const getSplits = (from?: string, to?: string) =>
  client.get<SplitTransaction[]>('/splits', { params: { from, to } })
export const settleShare = (splitId: number, shareId: number) =>
  client.patch(`/splits/${splitId}/shares/${shareId}/settle`)
export const getSplitSummary = (from?: string, to?: string) =>
  client.get<DebtSummary[]>('/splits/summary', { params: { from, to } })

// Transfers
export type CreateTransferInput = {
  toUserId: number
  amount: number
  memo: string
  transferDate: string
}
export const createTransfer = (data: CreateTransferInput) =>
  client.post<Transfer>('/transfers', data)
export const getTransfers = (from?: string, to?: string) =>
  client.get<Transfer[]>('/transfers', { params: { from, to } })
export const settleTransfer = (id: number) => client.patch(`/transfers/${id}/settle`)
export const getTransferSummary = (from?: string, to?: string) =>
  client.get<DebtSummary[]>('/transfers/summary', { params: { from, to } })

// User search (display name partial match)
export const searchUser = (query: string) =>
  client.get<UserSearchResult[]>('/users/search', { params: { query } })
