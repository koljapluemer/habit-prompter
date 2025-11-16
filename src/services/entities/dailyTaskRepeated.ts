import { db } from '@/db'
import type { DailyTaskRepeated, TaskAnswer } from '@/db'
import type { EntityService } from './types'
import { startOfDay, differenceInDays } from './utils'

export const dailyTaskRepeatedService: EntityService<DailyTaskRepeated> = {
  async getAll(): Promise<DailyTaskRepeated[]> {
    return db.dailyTasksRepeated.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<DailyTaskRepeated | undefined> {
    return db.dailyTasksRepeated.get(id)
  },

  async create(entity: Omit<DailyTaskRepeated, 'id'>): Promise<string> {
    const id = await db.dailyTasksRepeated.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<DailyTaskRepeated>): Promise<void> {
    await db.dailyTasksRepeated.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.dailyTasksRepeated.delete(id)
  },

  async recordAnswer(id: string, answer: TaskAnswer): Promise<void> {
    const entity = await db.dailyTasksRepeated.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    await db.dailyTasksRepeated.update(id, {
      answers: updatedAnswers,
      lastShownAt: new Date()
    })
  },

  async getDueCandidates(): Promise<DailyTaskRepeated[]> {
    const entities = await db.dailyTasksRepeated.toArray()
    const now = startOfDay(new Date())

    return entities.filter(entity => {
      if (!entity.lastShownAt) return true
      const lastShown = startOfDay(new Date(entity.lastShownAt))
      return differenceInDays(now, lastShown) >= entity.interval
    })
  }
}
