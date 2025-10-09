import { db, type Action, type Modality } from '@/db'

const startOfDay = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const differenceInDays = (later: Date, earlier: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((later.getTime() - earlier.getTime()) / msPerDay)
}

export const isActionDue = (action: Action, referenceDate: Date = new Date()): boolean => {
  if (action.archived) return false
  if (action.isFinishable && action.isCompleted) return false

  const interval = Math.max(1, action.intervalDays)
  const reference = startOfDay(referenceDate)

  if (!action.lastCompleted) {
    return true
  }

  const lastCompleted = startOfDay(new Date(action.lastCompleted))
  return differenceInDays(reference, lastCompleted) >= interval
}

export const actionService = {
  async getAll(): Promise<Action[]> {
    return db.actions.orderBy('createdAt').reverse().toArray()
  },

  async getActive(): Promise<Action[]> {
    return db.actions.filter(action => !action.archived).toArray()
  },

  async getById(id: string): Promise<Action | undefined> {
    return db.actions.get(id)
  },

  async create(action: Omit<Action, 'id'>): Promise<string> {
    const id = await db.actions.add(action)
    return id as string
  },

  async update(id: string, changes: Partial<Action>): Promise<void> {
    await db.actions.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.actions.delete(id)
  },

  async recordInteraction(id: string): Promise<void> {
    await db.actions.update(id, { lastCompleted: new Date() })
  },

  async markFinished(id: string): Promise<void> {
    await db.actions.update(id, { isCompleted: true, completedAt: new Date() })
  },

  async reopen(id: string): Promise<void> {
    await db.actions.update(id, { isCompleted: false, completedAt: undefined })
  },

  async getQueueCandidates(): Promise<Action[]> {
    const actions = await db.actions.toArray()
    return actions.filter(action => isActionDue(action))
  }
}

export type { Action, Modality }
