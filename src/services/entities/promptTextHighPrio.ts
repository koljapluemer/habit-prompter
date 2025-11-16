import { db } from '@/db'
import type { PromptTextHighPrio, TextAnswer } from '@/db'
import type { EntityService } from './types'
import { startOfDay } from './utils'

export const promptTextHighPrioService: EntityService<PromptTextHighPrio> = {
  async getAll(): Promise<PromptTextHighPrio[]> {
    return db.promptsTextHighPrio.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<PromptTextHighPrio | undefined> {
    return db.promptsTextHighPrio.get(id)
  },

  async create(entity: Omit<PromptTextHighPrio, 'id'>): Promise<string> {
    const id = await db.promptsTextHighPrio.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<PromptTextHighPrio>): Promise<void> {
    await db.promptsTextHighPrio.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.promptsTextHighPrio.delete(id)
  },

  async recordAnswer(id: string, answer: TextAnswer): Promise<void> {
    const entity = await db.promptsTextHighPrio.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    await db.promptsTextHighPrio.update(id, {
      answers: updatedAnswers,
      lastShownAt: new Date()
    })
  },

  async getDueCandidates(): Promise<PromptTextHighPrio[]> {
    const entities = await db.promptsTextHighPrio.toArray()
    const today = startOfDay(new Date()).getTime()

    // Show once per day
    return entities.filter(entity => {
      if (!entity.lastShownAt) return true
      const lastShown = startOfDay(new Date(entity.lastShownAt)).getTime()
      return today > lastShown
    })
  }
}
