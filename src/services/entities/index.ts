import type { Entity } from '@/db'
import { promptTextService } from './promptText'
import { promptTextHighPrioService } from './promptTextHighPrio'
import { promptYesOrNoService } from './promptYesOrNo'
import { dailyTaskOnceService } from './dailyTaskOnce'
import { dailyTaskOnceDelayedUntilService } from './dailyTaskOnceDelayedUntil'
import { dailyTaskOnceDelayedByDaysService } from './dailyTaskOnceDelayedByDays'
import { dailyTaskRepeatedService } from './dailyTaskRepeated'
import { dailyTaskRepeatedDelayedUntilService } from './dailyTaskRepeatedDelayedUntil'
import { dailyTaskRepeatedDelayedByDaysService } from './dailyTaskRepeatedDelayedByDays'

// Re-export individual services
export {
  promptTextService,
  promptTextHighPrioService,
  promptYesOrNoService,
  dailyTaskOnceService,
  dailyTaskOnceDelayedUntilService,
  dailyTaskOnceDelayedByDaysService,
  dailyTaskRepeatedService,
  dailyTaskRepeatedDelayedUntilService,
  dailyTaskRepeatedDelayedByDaysService
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
      promptsYesOrNo,
      dailyTasksOnce,
      dailyTasksOnceDelayedUntil,
      dailyTasksOnceDelayedByDays,
      dailyTasksRepeated,
      dailyTasksRepeatedDelayedUntil,
      dailyTasksRepeatedDelayedByDays
    ] = await Promise.all([
      promptTextService.getAll(),
      promptTextHighPrioService.getAll(),
      promptYesOrNoService.getAll(),
      dailyTaskOnceService.getAll(),
      dailyTaskOnceDelayedUntilService.getAll(),
      dailyTaskOnceDelayedByDaysService.getAll(),
      dailyTaskRepeatedService.getAll(),
      dailyTaskRepeatedDelayedUntilService.getAll(),
      dailyTaskRepeatedDelayedByDaysService.getAll()
    ])

    return [
      ...promptsText,
      ...promptsTextHighPrio,
      ...promptsYesOrNo,
      ...dailyTasksOnce,
      ...dailyTasksOnceDelayedUntil,
      ...dailyTasksOnceDelayedByDays,
      ...dailyTasksRepeated,
      ...dailyTasksRepeatedDelayedUntil,
      ...dailyTasksRepeatedDelayedByDays
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  /**
   * Get all due candidates, grouped by category for MainView queue logic
   */
  async getAllDueCandidates() {
    const [
      promptsText,
      promptsTextHighPrio,
      promptsYesOrNo,
      dailyTasksOnce,
      dailyTasksOnceDelayedUntil,
      dailyTasksOnceDelayedByDays,
      dailyTasksRepeated,
      dailyTasksRepeatedDelayedUntil,
      dailyTasksRepeatedDelayedByDays
    ] = await Promise.all([
      promptTextService.getDueCandidates(),
      promptTextHighPrioService.getDueCandidates(),
      promptYesOrNoService.getDueCandidates(),
      dailyTaskOnceService.getDueCandidates(),
      dailyTaskOnceDelayedUntilService.getDueCandidates(),
      dailyTaskOnceDelayedByDaysService.getDueCandidates(),
      dailyTaskRepeatedService.getDueCandidates(),
      dailyTaskRepeatedDelayedUntilService.getDueCandidates(),
      dailyTaskRepeatedDelayedByDaysService.getDueCandidates()
    ])

    return {
      promptsText,
      promptsTextHighPrio,
      promptsYesOrNo,
      dailyTasks: [
        ...dailyTasksOnce,
        ...dailyTasksOnceDelayedUntil,
        ...dailyTasksOnceDelayedByDays,
        ...dailyTasksRepeated,
        ...dailyTasksRepeatedDelayedUntil,
        ...dailyTasksRepeatedDelayedByDays
      ]
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
      case 'daily-task-once':
        await dailyTaskOnceService.delete(entity.id)
        break
      case 'daily-task-once-delayed-until':
        await dailyTaskOnceDelayedUntilService.delete(entity.id)
        break
      case 'daily-task-once-delayed-by-days':
        await dailyTaskOnceDelayedByDaysService.delete(entity.id)
        break
      case 'daily-task-repeated':
        await dailyTaskRepeatedService.delete(entity.id)
        break
      case 'daily-task-repeated-delayed-until':
        await dailyTaskRepeatedDelayedUntilService.delete(entity.id)
        break
      case 'daily-task-repeated-delayed-by-days':
        await dailyTaskRepeatedDelayedByDaysService.delete(entity.id)
        break
    }
  }
}
