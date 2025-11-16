import { db } from '@/db'
import type { DailyTaskOnceDelayedByDays, TaskAnswer } from '@/db'
import type { EntityService } from './types'
import { differenceInDays } from './utils'

export const dailyTaskOnceDelayedByDaysService: EntityService<DailyTaskOnceDelayedByDays> = {
  async getAll(): Promise<DailyTaskOnceDelayedByDays[]> {
    return db.dailyTasksOnceDelayedByDays.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<DailyTaskOnceDelayedByDays | undefined> {
    return db.dailyTasksOnceDelayedByDays.get(id)
  },

  async create(entity: Omit<DailyTaskOnceDelayedByDays, 'id'>): Promise<string> {
    const id = await db.dailyTasksOnceDelayedByDays.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<DailyTaskOnceDelayedByDays>): Promise<void> {
    await db.dailyTasksOnceDelayedByDays.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.dailyTasksOnceDelayedByDays.delete(id)
  },

  async recordAnswer(id: string, answer: TaskAnswer): Promise<void> {
    const entity = await db.dailyTasksOnceDelayedByDays.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    const updates: Partial<DailyTaskOnceDelayedByDays> = {
      answers: updatedAnswers,
      lastShownAt: new Date()
    }

    if (answer.action === 'already-done') {
      updates.isDone = true
    }

    await db.dailyTasksOnceDelayedByDays.update(id, updates)
  },

  async getDueCandidates(): Promise<DailyTaskOnceDelayedByDays[]> {
    const entities = await db.dailyTasksOnceDelayedByDays.toArray()
    const now = new Date()

    return entities.filter(entity => {
      if (entity.isDone) return false

      const createdAt = new Date(entity.createdAt)
      const daysSinceCreation = differenceInDays(now, createdAt)
      return daysSinceCreation >= entity.startInDays
    })
  }
}
