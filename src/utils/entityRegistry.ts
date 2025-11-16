import type { Component } from 'vue'
import type { EntityType, Entity } from '@/db'
import type { EntityService } from '@/services/database'

// Import interaction components
import PromptTextInteraction from '@/components/interactions/PromptTextInteraction.vue'
import PromptYesNoInteraction from '@/components/interactions/PromptYesNoInteraction.vue'
import DailyTaskInteraction from '@/components/interactions/DailyTaskInteraction.vue'

// Import form components
import PromptTextForm from '@/components/forms/PromptTextForm.vue'
import PromptTextHighPrioForm from '@/components/forms/PromptTextHighPrioForm.vue'
import PromptYesNoForm from '@/components/forms/PromptYesNoForm.vue'
import DailyTaskOnceForm from '@/components/forms/DailyTaskOnceForm.vue'
import DailyTaskOnceDelayedUntilForm from '@/components/forms/DailyTaskOnceDelayedUntilForm.vue'
import DailyTaskOnceDelayedByDaysForm from '@/components/forms/DailyTaskOnceDelayedByDaysForm.vue'
import DailyTaskRepeatedForm from '@/components/forms/DailyTaskRepeatedForm.vue'
import DailyTaskRepeatedDelayedUntilForm from '@/components/forms/DailyTaskRepeatedDelayedUntilForm.vue'
import DailyTaskRepeatedDelayedByDaysForm from '@/components/forms/DailyTaskRepeatedDelayedByDaysForm.vue'

// Import services
import {
  promptTextService,
  promptTextHighPrioService,
  promptYesOrNoService,
  dailyTaskOnceService,
  dailyTaskOnceDelayedUntilService,
  dailyTaskOnceDelayedByDaysService,
  dailyTaskRepeatedService,
  dailyTaskRepeatedDelayedUntilService,
  dailyTaskRepeatedDelayedByDaysService
} from '@/services/database'

// ============================================================================
// Entity Type Configuration
// ============================================================================

export interface EntityTypeConfig {
  displayName: string
  description: string
  formComponent: Component
  interactionComponent: Component
  service: EntityService<any>
}

export const ENTITY_REGISTRY: Record<EntityType, EntityTypeConfig> = {
  'prompt-text': {
    displayName: 'Prompt: Text',
    description: 'Regular text prompt with interval',
    formComponent: PromptTextForm,
    interactionComponent: PromptTextInteraction,
    service: promptTextService
  },
  'prompt-text-high-prio': {
    displayName: 'Prompt: Text (High Priority)',
    description: 'Daily high-priority text prompt',
    formComponent: PromptTextHighPrioForm,
    interactionComponent: PromptTextInteraction, // Reuse same interaction component
    service: promptTextHighPrioService
  },
  'prompt-yes-no': {
    displayName: 'Prompt: Yes/No',
    description: 'Yes/No/Kind-of question with interval',
    formComponent: PromptYesNoForm,
    interactionComponent: PromptYesNoInteraction,
    service: promptYesOrNoService
  },
  'daily-task-once': {
    displayName: 'Daily Task: Once',
    description: 'One-time task',
    formComponent: DailyTaskOnceForm,
    interactionComponent: DailyTaskInteraction,
    service: dailyTaskOnceService
  },
  'daily-task-once-delayed-until': {
    displayName: 'Daily Task: Once (Delayed Until)',
    description: 'One-time task starting on a specific date',
    formComponent: DailyTaskOnceDelayedUntilForm,
    interactionComponent: DailyTaskInteraction,
    service: dailyTaskOnceDelayedUntilService
  },
  'daily-task-once-delayed-by-days': {
    displayName: 'Daily Task: Once (Delayed By Days)',
    description: 'One-time task starting after N days',
    formComponent: DailyTaskOnceDelayedByDaysForm,
    interactionComponent: DailyTaskInteraction,
    service: dailyTaskOnceDelayedByDaysService
  },
  'daily-task-repeated': {
    displayName: 'Daily Task: Repeated',
    description: 'Recurring task with interval',
    formComponent: DailyTaskRepeatedForm,
    interactionComponent: DailyTaskInteraction,
    service: dailyTaskRepeatedService
  },
  'daily-task-repeated-delayed-until': {
    displayName: 'Daily Task: Repeated (Delayed Until)',
    description: 'Recurring task starting on a specific date',
    formComponent: DailyTaskRepeatedDelayedUntilForm,
    interactionComponent: DailyTaskInteraction,
    service: dailyTaskRepeatedDelayedUntilService
  },
  'daily-task-repeated-delayed-by-days': {
    displayName: 'Daily Task: Repeated (Delayed By Days)',
    description: 'Recurring task starting after N days',
    formComponent: DailyTaskRepeatedDelayedByDaysForm,
    interactionComponent: DailyTaskInteraction,
    service: dailyTaskRepeatedDelayedByDaysService
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getEntityConfig(type: EntityType): EntityTypeConfig {
  return ENTITY_REGISTRY[type]
}

export function getEntityService(type: EntityType): EntityService<any> {
  return ENTITY_REGISTRY[type].service
}

export function getFormComponent(type: EntityType): Component {
  return ENTITY_REGISTRY[type].formComponent
}

export function getInteractionComponent(type: EntityType): Component {
  return ENTITY_REGISTRY[type].interactionComponent
}

export function getDisplayName(type: EntityType): string {
  return ENTITY_REGISTRY[type].displayName
}

export function recordEntityAnswer(entity: Entity, answer: any): Promise<void> {
  if (!entity.id) return Promise.resolve()
  const service = getEntityService(entity.type)
  return service.recordAnswer(entity.id, answer)
}
