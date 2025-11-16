import { db } from '@/db'
import type { DailyTaskRepeatedDelayedUntil, TaskAnswer } from '@/db'
import type { EntityService } from './types'
import { startOfDay, differenceInDays, parseYYMMDD } from './utils'

export const dailyTaskRepeatedDelayedUntilService: EntityService<DailyTaskRepeatedDelayedUntil> = {
  async getAll(): Promise<DailyTaskRepeatedDelayedUntil[]> {
    return db.dailyTasksRepeatedDelayedUntil.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<DailyTaskRepeatedDelayedUntil | undefined> {
    return db.dailyTasksRepeatedDelayedUntil.get(id)
  },

  async create(entity: Omit<DailyTaskRepeatedDelayedUntil, 'id'>): Promise<string> {
    const id = await db.dailyTasksRepeatedDelayedUntil.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<DailyTaskRepeatedDelayedUntil>): Promise<void> {
    await db.dailyTasksRepeatedDelayedUntil.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.dailyTasksRepeatedDelayedUntil.delete(id)
  },

  async recordAnswer(id: string, answer: TaskAnswer): Promise<void> {
    const entity = await db.dailyTasksRepeatedDelayedUntil.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    await db.dailyTasksRepeatedDelayedUntil.update(id, {
      answers: updatedAnswers,
      lastShownAt: new Date()
    })
  },

  async getDueCandidates(): Promise<DailyTaskRepeatedDelayedUntil[]> {
    const entities = await db.dailyTasksRepeatedDelayedUntil.toArray()
    const now = startOfDay(new Date())

    return entities.filter(entity => {
      const startDate = parseYYMMDD(entity.startAtDate)
      if (!startDate || now.getTime() < startOfDay(startDate).getTime()) {
        return false
      }

      if (!entity.lastShownAt) return true
      const lastShown = startOfDay(new Date(entity.lastShownAt))
      return differenceInDays(now, lastShown) >= entity.interval
    })
  }
}
