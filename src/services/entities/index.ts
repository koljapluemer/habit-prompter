import type { Entity } from '@/db'
import { promptTextService } from './promptText'
import { promptTextHighPrioService } from './promptTextHighPrio'
import { promptYesOrNoService } from './promptYesOrNo'

// Re-export individual services
export {
  promptTextService,
  promptTextHighPrioService,
  promptYesOrNoService
}

// Re-export types and utilities
export type { EntityService } from './types'
export { startOfDay, differenceInDays, parseYYMMDD } from './utils'

// ============================================================================
// Aggregated Entity Service
// ============================================================================

export const entityService = {
  /**
   * Get all entities from all tables, sorted by creation date
   */
  async getAllEntities(): Promise<Entity[]> {
    const [
      promptsText,
      promptsTextHighPrio,
      promptsYesOrNo
    ] = await Promise.all([
      promptTextService.getAll(),
      promptTextHighPrioService.getAll(),
      promptYesOrNoService.getAll()
    ])

    return [
      ...promptsText,
      ...promptsTextHighPrio,
      ...promptsYesOrNo
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  /**
   * Get all due candidates, grouped by category for MainView queue logic
   */
  async getAllDueCandidates() {
    const [
      promptsText,
      promptsTextHighPrio,
      promptsYesOrNo
    ] = await Promise.all([
      promptTextService.getDueCandidates(),
      promptTextHighPrioService.getDueCandidates(),
      promptYesOrNoService.getDueCandidates()
    ])

    return {
      promptsText,
      promptsTextHighPrio,
      promptsYesOrNo
    }
  },

  /**
   * Delete any entity by dispatching to the appropriate service
   */
  async deleteEntity(entity: Entity): Promise<void> {
    if (!entity.id) return

    switch (entity.type) {
      case 'prompt-text':
        await promptTextService.delete(entity.id)
        break
      case 'prompt-text-high-prio':
        await promptTextHighPrioService.delete(entity.id)
        break
      case 'prompt-yes-no':
        await promptYesOrNoService.delete(entity.id)
        break
    }
  }
}
