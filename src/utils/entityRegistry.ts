import type { Component } from 'vue'
import type { EntityType, Entity } from '@/db'
import type { EntityService } from '@/services/database'

// Import interaction components
import PromptTextInteraction from '@/components/interactions/PromptTextInteraction.vue'
import PromptYesNoInteraction from '@/components/interactions/PromptYesNoInteraction.vue'

// Import form components
import PromptTextForm from '@/components/forms/PromptTextForm.vue'
import PromptTextHighPrioForm from '@/components/forms/PromptTextHighPrioForm.vue'
import PromptYesNoForm from '@/components/forms/PromptYesNoForm.vue'

// Import services
import {
  promptTextService,
  promptTextHighPrioService,
  promptYesOrNoService
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
    interactionComponent: PromptTextInteraction,
    service: promptTextHighPrioService
  },
  'prompt-yes-no': {
    displayName: 'Prompt: Yes/No',
    description: 'Yes/No/Kind-of question with interval',
    formComponent: PromptYesNoForm,
    interactionComponent: PromptYesNoInteraction,
    service: promptYesOrNoService
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
