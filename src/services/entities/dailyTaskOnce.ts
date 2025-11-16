import { db } from '@/db'
import type { DailyTaskOnce, TaskAnswer } from '@/db'
import type { EntityService } from './types'

export const dailyTaskOnceService: EntityService<DailyTaskOnce> = {
  async getAll(): Promise<DailyTaskOnce[]> {
    return db.dailyTasksOnce.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<DailyTaskOnce | undefined> {
    return db.dailyTasksOnce.get(id)
  },

  async create(entity: Omit<DailyTaskOnce, 'id'>): Promise<string> {
    const id = await db.dailyTasksOnce.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<DailyTaskOnce>): Promise<void> {
    await db.dailyTasksOnce.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.dailyTasksOnce.delete(id)
  },

  async recordAnswer(id: string, answer: TaskAnswer): Promise<void> {
    const entity = await db.dailyTasksOnce.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    const updates: Partial<DailyTaskOnce> = {
      answers: updatedAnswers,
      lastShownAt: new Date()
    }

    // Soft-delete on "already-done"
    if (answer.action === 'already-done') {
      updates.isDone = true
    }

    await db.dailyTasksOnce.update(id, updates)
  },

  async getDueCandidates(): Promise<DailyTaskOnce[]> {
    const entities = await db.dailyTasksOnce.toArray()
    return entities.filter(entity => !entity.isDone)
  }
}
