import { db } from '@/db'
import type { DailyTaskRepeatedDelayedByDays, TaskAnswer } from '@/db'
import type { EntityService } from './types'
import { startOfDay, differenceInDays } from './utils'

export const dailyTaskRepeatedDelayedByDaysService: EntityService<DailyTaskRepeatedDelayedByDays> = {
  async getAll(): Promise<DailyTaskRepeatedDelayedByDays[]> {
    return db.dailyTasksRepeatedDelayedByDays.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<DailyTaskRepeatedDelayedByDays | undefined> {
    return db.dailyTasksRepeatedDelayedByDays.get(id)
  },

  async create(entity: Omit<DailyTaskRepeatedDelayedByDays, 'id'>): Promise<string> {
    const id = await db.dailyTasksRepeatedDelayedByDays.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<DailyTaskRepeatedDelayedByDays>): Promise<void> {
    await db.dailyTasksRepeatedDelayedByDays.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.dailyTasksRepeatedDelayedByDays.delete(id)
  },

  async recordAnswer(id: string, answer: TaskAnswer): Promise<void> {
    const entity = await db.dailyTasksRepeatedDelayedByDays.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    await db.dailyTasksRepeatedDelayedByDays.update(id, {
      answers: updatedAnswers,
      lastShownAt: new Date()
    })
  },

  async getDueCandidates(): Promise<DailyTaskRepeatedDelayedByDays[]> {
    const entities = await db.dailyTasksRepeatedDelayedByDays.toArray()
    const now = startOfDay(new Date())

    return entities.filter(entity => {
      const createdAt = startOfDay(new Date(entity.createdAt))
      const daysSinceCreation = differenceInDays(now, createdAt)

      if (daysSinceCreation < entity.startInDays) {
        return false
      }

      if (!entity.lastShownAt) return true
      const lastShown = startOfDay(new Date(entity.lastShownAt))
      return differenceInDays(now, lastShown) >= entity.interval
    })
  }
}
