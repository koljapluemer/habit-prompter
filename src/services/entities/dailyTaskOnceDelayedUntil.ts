import { db } from '@/db'
import type { DailyTaskOnceDelayedUntil, TaskAnswer } from '@/db'
import type { EntityService } from './types'
import { startOfDay, parseYYMMDD } from './utils'

export const dailyTaskOnceDelayedUntilService: EntityService<DailyTaskOnceDelayedUntil> = {
  async getAll(): Promise<DailyTaskOnceDelayedUntil[]> {
    return db.dailyTasksOnceDelayedUntil.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<DailyTaskOnceDelayedUntil | undefined> {
    return db.dailyTasksOnceDelayedUntil.get(id)
  },

  async create(entity: Omit<DailyTaskOnceDelayedUntil, 'id'>): Promise<string> {
    const id = await db.dailyTasksOnceDelayedUntil.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<DailyTaskOnceDelayedUntil>): Promise<void> {
    await db.dailyTasksOnceDelayedUntil.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.dailyTasksOnceDelayedUntil.delete(id)
  },

  async recordAnswer(id: string, answer: TaskAnswer): Promise<void> {
    const entity = await db.dailyTasksOnceDelayedUntil.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    const updates: Partial<DailyTaskOnceDelayedUntil> = {
      answers: updatedAnswers,
      lastShownAt: new Date()
    }

    if (answer.action === 'already-done') {
      updates.isDone = true
    }

    await db.dailyTasksOnceDelayedUntil.update(id, updates)
  },

  async getDueCandidates(): Promise<DailyTaskOnceDelayedUntil[]> {
    const entities = await db.dailyTasksOnceDelayedUntil.toArray()
    const now = startOfDay(new Date())

    return entities.filter(entity => {
      if (entity.isDone) return false

      const startDate = parseYYMMDD(entity.startAtDate)
      if (!startDate) return false

      return now.getTime() >= startOfDay(startDate).getTime()
    })
  }
}
