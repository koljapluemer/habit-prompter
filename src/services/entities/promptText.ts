import { db } from '@/db'
import type { PromptText, TextAnswer } from '@/db'
import type { EntityService } from './types'
import { startOfDay, differenceInDays } from './utils'

export const promptTextService: EntityService<PromptText> = {
  async getAll(): Promise<PromptText[]> {
    return db.promptsText.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<PromptText | undefined> {
    return db.promptsText.get(id)
  },

  async create(entity: Omit<PromptText, 'id'>): Promise<string> {
    const id = await db.promptsText.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<PromptText>): Promise<void> {
    await db.promptsText.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.promptsText.delete(id)
  },

  async recordAnswer(id: string, answer: TextAnswer): Promise<void> {
    const entity = await db.promptsText.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    await db.promptsText.update(id, {
      answers: updatedAnswers,
      lastShownAt: new Date()
    })
  },

  async getDueCandidates(): Promise<PromptText[]> {
    const entities = await db.promptsText.toArray()
    const now = startOfDay(new Date())

    return entities.filter(entity => {
      if (!entity.lastShownAt) return true
      const lastShown = startOfDay(new Date(entity.lastShownAt))
      return differenceInDays(now, lastShown) >= entity.interval
    })
  }
}
