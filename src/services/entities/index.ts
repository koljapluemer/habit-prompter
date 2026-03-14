import { db } from '@/db'
import type { Prompt, TextAnswer } from '@/db'
import { startOfDay, differenceInDays } from './utils'

export { startOfDay, differenceInDays, parseYYMMDD } from './utils'

export const promptService = {
  async getAll(): Promise<Prompt[]> {
    return db.prompts.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<Prompt | undefined> {
    return db.prompts.get(id)
  },

  async create(entity: Omit<Prompt, 'id'>): Promise<string> {
    return db.prompts.add(entity) as Promise<string>
  },

  async update(id: string, changes: Partial<Prompt>): Promise<void> {
    await db.prompts.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.prompts.delete(id)
  },

  async recordAnswer(id: string, answer: TextAnswer): Promise<void> {
    const entity = await db.prompts.get(id)
    if (!entity) return
    await db.prompts.update(id, {
      answers: [...entity.answers, answer],
      lastShownAt: new Date()
    })
  },

  async getDueCandidates(): Promise<Prompt[]> {
    const entities = await db.prompts.toArray()
    const now = startOfDay(new Date())
    return entities.filter(entity => {
      if (!entity.lastShownAt) return true
      const lastShown = startOfDay(new Date(entity.lastShownAt))
      return differenceInDays(now, lastShown) >= entity.interval
    })
  }
}
