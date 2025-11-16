import { db } from '@/db'
import type { PromptYesOrNo, YesNoAnswer } from '@/db'
import type { EntityService } from './types'
import { startOfDay, differenceInDays } from './utils'

export const promptYesOrNoService: EntityService<PromptYesOrNo> = {
  async getAll(): Promise<PromptYesOrNo[]> {
    return db.promptsYesOrNo.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<PromptYesOrNo | undefined> {
    return db.promptsYesOrNo.get(id)
  },

  async create(entity: Omit<PromptYesOrNo, 'id'>): Promise<string> {
    const id = await db.promptsYesOrNo.add(entity)
    return id as string
  },

  async update(id: string, changes: Partial<PromptYesOrNo>): Promise<void> {
    await db.promptsYesOrNo.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.promptsYesOrNo.delete(id)
  },

  async recordAnswer(id: string, answer: YesNoAnswer): Promise<void> {
    const entity = await db.promptsYesOrNo.get(id)
    if (!entity) return

    const updatedAnswers = [...entity.answers, answer]
    await db.promptsYesOrNo.update(id, {
      answers: updatedAnswers,
      lastShownAt: new Date()
    })
  },

  async getDueCandidates(): Promise<PromptYesOrNo[]> {
    const entities = await db.promptsYesOrNo.toArray()
    const now = startOfDay(new Date())

    return entities.filter(entity => {
      if (!entity.lastShownAt) return true
      const lastShown = startOfDay(new Date(entity.lastShownAt))
      return differenceInDays(now, lastShown) >= entity.interval
    })
  }
}
